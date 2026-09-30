import { CalculatorSettings, CalculationRecord } from '../types';

const SETTINGS_STORAGE_KEY = 'numerix_calc_settings';
const TAPE_STORAGE_KEY = 'numerix_calc_tape';

// In-memory zero-latency cache layer
let cachedSettings: CalculatorSettings | null = null;
let cachedTape: CalculationRecord[] | null = null;
let isCacheHydrated = false;

// Safe in-container storage wrapper for iframe & cross-origin resilience
const memoryStore: Record<string, string> = {};

const safeStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // Access denied or blocked in iframe
    }
    return memoryStore[key] ?? null;
  },
  setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // Access denied or blocked in iframe
    }
    memoryStore[key] = value;
  },
  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Access denied or blocked in iframe
    }
    delete memoryStore[key];
  },
};

export const DEFAULT_SETTINGS: CalculatorSettings = {
  decimalPlaces: 2,
  numberFormat: 'comma_dot',
  soundEnabled: true,
  soundVolume: 0.6,
  theme: 'light',
  taxRate: 15.0,
  showClock: true,
  dateFormat: 'ISO',
  companyName: '',
  department: '',
  operatorName: '',
  historyLimit: 200,
  thousandSeparator: ',',
  decimalSeparator: '.',
  workspaceLayout: 'audit-right',
  displayStyle: 'vfd_emerald',
  dualColorRibbon: true,
  uiScale: 'standard',
};

// Background persistence queues to prevent blocking JS main thread
let pendingSettingsSave: CalculatorSettings | null = null;
let settingsSaveTimeout: any = null;

let pendingTapeSave: CalculationRecord[] | null = null;
let tapeSaveTimeout: any = null;

function scheduleBackgroundSave(type: 'settings' | 'tape') {
  if (typeof window === 'undefined') return;

  if (type === 'settings') {
    if (settingsSaveTimeout) clearTimeout(settingsSaveTimeout);
    settingsSaveTimeout = setTimeout(() => {
      if (pendingSettingsSave) {
        try {
          safeStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(pendingSettingsSave));
        } catch (e) {
          console.error('Failed async settings save:', e);
        }
      }
    }, 120);
  } else if (type === 'tape') {
    if (tapeSaveTimeout) clearTimeout(tapeSaveTimeout);
    tapeSaveTimeout = setTimeout(() => {
      if (pendingTapeSave) {
        try {
          const toSave = pendingTapeSave.slice(0, 200);
          safeStorage.setItem(TAPE_STORAGE_KEY, JSON.stringify(toSave));
        } catch (e) {
          console.error('Failed async tape save:', e);
        }
      }
    }, 150);
  }
}

// Ensure pending saves flush before page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (pendingSettingsSave) {
      try {
        safeStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(pendingSettingsSave));
      } catch {}
    }
    if (pendingTapeSave) {
      try {
        safeStorage.setItem(TAPE_STORAGE_KEY, JSON.stringify(pendingTapeSave.slice(0, 200)));
      } catch {}
    }
  });
}

function hydrateCacheIfNeeded() {
  if (isCacheHydrated) return;
  isCacheHydrated = true;

  // Hydrate Settings
  try {
    const raw = safeStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const layout =
        parsed.workspaceLayout === 'audit-left' || parsed.workspaceLayout === 'audit-right'
          ? parsed.workspaceLayout
          : 'audit-right';
      const company = parsed.companyName === 'Corporate Finance' || parsed.companyName === 'IOOC - Shiraz Office' ? '' : (parsed.companyName || '');
      const operator = parsed.operatorName === 'N.Shaaeri' ? '' : (parsed.operatorName || '');
      const dept = parsed.department === 'Finance & Accounting' ? '' : (parsed.department || '');
      cachedSettings = {
        ...DEFAULT_SETTINGS,
        ...parsed,
        workspaceLayout: layout,
        companyName: company,
        operatorName: operator,
        department: dept,
      };
    } else {
      cachedSettings = { ...DEFAULT_SETTINGS };
    }
  } catch {
    cachedSettings = { ...DEFAULT_SETTINGS };
  }

  // Hydrate Tape
  try {
    const raw = safeStorage.getItem(TAPE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      cachedTape = Array.isArray(parsed) ? parsed : [];
    } else {
      cachedTape = [];
    }
  } catch {
    cachedTape = [];
  }
}

/**
 * Synchronous, zero-latency in-memory settings reader
 */
export function loadStoredSettings(): CalculatorSettings {
  hydrateCacheIfNeeded();
  return cachedSettings ? { ...cachedSettings } : { ...DEFAULT_SETTINGS };
}

/**
 * Non-blocking memory update + debounced background persistent write
 */
export function saveStoredSettings(settings: CalculatorSettings): void {
  hydrateCacheIfNeeded();
  cachedSettings = { ...settings };
  pendingSettingsSave = { ...settings };
  scheduleBackgroundSave('settings');
}

/**
 * Synchronous, zero-latency tape history reader
 */
export function loadStoredTape(): CalculationRecord[] {
  hydrateCacheIfNeeded();
  return cachedTape ? [...cachedTape] : [];
}

/**
 * Non-blocking tape save
 */
export function saveStoredTape(tape: CalculationRecord[]): void {
  hydrateCacheIfNeeded();
  cachedTape = [...tape];
  pendingTapeSave = [...tape];
  scheduleBackgroundSave('tape');
}

export interface WorkspaceBackupData {
  version: string;
  exportedAt: string;
  app: string;
  settings: CalculatorSettings;
  tape: CalculationRecord[];
}

export function createWorkspaceBackup(): WorkspaceBackupData {
  return {
    version: typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '2.3.1',
    exportedAt: new Date().toISOString(),
    app: 'NumeriX Financial Calculator',
    settings: loadStoredSettings(),
    tape: loadStoredTape(),
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

export function restoreWorkspaceBackup(jsonText: string): {
  success: boolean;
  message: string;
  data?: WorkspaceBackupData;
} {
  try {
    const parsed = JSON.parse(jsonText);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, message: 'Invalid JSON file structure.' };
    }

    const rawSettings = parsed.settings && typeof parsed.settings === 'object' ? parsed.settings : {};
    const mergedSettings: CalculatorSettings = {
      ...DEFAULT_SETTINGS,
      ...rawSettings,
    };

    const rawTape = Array.isArray(parsed.tape) ? parsed.tape : [];
    const validTape: CalculationRecord[] = rawTape.filter(
      (item: unknown): item is CalculationRecord =>
        Boolean(item && typeof item === 'object' && 'id' in item && 'result' in item)
    );

    cachedSettings = { ...mergedSettings };
    cachedTape = [...validTape];

    safeStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(mergedSettings));
    safeStorage.setItem(TAPE_STORAGE_KEY, JSON.stringify(validTape.slice(0, 200)));

    return {
      success: true,
      message: `Successfully restored ${validTape.length} audit records and settings.`,
      data: {
        version: parsed.version || '1.0.0',
        exportedAt: parsed.exportedAt || new Date().toISOString(),
        app: parsed.app || 'NumeriX',
        settings: mergedSettings,
        tape: validTape,
      },
    };
  } catch (err) {
    return { success: false, message: `Could not parse JSON backup: ${(err as Error).message}` };
  }
}
