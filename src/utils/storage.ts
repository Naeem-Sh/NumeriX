import { CalculatorSettings, CalculationRecord } from '../types';

const SETTINGS_STORAGE_KEY = 'iooc_accountant_calc_settings';
const TAPE_STORAGE_KEY = 'iooc_accountant_calc_tape';
const LOGO_STORAGE_KEY = 'iooc_accountant_calc_logo';

export const DEFAULT_SETTINGS: CalculatorSettings = {
  decimalPlaces: 2,
  numberFormat: 'comma_dot',
  soundEnabled: true,
  soundVolume: 0.5,
  theme: 'dark',
  taxRate: 15.0,
  showClock: true,
  dateFormat: 'EU',
  companyName: '',
  department: 'Finance & Accounting',
  operatorName: '',
  logoDataUrl: null,
  historyLimit: 100,
  thousandSeparator: ',',
  decimalSeparator: '.',
  workspaceLayout: 'audit-right',
  displayStyle: 'vfd_emerald',
  dualColorRibbon: true,
  uiScale: 'standard',
};

export function loadStoredSettings(): CalculatorSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveStoredSettings(settings: CalculatorSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
  }
}

export function loadStoredTape(): CalculationRecord[] {
  try {
    const raw = localStorage.getItem(TAPE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

export function saveStoredTape(tape: CalculationRecord[]): void {
  try {
    // Keep within reasonable size
    const toSave = tape.slice(0, 200);
    localStorage.setItem(TAPE_STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.error('Failed to save tape history to localStorage', e);
  }
}

export function loadStoredLogo(): string | null {
  try {
    return localStorage.getItem(LOGO_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveStoredLogo(logoDataUrl: string | null): void {
  try {
    if (logoDataUrl) {
      localStorage.setItem(LOGO_STORAGE_KEY, logoDataUrl);
    } else {
      localStorage.removeItem(LOGO_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to save logo to localStorage', e);
  }
}
