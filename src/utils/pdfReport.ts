import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CalculationRecord, CalculatorSettings, PrintOptions } from '../types';
import { formatAccountingNumber } from './numberFormat';
import { NUMERIX_LOGO_DATA_URL, NUMERIX_EMBLEM_DATA_URL } from './numerixLogoAsset';

export function generatePdfReport(
  records: CalculationRecord[],
  settings: CalculatorSettings,
  customOptions?: Partial<PrintOptions>
): void {
  if (records.length === 0) {
    return;
  }

  const rawPaperFormat = (customOptions?.paperSize || 'A4').toLowerCase();
  const docFormat: 'a4' | 'letter' | 'legal' =
    rawPaperFormat === 'letter' ? 'letter' : rawPaperFormat === 'legal' ? 'legal' : 'a4';
  const orientation = customOptions?.orientation || 'portrait';
  const isLandscape = orientation === 'landscape';

  const doc = new jsPDF({
    orientation: orientation,
    unit: 'mm',
    format: docFormat,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  const isGrayscale = customOptions?.colorMode === 'grayscale';
  const isInkSaver = customOptions?.colorMode === 'ink_saver';

  // Primary Theme Colors
  const primaryColor = isGrayscale || isInkSaver ? [30, 41, 59] : [15, 23, 42]; // #0F172A
  const accentColor = isGrayscale || isInkSaver ? [71, 85, 105] : [14, 116, 144]; // Cyan or Slate
  const textColor = [30, 41, 59];

  let startY = margin;

  // 1. Draw Header & Logo
  const showAppLogo = customOptions?.showLogo !== false;
  if (showAppLogo) {
    try {
      // Use official NumeriX logo
      doc.addImage(NUMERIX_LOGO_DATA_URL, 'SVG', margin, startY - 2, 34, 20.4, undefined, 'FAST');
    } catch {
      try {
        doc.addImage(NUMERIX_EMBLEM_DATA_URL, 'SVG', margin, startY, 18, 18, undefined, 'FAST');
      } catch {
        // Proceed gracefully if SVG embedding is not available
      }
    }
  }

  const headerLeftOffset = showAppLogo ? margin + 38 : margin;

  if (customOptions?.showCompanyHeader !== false) {
    // Company Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(settings.companyName || 'IOOC - Shiraz Office', headerLeftOffset, startY + 5);

    // Department & Operator
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `${settings.department || 'Finance & Accounting'} • Operator: ${settings.operatorName || 'N.Shaaeri'}`,
      headerLeftOffset,
      startY + 11
    );

    if (customOptions?.memo) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Memo: ${customOptions.memo}`, headerLeftOffset, startY + 16.5);
    }
  }

  // Title on right side
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text(customOptions?.title || 'CALCULATION AUDIT REPORT', pageWidth - margin, startY + 5, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  doc.text(`Generated: ${dateStr} ${timeStr}`, pageWidth - margin, startY + 11, { align: 'right' });

  // Watermark if requested
  if (customOptions?.watermark && customOptions.watermark !== 'NONE') {
    doc.saveGraphicsState();
    doc.setTextColor(220, 226, 235);

    if (customOptions.watermark === 'NUMERIX_IOOC') {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(32);
      doc.text('NUMERIX', pageWidth / 2, pageHeight / 2 - 8, {
        align: 'center',
        angle: isLandscape ? 30 : 45,
      });
      doc.setFontSize(22);
      doc.text('IOOC - SHIRAZ OFFICE', pageWidth / 2, pageHeight / 2 + 8, {
        align: 'center',
        angle: isLandscape ? 30 : 45,
      });
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(54);
      doc.text(customOptions.watermark, pageWidth / 2, pageHeight / 2, {
        align: 'center',
        angle: isLandscape ? 30 : 45,
      });
    }
    doc.restoreGraphicsState();
  }

  // Divider line
  startY += customOptions?.memo ? 26 : 22;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, startY, pageWidth - margin, startY);

  // 2. Metrics summary box
  if (customOptions?.showSummaryRibbon !== false) {
    startY += 4;
    let sum = 0;
    let min = records[0]?.result ?? 0;
    let max = records[0]?.result ?? 0;

    records.forEach((r) => {
      sum += r.result;
      if (r.result < min) min = r.result;
      if (r.result > max) max = r.result;
    });
    const avg = records.length > 0 ? sum / records.length : 0;

    if (!isInkSaver) {
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, startY, pageWidth - margin * 2, 15, 2, 2, 'F');
    } else {
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(margin, startY, pageWidth - margin * 2, 15, 1, 1, 'S');
    }

    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    const colStep = (pageWidth - margin * 2) / 4;
    doc.text('TOTAL ENTRIES', margin + 6, startY + 4.5);
    doc.text('CUMULATIVE SUM', margin + colStep + 6, startY + 4.5);
    doc.text('AVERAGE VALUE', margin + colStep * 2 + 6, startY + 4.5);
    doc.text('MAX VALUE', margin + colStep * 3 + 6, startY + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(records.length.toString(), margin + 6, startY + 11);
    doc.text(formatAccountingNumber(sum, settings.decimalPlaces, settings.numberFormat), margin + colStep + 6, startY + 11);
    doc.text(formatAccountingNumber(avg, settings.decimalPlaces, settings.numberFormat), margin + colStep * 2 + 6, startY + 11);
    doc.text(formatAccountingNumber(max, settings.decimalPlaces, settings.numberFormat), margin + colStep * 3 + 6, startY + 11);

    startY += 19;
  } else {
    startY += 4;
  }

  // 3. AutoTable for Calculation Tape
  const showTime = customOptions?.showTimestamps !== false;
  const showLines = customOptions?.showLineNumbers !== false;
  const showOps = customOptions?.showOperationTypes !== false;

  const tableHead: string[] = [];
  if (showLines) tableHead.push('#');
  if (showTime) tableHead.push('Time');
  tableHead.push('Mathematical Expression');
  if (showOps) tableHead.push('Type');
  tableHead.push('Result');

  const tableData = records.map((r, i) => {
    const row: string[] = [];
    if (showLines) row.push(String(i + 1).padStart(2, '0'));
    if (showTime) row.push(r.displayTime || '');
    row.push(r.expression || '');
    if (showOps) row.push(r.operationType ? r.operationType.toUpperCase().replace('_', ' ') : 'MATH');
    row.push(r.formattedResult || formatAccountingNumber(r.result, r.decimalPlaces, settings.numberFormat));
    return row;
  });

  const density = customOptions?.density || 'standard';
  const padding = density === 'compact' ? 1.8 : density === 'spacious' ? 3.5 : 2.5;
  const fontSize = density === 'compact' ? 7.5 : density === 'spacious' ? 9.5 : 8.5;

  autoTable(doc, {
    startY: startY,
    head: [tableHead],
    body: tableData,
    margin: { left: margin, right: margin, bottom: 20 },
    theme: isInkSaver ? 'plain' : 'striped',
    headStyles: {
      fillColor: isGrayscale || isInkSaver ? [51, 65, 85] : [30, 41, 59], // Slate
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: fontSize,
      halign: 'left',
      cellPadding: padding,
    },
    styles: {
      font: 'courier',
      fontSize: fontSize,
      textColor: [30, 41, 59],
      cellPadding: padding,
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    columnStyles: {
      ...(showLines ? { 0: { cellWidth: 10, halign: 'center' } } : {}),
      ...(showTime ? { [showLines ? 1 : 0]: { cellWidth: 20, halign: 'center' } } : {}),
      [tableHead.length - 1]: { cellWidth: 42, halign: 'right', fontStyle: 'bold' },
    },
    didDrawPage: (data) => {
      const pageNum = doc.getNumberOfPages();
      
      // Footer
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);

      // Left footer
      doc.text('IOOC-ShirazOffice  |  By: N.Shaaeri', margin, pageHeight - 8);

      // Right footer page number
      if (customOptions?.showPageNumbers !== false) {
        doc.text(`Page ${data.pageNumber} of ${pageNum}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
      }

      // Subtle top divider on subsequent pages
      if (data.pageNumber > 1) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text((customOptions?.title || 'CALCULATION AUDIT REPORT') + ' (CONTINUED)', margin, margin - 4);
      }
    },
  });

  // 4. Signatures if requested
  if (customOptions?.showSignatures) {
    const finalY = (doc as any).lastAutoTable.finalY + 12;
    if (finalY + 25 < pageHeight) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      
      const boxWidth = (pageWidth - margin * 2 - 20) / 2;
      doc.line(margin, finalY + 15, margin + boxWidth, finalY + 15);
      doc.text(`Prepared By: ${settings.operatorName || 'Operator'}`, margin, finalY + 19);

      doc.line(margin + boxWidth + 20, finalY + 15, pageWidth - margin, finalY + 15);
      doc.text('Approved / Verified By (Signature & Date)', margin + boxWidth + 20, finalY + 19);
    }
  }

  // Save the PDF
  const fileDate = new Date().toISOString().slice(0, 10);
  doc.save(`Calculation_Report_${fileDate}_${Date.now().toString().slice(-4)}.pdf`);
}

