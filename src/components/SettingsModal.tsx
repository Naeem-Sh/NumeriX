import React, { useRef, useState } from 'react';
import { CalculatorSettings, AppTheme, NumberFormatType, DateFormatType, WorkspaceLayout, DisplayStyle } from '../types';
import {
  X,
  Volume2,
  Palette,
  Hash,
  Percent,
  Clock,
  Building2,
  User,
  RotateCcw,
  PanelRight,
  PanelLeft,
  Sparkles,
  CheckCircle2,
  Download,
  Upload,
  ShieldCheck,
  Tv,
} from 'lucide-react';
import { playKeySound } from '../utils/audio';
import {
  WorkspaceBackupData,
  downloadWorkspaceBackup,
  restoreWorkspaceBackup,
} from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CalculatorSettings;
  onUpdateSettings: (newSettings: Partial<CalculatorSettings>) => void;
  onResetDefaults: () => void;
  onRestoreWorkspace?: (backup: WorkspaceBackupData) => void;
  onReplaySplash?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetDefaults,
  onRestoreWorkspace,
  onReplaySplash,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoreStatus, setRestoreStatus] = useState<{ message: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const isLight = settings.theme === 'light';

  const handleTestSound = () => {
    playKeySound('enter', settings.soundVolume);
  };

  const handleExportBackup = () => {
    playKeySound('action', settings.soundVolume);
    downloadWorkspaceBackup();
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const result = restoreWorkspaceBackup(text);
      if (result.success && result.data) {
        setRestoreStatus({ message: result.message, isError: false });
        playKeySound('enter', settings.soundVolume);
        if (onRestoreWorkspace) {
          onRestoreWorkspace(result.data);
        } else {
          onUpdateSettings(result.data.settings);
        }
      } else {
        setRestoreStatus({ message: result.message || 'Failed to restore backup.', isError: true });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div
        id="settings-modal-dialog"
        className={`w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          isLight ? 'bg-[#fcfbf9] border-stone-300 text-stone-900' : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-3.5 border-b ${
            isLight ? 'border-stone-200 bg-[#f5f3ef]' : 'border-slate-800 bg-slate-950/60'
          }`}
        >
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-sm sm:text-base font-bold tracking-tight">Calculator Preferences</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLight ? 'hover:bg-stone-200 text-stone-500 hover:text-stone-900' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs sm:text-sm" style={{ scrollbarWidth: 'thin' }}>
          {/* Quick Presets */}
          <div
            className={`p-3.5 rounded-xl border space-y-2 ${
              isLight ? 'border-cyan-200 bg-cyan-50/50' : 'border-cyan-500/20 bg-cyan-950/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold text-xs text-cyan-700 dark:text-cyan-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>1-Click Presets</span>
              </span>
              <span className={`text-[10px] ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>Instant setup</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { name: '🏢 Standard', sub: '2 Dec • 1,234.56', dec: 2, fmt: 'comma_dot' as NumberFormatType, tax: 15.0 },
                { name: '💵 Whole Numbers', sub: '0 Dec • 1,234', dec: 0, fmt: 'comma_dot' as NumberFormatType, tax: 0.0 },
                { name: '🔬 High Precision', sub: '4 Dec • 1,234.5678', dec: 4, fmt: 'comma_dot' as NumberFormatType, tax: 15.0 },
                { name: '🇪🇺 European', sub: '2 Dec • 1.234,56', dec: 2, fmt: 'dot_comma' as NumberFormatType, tax: 20.0 },
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    playKeySound('action', settings.soundVolume);
                    onUpdateSettings({ decimalPlaces: p.dec, numberFormat: p.fmt, taxRate: p.tax });
                  }}
                  className={`p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                    settings.decimalPlaces === p.dec && settings.numberFormat === p.fmt
                      ? isLight
                        ? 'border-cyan-600 bg-cyan-100 font-bold text-cyan-950 shadow-xs'
                        : 'border-cyan-500 bg-cyan-500/20 font-bold text-cyan-300'
                      : isLight
                      ? 'border-stone-200 bg-white hover:bg-stone-50 text-stone-800'
                      : 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <p className="font-bold text-[11px]">{p.name}</p>
                  <p className={`text-[9px] mt-0.5 ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>{p.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Theme & Workspace Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Theme Toggle */}
            <div>
              <label className="flex items-center gap-1.5 font-bold mb-1.5 text-xs">
                <Palette className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>Interface Theme</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'light', name: 'Light Executive' },
                  { id: 'dark', name: 'Dark Obsidian' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onUpdateSettings({ theme: t.id as AppTheme })}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                      settings.theme === t.id
                        ? isLight
                          ? 'bg-cyan-100 border-cyan-600 text-cyan-950 shadow-xs'
                          : 'bg-cyan-500/20 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500/40'
                        : isLight
                        ? 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Toggle */}
            <div>
              <label className="flex items-center gap-1.5 font-bold mb-1.5 text-xs">
                <PanelRight className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>Workspace Layout</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'audit-right', name: 'Keypad Left (Default)' },
                  { id: 'audit-left', name: 'Audit Left (Classic)' },
                ].map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => onUpdateSettings({ workspaceLayout: l.id as WorkspaceLayout })}
                    className={`py-2 px-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                      (settings.workspaceLayout || 'audit-right') === l.id
                        ? isLight
                          ? 'bg-cyan-100 border-cyan-600 text-cyan-950 shadow-xs'
                          : 'bg-cyan-500/20 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500/40'
                        : isLight
                        ? 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    {l.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Display Glow Style */}
          <div>
            <label className="flex items-center gap-1.5 font-bold mb-1.5 text-xs">
              <Tv className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Digital Display Glow</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { id: 'vfd_emerald', name: 'VFD Emerald', preview: 'text-emerald-400' },
                { id: 'amber_glow', name: 'Amber Glow', preview: 'text-amber-400' },
                { id: 'oled_ice', name: 'OLED Ice Cyan', preview: 'text-cyan-400' },
                { id: 'classic_lcd', name: 'Classic LCD', preview: 'text-slate-300' },
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => onUpdateSettings({ displayStyle: style.id as DisplayStyle })}
                  className={`py-2 px-2 rounded-lg border text-xs font-bold transition-all cursor-pointer text-center ${
                    settings.displayStyle === style.id
                      ? isLight
                        ? 'bg-cyan-100 border-cyan-600 text-cyan-950 shadow-xs'
                        : 'bg-cyan-500/20 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500/40'
                      : isLight
                      ? 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <span className={`font-mono ${style.preview}`}>●</span> {style.name}
                </button>
              ))}
            </div>
          </div>

          {/* Number Format & Decimal Precision */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 font-bold mb-1.5 text-xs">
                <Hash className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>Decimal Precision (0–8)</span>
              </label>
              <div className="flex items-center gap-1.5">
                {[0, 2, 3, 4, 6].map((dec) => (
                  <button
                    key={dec}
                    type="button"
                    onClick={() => onUpdateSettings({ decimalPlaces: dec })}
                    className={`flex-1 py-1.5 rounded-lg border font-mono font-bold text-xs transition-all cursor-pointer ${
                      settings.decimalPlaces === dec
                        ? isLight
                          ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs'
                          : 'bg-cyan-500 text-slate-950 border-cyan-500'
                        : isLight
                        ? 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    .{dec}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1.5 font-bold mb-1.5 text-xs">
                <Hash className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>Number Format</span>
              </label>
              <select
                value={settings.numberFormat}
                onChange={(e) => onUpdateSettings({ numberFormat: e.target.value as NumberFormatType })}
                className={`w-full p-2 rounded-lg border text-xs outline-none cursor-pointer ${
                  isLight
                    ? 'bg-white border-stone-200 text-stone-900 shadow-2xs'
                    : 'bg-slate-800 border-slate-700 text-slate-100'
                }`}
              >
                <option value="comma_dot">1,234,567.89 (Standard US/UK)</option>
                <option value="dot_comma">1.234.567,89 (European Style)</option>
                <option value="space_dot">1 234 567.89 (SI / Metric Space)</option>
                <option value="apostrophe_dot">1'234'567.89 (Swiss Style)</option>
              </select>
            </div>
          </div>

          {/* Tax Rate & Date Display Format */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 font-bold mb-1.5 text-xs">
                <Percent className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
                <span>Default Tax Rate (%)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  value={settings.taxRate}
                  onChange={(e) => onUpdateSettings({ taxRate: parseFloat(e.target.value) || 0 })}
                  className={`w-full p-2 rounded-lg border font-mono text-xs outline-none ${
                    isLight
                      ? 'bg-white border-stone-200 text-stone-900 shadow-2xs'
                      : 'bg-slate-800 border-slate-700 text-slate-100'
                  }`}
                />
                <span className={`absolute right-3 top-2 font-bold text-xs ${isLight ? 'text-stone-400' : 'text-slate-500'}`}>%</span>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1.5 font-bold mb-1.5 text-xs">
                <Clock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>Date Display Format</span>
              </label>
              <select
                value={settings.dateFormat}
                onChange={(e) => onUpdateSettings({ dateFormat: e.target.value as DateFormatType })}
                className={`w-full p-2 rounded-lg border text-xs outline-none cursor-pointer ${
                  isLight
                    ? 'bg-white border-stone-200 text-stone-900 shadow-2xs'
                    : 'bg-slate-800 border-slate-700 text-slate-100'
                }`}
              >
                <option value="ISO">2026-08-22 (ISO Standard)</option>
                <option value="EU">22 AUG 2026 (EU Style)</option>
                <option value="US">AUG 22, 2026 (US Style)</option>
              </select>
            </div>
          </div>

          {/* Sound Feedback */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
              isLight ? 'bg-white border-stone-200' : 'bg-slate-800/60 border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <div>
                <p className="font-bold text-xs">Enter Sound Feedback</p>
                <p className={`text-[10px] ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>
                  Plays audio chime on Enter key calculations
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
                className="w-4 h-4 accent-cyan-600 cursor-pointer"
              />
              {settings.soundEnabled && (
                <button
                  type="button"
                  onClick={handleTestSound}
                  className={`px-2 py-1 text-[11px] font-semibold rounded border cursor-pointer ${
                    isLight
                      ? 'border-cyan-300 bg-cyan-50 text-cyan-900 hover:bg-cyan-100'
                      : 'border-cyan-700 bg-cyan-950/50 text-cyan-300 hover:bg-cyan-900'
                  }`}
                >
                  Test
                </button>
              )}
            </div>
          </div>

          {/* Organization & Header Metadata for Print/Reports */}
          <div className={`space-y-2.5 pt-2 border-t ${isLight ? 'border-stone-200' : 'border-slate-800'}`}>
            <h3 className={`font-bold text-[11px] uppercase tracking-wider ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>
              Report & Print Header Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className={`flex items-center gap-1 text-[11px] mb-1 ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>
                  <Building2 className="w-3 h-3" /> Company / Organization
                </label>
                <input
                  type="text"
                  value={settings.companyName}
                  onChange={(e) => onUpdateSettings({ companyName: e.target.value })}
                  placeholder="e.g. Acme Corporation"
                  className={`w-full p-2 rounded-lg border text-xs outline-none ${
                    isLight
                      ? 'bg-white border-stone-200 text-stone-900'
                      : 'bg-slate-800 border-slate-700 text-slate-100'
                  }`}
                />
              </div>

              <div>
                <label className={`flex items-center gap-1 text-[11px] mb-1 ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>
                  <User className="w-3 h-3" /> Operator / Accountant Name
                </label>
                <input
                  type="text"
                  value={settings.operatorName}
                  onChange={(e) => onUpdateSettings({ operatorName: e.target.value })}
                  placeholder="e.g. John Doe"
                  className={`w-full p-2 rounded-lg border text-xs outline-none ${
                    isLight
                      ? 'bg-white border-stone-200 text-stone-900'
                      : 'bg-slate-800 border-slate-700 text-slate-100'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Backup & Restore Section */}
          <div
            className={`p-3.5 rounded-xl border space-y-2.5 ${
              isLight ? 'bg-[#f5f3ef] border-stone-200 text-stone-900' : 'bg-slate-950/60 border-slate-800 text-slate-100'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs text-cyan-600 dark:text-cyan-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Workspace Backup & Restore</span>
            </div>
            <p className={`text-[10px] sm:text-[11px] ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>
              Save complete audit records and preferences into a lightweight JSON file or restore from previous backup.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                id="export-workspace-backup-btn"
                type="button"
                onClick={handleExportBackup}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-xs transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export (.json)</span>
              </button>

              <button
                id="restore-workspace-backup-btn"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-stone-50 border-stone-300 text-stone-800'
                    : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5 text-cyan-500" />
                <span>Restore (.json)</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleFileRestore}
              />
            </div>

            {restoreStatus && (
              <div
                className={`p-2 rounded-lg text-[11px] font-medium transition-all ${
                  restoreStatus.isError
                    ? 'bg-rose-100 text-rose-900 border border-rose-300'
                    : 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                }`}
              >
                {restoreStatus.message}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className={`flex items-center justify-between px-5 py-3.5 border-t ${
            isLight ? 'border-stone-200 bg-stone-50' : 'border-slate-800 bg-slate-950/80'
          }`}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={onResetDefaults}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
            </button>

            {onReplaySplash && (
              <button
                type="button"
                onClick={onReplaySplash}
                title="Play Intro Logo Animation"
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold border transition-all cursor-pointer ${
                  isLight
                    ? 'border-stone-200 bg-white hover:bg-stone-100 text-stone-700'
                    : 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-cyan-400'
                }`}
              >
                <Sparkles className="w-3 h-3 text-cyan-500" />
                <span>Intro Animation</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-xs transition-all cursor-pointer"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
