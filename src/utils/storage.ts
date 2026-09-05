import { CalculatorSettings, CalculationRecord } from '../types';

const SETTINGS_STORAGE_KEY = 'iooc_accountant_calc_settings';
const TAPE_STORAGE_KEY = 'iooc_accountant_calc_tape';
const LOGO_STORAGE_KEY = 'iooc_accountant_calc_logo';

export const DEFAULT_SETTINGS: CalculatorSettings = {
  decimalPlaces: 2,
  numberFormat: 'comma_dot',
  soundEnabled: true,
  soundVolume: 0.6,
  theme: 'light',
  taxRate: 15.0,
  showClock: true,
  dateFormat: 'EU',
  companyName: '',
  department: 'Finance & Accounting',
  operatorName: '',
  logoDataUrl: null,
  historyLimit: 200,
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
    const layout = (parsed.workspaceLayout === 'audit-left' || parsed.workspaceLayout === 'audit-right') ? parsed.workspaceLayout : 'audit-right';
    return { ...DEFAULT_SETTINGS, ...parsed, workspaceLayout: layout };
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

export interface WorkspaceBackupData {
  version: string;
  exportedAt: string;
  app: string;
  settings: CalculatorSettings;
  tape: CalculationRecord[];
  logo: string | null;
}

export function createWorkspaceBackup(): WorkspaceBackupData {
  return {
    version: '1.2.0',
    exportedAt: new Date().toISOString(),
    app: 'NumeriX Financial Calculator',
    settings: loadStoredSettings(),
    tape: loadStoredTape(),
    logo: loadStoredLogo(),
  };
}

export function downloadWorkspaceBackup(): void {
  try {
    const backup = createWorkspaceBackup();
    const jsonString = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `numerix-workspace-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to export workspace backup:', err);
  }
}

export function restoreWorkspaceBackup(jsonText: string): { success: boolean; message: string; data?: WorkspaceBackupData } {
  try {
    const parsed = JSON.parse(jsonText);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, message: 'Invalid JSON file structure.' };
    }

    // Validate settings or fallback
    const rawSettings = parsed.settings && typeof parsed.settings === 'object' ? parsed.settings : {};
    const mergedSettings: CalculatorSettings = {
      ...DEFAULT_SETTINGS,
      ...rawSettings,
    };

    // Validate tape records
    const rawTape = Array.isArray(parsed.tape) ? parsed.tape : [];
    const validTape: CalculationRecord[] = rawTape.filter(
      (item: unknown): item is CalculationRecord =>
        Boolean(item && typeof item === 'object' && 'id' in item && 'result' in item)
    );

    const logo = typeof parsed.logo === 'string' ? parsed.logo : null;

    // Persist restored elements
    saveStoredSettings(mergedSettings);
    saveStoredTape(validTape);
    saveStoredLogo(logo);

    return {
      success: true,
      message: `Successfully restored ${validTape.length} audit records and preferences.`,
      data: {
        version: parsed.version || '1.0.0',
        exportedAt: parsed.exportedAt || new Date().toISOString(),
        app: parsed.app || 'NumeriX',
        settings: mergedSettings,
        tape: validTape,
        logo,
      },
    };
  } catch (err) {
    return { success: false, message: `Could not parse JSON backup: ${(err as Error).message}` };
  }
}
