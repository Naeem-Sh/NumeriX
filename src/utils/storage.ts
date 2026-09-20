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

let syncDebounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Triggers a debounced background sync to the persistent external storage
 * located outside the project folder (e.g. ~/.numerix/calculator-data.json).
 */
export function triggerExternalSync(): void {
  if (typeof window === 'undefined') return;
  if (syncDebounceTimer) clearTimeout(syncDebounceTimer);

  syncDebounceTimer = setTimeout(async () => {
    try {
      const payload: WorkspaceBackupData = {
        version: typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '2.0.1',
        exportedAt: new Date().toISOString(),
        app: 'NumeriX Financial Calculator',
        settings: loadStoredSettings(),
        tape: loadStoredTape(),
        logo: loadStoredLogo(),
      };
      await fetch('/api/storage/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      // Offline or network unavailable: localStorage is already up-to-date
    }
  }, 350);
}

export interface StorageInfo {
  status: string;
  isExternal: boolean;
  dataDirectory: string;
  dataFile: string;
  fileExists: boolean;
  fileSizeBytes: number;
  lastSaved: string | null;
  recordsCount: number;
  homedir: string;
}

export async function fetchStorageInfo(): Promise<StorageInfo | null> {
  try {
    const res = await fetch('/api/storage/info');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function syncFromExternalStorage(): Promise<WorkspaceBackupData | null> {
  try {
    const res = await fetch('/api/storage/data');
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && json.data) {
      const externalData: WorkspaceBackupData = json.data;
      const localTape = loadStoredTape();

      // If external has data and local is empty, or external is populated
      if (localTape.length === 0 && Array.isArray(externalData.tape) && externalData.tape.length > 0) {
        saveStoredTape(externalData.tape);
        if (externalData.settings) saveStoredSettings(externalData.settings);
        if (externalData.logo) saveStoredLogo(externalData.logo);
        return externalData;
      } else if (localTape.length > 0) {
        // We have local data, ensure external file is also populated
        triggerExternalSync();
      }
      return externalData;
    } else {
      // First run or external file doesn't exist yet, seed it from local storage
      triggerExternalSync();
    }
  } catch {
    // Running purely in browser or offline
  }
  return null;
}

export function saveStoredSettings(settings: CalculatorSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    triggerExternalSync();
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
    triggerExternalSync();
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
    triggerExternalSync();
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
    version: typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '2.0.1',
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
