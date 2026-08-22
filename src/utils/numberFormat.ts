import { NumberFormatType } from '../types';

export function getSeparators(format: NumberFormatType): { thousand: string; decimal: string } {
  switch (format) {
    case 'dot_comma':
      return { thousand: '.', decimal: ',' };
    case 'space_dot':
      return { thousand: ' ', decimal: '.' };
    case 'apostrophe_dot':
      return { thousand: "'", decimal: '.' };
    case 'comma_dot':
    default:
      return { thousand: ',', decimal: '.' };
  }
}

/**
 * Formats a number with requested 3-digit thousand grouping and fixed/variable decimal precision.
 */
export function formatAccountingNumber(
  val: number | string,
  decimalPlaces: number = 2,
  format: NumberFormatType = 'comma_dot',
  forceDecimals: boolean = true
): string {
  if (val === '' || val === null || val === undefined) return '0';
  
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return 'Error';
  if (!isFinite(num)) return num > 0 ? 'Infinity' : '-Infinity';

  const { thousand, decimal } = getSeparators(format);
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  // Format to requested decimals
  let parts: string[];
  if (forceDecimals) {
    parts = absNum.toFixed(decimalPlaces).split('.');
  } else {
    // Dynamic decimals (up to max decimalPlaces)
    const fixed = absNum.toFixed(decimalPlaces);
    const trimmed = parseFloat(fixed).toString();
    parts = trimmed.split('.');
  }

  let integerPart = parts[0];
  const decimalPart = parts[1] || '';

  // Add 3-digit grouping to integerPart
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousand);

  let formatted = integerPart;
  if (decimalPlaces > 0 && decimalPart.length > 0) {
    formatted += decimal + decimalPart;
  } else if (decimalPlaces > 0 && forceDecimals) {
    formatted += decimal + '0'.repeat(decimalPlaces);
  }

  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Sanitizes and parses a formatted string into a standard float number or raw string
 */
export function parseFormattedNumber(input: string, format: NumberFormatType = 'comma_dot'): number {
  if (!input) return 0;
  let clean = input.trim();
  
  const { thousand, decimal } = getSeparators(format);
  
  // Remove thousand separators
  if (thousand === ' ') {
    clean = clean.replace(/\s+/g, '');
  } else if (thousand === "'") {
    clean = clean.replace(/'/g, '');
  } else {
    clean = clean.split(thousand).join('');
  }

  // Normalize decimal separator to '.'
  if (decimal !== '.') {
    clean = clean.replace(decimal, '.');
  }

  const result = parseFloat(clean);
  return isNaN(result) ? 0 : result;
}

/**
 * Intelligent sanitization and parser for financial numbers.
 * Handles mixed decimal commas/dots, accounting parentheses for negatives (e.g. (1,234.50)),
 * currency symbols ($ € £ ¥ ₹ CHF kr R$ etc), space separators, and trailing signs.
 */
export function intelligentParseFinancialNumber(rawStr: string): number | null {
  if (!rawStr || typeof rawStr !== 'string') return null;
  let clean = rawStr.trim();
  if (!clean) return null;

  // Check for accounting parentheses: e.g. (1,234.50) or [1234.50] -> negative
  let isNegative = false;
  if (/^\s*[\(\[]\s*.*\s*[\)\]]\s*$/.test(clean)) {
    isNegative = true;
    clean = clean.replace(/[\(\)\[\]]/g, '').trim();
  }

  // Trailing minus check: e.g. 1234.50-
  if (clean.endsWith('-')) {
    isNegative = true;
    clean = clean.slice(0, -1).trim();
  } else if (clean.startsWith('-') || clean.startsWith('−')) {
    isNegative = true;
    clean = clean.slice(1).trim();
  }

  // Remove common currency symbols, letters, and codes
  clean = clean.replace(/[$€£¥₹₩₽₺₴₪₫฿%CHFkrR$złTLрубIRT\s]/gi, '').trim();
  if (!clean) return null;

  // Check structure for comma and dot
  const hasDot = clean.includes('.');
  const hasComma = clean.includes(',');

  if (hasDot && hasComma) {
    const lastDotIndex = clean.lastIndexOf('.');
    const lastCommaIndex = clean.lastIndexOf(',');
    if (lastDotIndex > lastCommaIndex) {
      // US/UK style: 1,234,567.89 -> strip commas, keep dot
      clean = clean.replace(/,/g, '');
    } else {
      // European style: 1.234.567,89 -> strip dots, replace comma with dot
      clean = clean.replace(/\./g, '').replace(/,/g, '.');
    }
  } else if (hasComma && !hasDot) {
    // Only comma present:
    // e.g. "12,50" -> 12.50 vs "1,000,000" -> 1000000
    const parts = clean.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      // Likely decimal comma (e.g. 150,5 or 1234,99)
      clean = clean.replace(',', '.');
    } else if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
      // Thousands separator (e.g. 1,000 or 1,250,000)
      clean = clean.replace(/,/g, '');
    } else {
      clean = clean.replace(',', '.');
    }
  } else if (hasDot && !hasComma) {
    // Only dot present:
    const parts = clean.split('.');
    if (parts.length > 2) {
      // Multiple dots -> European thousands separator, e.g. 1.000.000
      clean = clean.replace(/\./g, '');
    }
  }

  // Clean any remaining non-digit/non-dot characters
  clean = clean.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(clean);
  if (isNaN(parsed) || !isFinite(parsed)) return null;

  return isNegative ? -Math.abs(parsed) : parsed;
}

/**
 * Parses and extracts a list of valid financial numbers from clipboard text
 * (supporting Excel rows, columns, TSV, CSV, or formatted lists).
 */
export function parseClipboardFinancialData(text: string): number[] {
  if (!text || !text.trim()) return [];
  const lines = text.split(/[\r\n\t]+/).map((l) => l.trim()).filter(Boolean);
  const results: number[] = [];

  for (const line of lines) {
    const parsed = intelligentParseFinancialNumber(line);
    if (parsed !== null) {
      results.push(parsed);
    }
  }

  return results;
}

/**
 * Formats expression for clear UI display with proper accounting symbols (×, ÷, −, +)
 */
export function formatExpressionForDisplay(rawExpr: string, format: NumberFormatType = 'comma_dot'): string {
  if (!rawExpr) return '';
  
  return rawExpr
    .replace(/\*/g, ' × ')
    .replace(/\//g, ' ÷ ')
    .replace(/\+/g, ' + ')
    .replace(/(?<=\S)-(?=\S)/g, ' − ')
    .replace(/-(?=\d)/g, '−')
    .replace(/\s+/g, ' ')
    .trim();
}
