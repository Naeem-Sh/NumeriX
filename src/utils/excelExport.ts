import * as XLSX from 'xlsx';
import { CalculationRecord, CalculatorSettings } from '../types';

export function exportTapeToExcel(
  records: CalculationRecord[],
  settings: CalculatorSettings
): void {
  if (records.length === 0) {
    alert('Tape history is empty. Make calculations before exporting.');
    return;
  }

  // 1. Prepare Meta header info
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const headerRows = [
    ['ORGANIZATION:', settings.companyName || 'IOOC - Shiraz Office'],
    ['DEPARTMENT:', settings.department || 'Finance & Accounting'],
    ['OPERATOR:', settings.operatorName || 'N.Shaaeri'],
    ['REPORT TITLE:', 'CALCULATION AUDIT & TAPE REPORT'],
    ['GENERATED ON:', `${dateStr} at ${timeStr}`],
    ['DECIMAL PRECISION DEFAULT:', `${settings.decimalPlaces} Places`],
    ['NUMBER FORMAT:', settings.numberFormat],
    [], // empty line
    [
      'Line #',
      'Date',
      'Time',
      'Expression',
      'Result (Numeric Value)',
      'Formatted Output',
      'Decimals',
      'Operation Type',
      'Audit Notes',
    ],
  ];

  // 2. Data rows
  let numericSum = 0;
  let minVal = records[0]?.result ?? 0;
  let maxVal = records[0]?.result ?? 0;

  const dataRows = records.map((rec, idx) => {
    numericSum += rec.result;
    if (rec.result < minVal) minVal = rec.result;
    if (rec.result > maxVal) maxVal = rec.result;

    return [
      idx + 1,
      rec.displayDate || '',
      rec.displayTime || '',
      rec.expression || '',
      rec.result, // pure numeric cell for Excel calculations!
      rec.formattedResult || '',
      rec.decimalPlaces,
      rec.operationType || 'arithmetic',
      rec.note || '',
    ];
  });

  // 3. Summary / Totals rows
  const summaryRows = [
    [],
    ['=== AUDIT SUMMARY ==='],
    ['Total Records', records.length],
    ['Sum of Results', numericSum],
    ['Average Result', records.length > 0 ? numericSum / records.length : 0],
    ['Maximum Value', maxVal],
    ['Minimum Value', minVal],
    [],
    ['FOOTER SIGNATURE:', 'IOOC-ShirazOffice | By: N.Shaaeri'],
  ];

  const fullSheetData = [...headerRows, ...dataRows, ...summaryRows];

  // Create workbook and worksheet
  const ws = XLSX.utils.aoa_to_sheet(fullSheetData);

  // Set column widths for readability
  ws['!cols'] = [
    { wch: 8 },  // Line #
    { wch: 14 }, // Date
    { wch: 12 }, // Time
    { wch: 30 }, // Expression
    { wch: 22 }, // Result (Numeric)
    { wch: 22 }, // Formatted Output
    { wch: 10 }, // Decimals
    { wch: 16 }, // Operation Type
    { wch: 24 }, // Audit Notes
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Calculation Tape');

  // File naming
  const fileDate = new Date().toISOString().slice(0, 10);
  const fileName = `Accounting_Tape_${fileDate}_${Date.now().toString().slice(-4)}.xlsx`;

  XLSX.writeFile(wb, fileName);
}
