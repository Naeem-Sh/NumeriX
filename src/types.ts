export type NumberFormatType = 'comma_dot' | 'dot_comma' | 'space_dot' | 'apostrophe_dot';
export type AppTheme = 'dark' | 'light';
export type DateFormatType = 'EU' | 'US' | 'ISO';
export type WorkspaceLayout = 'audit-right' | 'audit-left';
export type DisplayStyle = 'vfd_emerald' | 'amber_glow' | 'oled_ice' | 'classic_lcd';
export type UiScale = 'compact' | 'standard' | 'expanded';

export interface CalculationRecord {
  id: string;
  timestamp: string; // ISO string
  displayTime: string;
  displayDate: string;
  expression: string;
  rawExpression: string;
  result: number;
  formattedResult: string;
  decimalPlaces: number;
  operationType?: 'arithmetic' | 'tax_plus' | 'tax_minus' | 'percentage' | 'margin' | 'markup' | 'discount' | 'memory' | 'subtotal' | 'grand_total';
  note?: string;
}

export interface CalculatorSettings {
  decimalPlaces: number; // 0 to 8
  numberFormat: NumberFormatType;
  soundEnabled: boolean;
  soundVolume: number; // 0.1 to 1.0
  theme: AppTheme;
  taxRate: number; // percentage, e.g. 15
  showClock: boolean;
  dateFormat: DateFormatType;
  companyName: string;
  department: string;
  operatorName: string;
  logoDataUrl: string | null;
  historyLimit: number;
  thousandSeparator: string;
  decimalSeparator: string;
  workspaceLayout: WorkspaceLayout;
  displayStyle: DisplayStyle;
  dualColorRibbon: boolean;
  uiScale: UiScale;
}

export interface TapeSummary {
  count: number;
  sum: number;
  average: number;
  max: number;
  min: number;
}

export type PrintPaperSize = 'A4' | 'Letter' | 'Legal' | 'Receipt';
export type PrintOrientation = 'portrait' | 'landscape';
export type PrintColorMode = 'color' | 'grayscale' | 'ink_saver';
export type PrintDensity = 'compact' | 'standard' | 'spacious';
export type PrintWatermark = 'NONE' | 'NUMERIX_IOOC' | 'CONFIDENTIAL' | 'DRAFT' | 'AUDITED' | 'APPROVED' | 'COPY';

export interface PrintOptions {
  paperSize: PrintPaperSize;
  orientation: PrintOrientation;
  colorMode: PrintColorMode;
  density: PrintDensity;
  scale: number; // 75 to 125 (%)
  title: string;
  memo: string;
  showLogo: boolean;
  showCompanyHeader: boolean;
  showSummaryRibbon: boolean;
  showTimestamps: boolean;
  showLineNumbers: boolean;
  showOperationTypes: boolean;
  showNotes: boolean;
  showSignatures: boolean;
  showPageNumbers: boolean;
  watermark: PrintWatermark;
}
