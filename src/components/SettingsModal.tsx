import React, { useState, useRef } from 'react';
import { CalculatorSettings, AppTheme, NumberFormatType, DateFormatType, WorkspaceLayout } from '../types';
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
  Upload,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  Sparkles,
  PanelRight,
  PanelLeft,
  PanelTop,
  LayoutGrid,
} from 'lucide-react';
import { playKeySound } from '../utils/audio';
import { DEFAULT_SETTINGS } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CalculatorSettings;
  onUpdateSettings: (newSettings: Partial<CalculatorSettings>) => void;
  onResetDefaults: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetDefaults,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const isLight = settings.theme === 'light';

  const handleTestSound = () => {
    playKeySound('enter', settings.soundVolume);
  };

  const processFile = (file: File) => {
    setUploadError(null);
    setUploadSuccess(false);

    if (!file.type.match(/image\/(png|jpeg|jpg|webp|svg\+xml|gif)/)) {
      setUploadError('Please upload a valid image file (PNG, JPG, WEBP, SVG, or GIF).');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setUploadError('Image size should be under 3MB for fast browser loading.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      onUpdateSettings({ logoDataUrl: dataUrl });
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveLogo = () => {
    onUpdateSettings({ logoDataUrl: null });
    setUploadError(null);
    setUploadSuccess(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        id="settings-modal-dialog"
        className={`w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/60'
          }`}
        >
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-cyan-500" />
            <h2 className="text-base font-bold tracking-tight">Calculator Preferences & Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-700/20 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm" style={{ scrollbarWidth: 'thin' }}>
          {/* Quick Accounting Presets */}
          <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold text-xs text-cyan-400">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>1-Click Accounting & Currency Presets</span>
              </span>
              <span className="text-[11px] text-slate-400">Instant configuration</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  playKeySound('action', settings.soundVolume);
                  onUpdateSettings({ decimalPlaces: 2, numberFormat: 'comma_dot', taxRate: 15.0 });
                }}
                className={`p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                  settings.decimalPlaces === 2 && settings.numberFormat === 'comma_dot'
                    ? 'border-cyan-500 bg-cyan-500/15 font-bold text-cyan-300'
                    : isLight
                    ? 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                    : 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200'
                }`}
              >
                <p className="font-bold text-[11px]">🏢 Standard Finance</p>
                <p className="text-[10px] text-slate-400 mt-0.5">2 Dec • 1,234.56 • 15%</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  playKeySound('action', settings.soundVolume);
                  onUpdateSettings({ decimalPlaces: 0, numberFormat: 'comma_dot', taxRate: 0.0 });
                }}
                className={`p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                  settings.decimalPlaces === 0 && settings.numberFormat === 'comma_dot'
                    ? 'border-cyan-500 bg-cyan-500/15 font-bold text-cyan-300'
                    : isLight
                    ? 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                    : 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200'
                }`}
              >
                <p className="font-bold text-[11px]">💵 Cash & Whole</p>
                <p className="text-[10px] text-slate-400 mt-0.5">0 Dec • 1,234 • 0%</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  playKeySound('action', settings.soundVolume);
                  onUpdateSettings({ decimalPlaces: 4, numberFormat: 'comma_dot', taxRate: 15.0 });
                }}
                className={`p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                  settings.decimalPlaces === 4 && settings.numberFormat === 'comma_dot'
                    ? 'border-cyan-500 bg-cyan-500/15 font-bold text-cyan-300'
                    : isLight
                    ? 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                    : 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200'
                }`}
              >
                <p className="font-bold text-[11px]">🔬 High-Precision</p>
                <p className="text-[10px] text-slate-400 mt-0.5">4 Dec • 1,234.5678</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  playKeySound('action', settings.soundVolume);
                  onUpdateSettings({ decimalPlaces: 2, numberFormat: 'dot_comma', taxRate: 20.0 });
                }}
                className={`p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                  settings.decimalPlaces === 2 && settings.numberFormat === 'dot_comma'
                    ? 'border-cyan-500 bg-cyan-500/15 font-bold text-cyan-300'
                    : isLight
                    ? 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                    : 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200'
                }`}
              >
                <p className="font-bold text-[11px]">🇪🇺 European Standard</p>
                <p className="text-[10px] text-slate-400 mt-0.5">2 Dec • 1.234,56 • 20%</p>
              </button>
            </div>
          </div>

          {/* 1. Theme Selection & Visual Previews */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 font-bold">
                <Palette className="w-4 h-4 text-cyan-500" />
                <span>Color Theme & Display Appearance</span>
              </label>
              <span className="text-xs font-mono opacity-70">
                {settings.theme.toUpperCase()}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Select a predefined high-contrast color palette calibrated for accounting sessions and financial audit workstations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {[
                {
                  id: 'dark',
                  name: 'Dark Obsidian',
                  description: 'High-contrast deep charcoal with crisp cyan and emerald accents for zero eye-strain',
                  cardBg: 'bg-slate-950 border-slate-700 text-slate-100',
                  previewBg: 'bg-slate-950 border-slate-800',
                  screenBg: 'bg-slate-900 border-slate-700/60 text-cyan-400',
                  numKeyBg: 'bg-slate-800 border-slate-700 text-white',
                  opKeyBg: 'bg-cyan-950 border-cyan-800 text-cyan-300',
                  actKeyBg: 'bg-emerald-600 text-white',
                },
                {
                  id: 'light',
                  name: 'Light Executive',
                  description: 'Clean crisp paper-white with high-contrast slate text and professional borders',
                  cardBg: 'bg-slate-50 border-slate-300 text-slate-900',
                  previewBg: 'bg-slate-100 border-slate-200',
                  screenBg: 'bg-white border-slate-300 text-slate-900',
                  numKeyBg: 'bg-white border-slate-300 text-slate-800',
                  opKeyBg: 'bg-cyan-50 border-cyan-200 text-cyan-900',
                  actKeyBg: 'bg-emerald-600 text-white',
                },
              ].map((t) => {
                const isSelected = settings.theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      playKeySound('action', settings.soundVolume);
                      onUpdateSettings({ theme: t.id as AppTheme });
                    }}
                    className={`relative flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer group ${
                      t.cardBg
                    } ${
                      isSelected
                        ? 'ring-2 ring-cyan-400 shadow-md scale-[1.01]'
                        : 'opacity-80 hover:opacity-100 hover:border-slate-500'
                    }`}
                  >
                    {/* Header with Title & Active Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs">{t.name}</span>
                      {isSelected ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded-full border border-cyan-500/50">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full border border-slate-600 group-hover:border-slate-400" />
                      )}
                    </div>

                    {/* Visual Mini Mockup Swatch */}
                    <div
                      className={`w-full p-2 rounded-lg border mb-2 flex flex-col gap-1.5 ${t.previewBg}`}
                    >
                      {/* Mini Display Bar */}
                      <div
                        className={`w-full px-2 py-1 rounded flex items-center justify-between font-mono text-[10px] font-bold border ${t.screenBg}`}
                      >
                        <span className="opacity-60 text-[8px]">1,250.00</span>
                        <span>0.00</span>
                      </div>

                      {/* Mini Keypad Swatches */}
                      <div className="grid grid-cols-4 gap-1 text-[9px] font-mono font-bold text-center">
                        <div className={`py-0.5 rounded border ${t.numKeyBg}`}>7</div>
                        <div className={`py-0.5 rounded border ${t.numKeyBg}`}>8</div>
                        <div className={`py-0.5 rounded border ${t.opKeyBg}`}>+</div>
                        <div className={`py-0.5 rounded font-sans font-bold shadow-xs ${t.actKeyBg}`}>
                          =
                        </div>
                      </div>
                    </div>

                    {/* Subtitle / Description */}
                    <p className="text-[11px] opacity-75 line-clamp-2 leading-snug">
                      {t.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 1b. Tactile Display Glow & Hardware Shaders */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Display Screen Shader (4 Hardware Profiles)</span>
              </label>
              <span className="text-xs font-mono opacity-70">
                {(settings.displayStyle || 'vfd_emerald').toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'vfd_emerald', name: 'VFD Emerald', badge: 'GLOWING', bg: 'bg-[#022c22] text-emerald-400 border-emerald-600' },
                { id: 'amber_glow', name: 'Amber Matrix', badge: 'WARM 70s', bg: 'bg-[#261205] text-amber-400 border-amber-600' },
                { id: 'oled_ice', name: 'OLED Ice', badge: 'HIGH CONTRAST', bg: 'bg-slate-950 text-slate-100 border-slate-700' },
                { id: 'classic_lcd', name: 'Classic LCD', badge: 'PAPER RETRO', bg: 'bg-slate-300 text-slate-900 border-slate-400' },
              ].map((shader) => {
                const isSelected = (settings.displayStyle || 'vfd_emerald') === shader.id;
                return (
                  <button
                    key={shader.id}
                    type="button"
                    onClick={() => {
                      playKeySound('action', settings.soundVolume);
                      onUpdateSettings({ displayStyle: shader.id as any });
                    }}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      shader.bg
                    } ${
                      isSelected
                        ? 'ring-2 ring-cyan-400 shadow-md scale-[1.02]'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span>{shader.name}</span>
                      <span className="text-[8px] opacity-75">{shader.badge}</span>
                    </div>
                    <div className="mt-2 font-mono font-black text-sm tracking-tight text-right">
                      12,450.00
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 1c. Two-Color Ribbon & UI Scale Ergonomics */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl border ${
            isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-900/40 border-slate-800 text-slate-100'
          }`}>
            {/* Dual Color Ribbon */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-xs">🧾 Two-Color Ink Ribbon</p>
                <p className="text-[11px] text-slate-400">Print negatives & deductions in crimson red</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  playKeySound('action', settings.soundVolume);
                  onUpdateSettings({ dualColorRibbon: !(settings.dualColorRibbon ?? true) });
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                  (settings.dualColorRibbon ?? true)
                    ? 'bg-rose-600/90 text-white border-rose-500 shadow-sm'
                    : isLight ? 'bg-white text-slate-600 border-slate-300' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {(settings.dualColorRibbon ?? true) ? 'Red/Black Ink' : 'Monochrome'}
              </button>
            </div>

            {/* UI Ergonomic Density */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-xs">🔍 Workstation Scale</p>
                <p className="text-[11px] text-slate-400">Keypad & tape sizing for display</p>
              </div>
              <div className="flex items-center gap-1">
                {(['compact', 'standard', 'expanded'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      playKeySound('action', settings.soundVolume);
                      onUpdateSettings({ uiScale: s });
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize cursor-pointer border transition-all ${
                      (settings.uiScale || 'standard') === s
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black'
                        : isLight ? 'bg-white text-slate-700 border-slate-300' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Workspace Layout (16:9 Displays & Multi-Column Modes) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 font-bold">
                <LayoutGrid className="w-4 h-4 text-cyan-500" />
                <span>Workstation Layout Mode (3 Modes)</span>
              </label>
              <span className="text-xs font-mono opacity-70">
                {(settings.workspaceLayout || 'audit-right').toUpperCase()}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Optimize the position of the numeric keypad and audit tape ledger for your screen size and handedness.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  id: 'audit-right' as WorkspaceLayout,
                  title: 'Audit Right / Keypad Left',
                  subtitle: 'Default (16:9 Optimized)',
                  description: 'Keypad on Left for fast entry, continuous audit tape ledger on Right',
                  icon: PanelRight,
                  badge: 'DEFAULT',
                },
                {
                  id: 'audit-left' as WorkspaceLayout,
                  title: 'Audit Left / Keypad Right',
                  subtitle: 'Classic Standard',
                  description: 'Audit tape on Left, primary calculator and keypad on Right',
                  icon: PanelLeft,
                  badge: 'STANDARD',
                },
                {
                  id: 'audit-top' as WorkspaceLayout,
                  title: 'Audit Up / Keypad Down',
                  subtitle: 'Vertical Ledger Stack',
                  description: 'Audit tape on Top feeding downward, keypad and display at Bottom',
                  icon: PanelTop,
                  badge: 'VERTICAL',
                },
              ].map((m) => {
                const isSelected = (settings.workspaceLayout || 'audit-right') === m.id;
                const IconComponent = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      playKeySound('action', settings.soundVolume);
                      onUpdateSettings({ workspaceLayout: m.id });
                    }}
                    className={`flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                      isLight
                        ? isSelected
                          ? 'bg-cyan-50 border-cyan-500 ring-2 ring-cyan-400/40 text-slate-900 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                        : isSelected
                        ? 'bg-cyan-950/40 border-cyan-500 ring-2 ring-cyan-500/30 text-white shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <IconComponent className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                        <span>{m.title}</span>
                      </div>
                      {isSelected ? (
                        <span className="flex items-center gap-0.5 text-[9px] font-bold text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded-full border border-cyan-500/50">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Active
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono opacity-50 px-1 py-0.5 rounded border border-slate-700">
                          {m.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] opacity-75 line-clamp-2 leading-tight">
                      {m.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Number Formatting & Decimal Precision */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 font-bold mb-2">
                <Hash className="w-4 h-4 text-cyan-500" />
                <span>3-Digit Separator Format</span>
              </label>
              <select
                value={settings.numberFormat}
                onChange={(e) => onUpdateSettings({ numberFormat: e.target.value as NumberFormatType })}
                className={`w-full p-2.5 rounded-xl border font-mono text-xs outline-none cursor-pointer ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-slate-800 border-slate-700 text-slate-100'
                }`}
              >
                <option value="comma_dot">1,234,567.89 (Standard US/UK)</option>
                <option value="dot_comma">1.234.567,89 (European / Latin)</option>
                <option value="space_dot">1 234 567.89 (International SI)</option>
                <option value="apostrophe_dot">1'234'567.89 (Swiss Accounting)</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 font-bold mb-2">
                <Percent className="w-4 h-4 text-cyan-500" />
                <span>Default Decimal Precision</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="8"
                  value={settings.decimalPlaces}
                  onChange={(e) => onUpdateSettings({ decimalPlaces: parseInt(e.target.value) })}
                  className="flex-1 accent-cyan-500 cursor-pointer"
                />
                <span className="font-mono font-bold text-base px-3 py-1 rounded-lg border bg-slate-800/40 text-cyan-400">
                  {settings.decimalPlaces}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Audio / Click Confirmation */}
          <div className={`p-4 rounded-xl border space-y-3 ${
            isLight ? 'border-slate-300 bg-slate-100/70' : 'border-slate-700/50 bg-slate-800/20'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <label className="flex items-center gap-2 font-bold cursor-pointer text-sm">
                  <Volume2 className="w-4 h-4 text-cyan-500" />
                  <span>Sound Confirmation</span>
                </label>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Plays audio feedback strictly on Enter / Calculate key presses.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
                className="w-4 h-4 accent-cyan-500 cursor-pointer"
              />
            </div>

            {settings.soundEnabled && (
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs text-slate-400">Volume:</span>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={settings.soundVolume}
                  onChange={(e) => onUpdateSettings({ soundVolume: parseFloat(e.target.value) })}
                  className="flex-1 accent-cyan-500 cursor-pointer"
                />
                <button
                  onClick={handleTestSound}
                  className="px-2.5 py-1 text-xs font-semibold rounded-md border border-cyan-700 bg-cyan-950/50 text-cyan-300 hover:bg-cyan-900/60 cursor-pointer"
                >
                  Test Enter Sound
                </button>
              </div>
            )}
          </div>

          {/* 4. Accounting Tax Rate & Clock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 font-bold mb-2">
                <Percent className="w-4 h-4 text-amber-500" />
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
                  className={`w-full p-2.5 rounded-xl border font-mono text-sm outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-slate-800 border-slate-700 text-slate-100'
                  }`}
                />
                <span className="absolute right-3 top-2.5 font-bold text-slate-400">%</span>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 font-bold mb-2">
                <Clock className="w-4 h-4 text-cyan-500" />
                <span>Date Display Format</span>
              </label>
              <select
                value={settings.dateFormat}
                onChange={(e) => onUpdateSettings({ dateFormat: e.target.value as DateFormatType })}
                className={`w-full p-2.5 rounded-xl border text-xs outline-none cursor-pointer ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-slate-800 border-slate-700 text-slate-100'
                }`}
              >
                <option value="EU">22 AUGUST 2026 (EU Style)</option>
                <option value="US">AUG 22, 2026 (US Style)</option>
                <option value="ISO">2026-08-22 (ISO Standard)</option>
              </select>
            </div>
          </div>

          {/* 5. Home Page Logo & Organization Branding */}
          <div className="space-y-3 pt-2 border-t border-slate-800/40">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 font-bold">
                <ImageIcon className="w-4 h-4 text-cyan-500" />
                <span>Home Page Logo</span>
              </label>
              {settings.logoDataUrl && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active on Header
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400">
              Upload an image file (PNG, JPG, SVG, or WEBP) to set as the custom logo in the top-left of the home page header and on generated calculation reports.
            </p>

            {/* Drag & Drop / Upload Box */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                dragActive
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : isLight
                  ? 'border-slate-300 hover:border-slate-400 bg-slate-50/80 hover:bg-slate-100/80'
                  : 'border-slate-700 hover:border-slate-600 bg-slate-950/40 hover:bg-slate-950/70'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/gif"
                onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
                className="hidden"
              />

              <div className="w-10 h-10 rounded-full border border-cyan-500/30 bg-cyan-950/40 flex items-center justify-center mb-2 text-cyan-400">
                <Upload className="w-5 h-5" />
              </div>

              <p className="font-semibold text-xs text-center">
                Click to browse or Drag & Drop image file here
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Supports PNG, JPG, SVG, WEBP (Max 3MB)
              </p>
            </div>

            {uploadError && (
              <p className="text-xs text-rose-500 font-medium">{uploadError}</p>
            )}

            {uploadSuccess && (
              <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Logo uploaded and applied to home page successfully!
              </p>
            )}

            {/* Active Logo Preview Card */}
            {settings.logoDataUrl ? (
              <div
                className={`flex items-center justify-between p-3.5 rounded-xl border ${
                  isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800/60 border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg bg-white/95 p-1.5 flex items-center justify-center border border-slate-300 overflow-hidden shadow-xs shrink-0">
                    <img
                      src={settings.logoDataUrl}
                      alt="Home Page Logo Preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-xs">Current Home Page Logo</p>
                    <p className="text-[11px] text-slate-400">
                      Displayed on top navigation bar and audit reports
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer ${
                      isLight
                        ? 'bg-white hover:bg-slate-200 border-slate-300 text-slate-800'
                        : 'bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-100'
                    }`}
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveLogo();
                    }}
                    title="Remove custom logo and use default"
                    className="p-1.5 rounded-lg border border-rose-800/80 text-rose-400 hover:bg-rose-950/50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-dashed border-slate-700/60 bg-slate-800/20 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Default financial icon is currently in use
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-cyan-400 hover:underline font-medium text-xs cursor-pointer"
                >
                  Upload custom logo
                </button>
              </div>
            )}
          </div>

          {/* 6. Organization & Report Metadata */}
          <div className="space-y-3 pt-2 border-t border-slate-800/40">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Report & Organization Header
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <Building2 className="w-3.5 h-3.5" /> Company / Organization
                </label>
                <input
                  type="text"
                  value={settings.companyName}
                  onChange={(e) => onUpdateSettings({ companyName: e.target.value })}
                  className={`w-full p-2 rounded-lg border text-xs outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-slate-800 border-slate-700 text-slate-100'
                  }`}
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <User className="w-3.5 h-3.5" /> Operator / Accountant Name
                </label>
                <input
                  type="text"
                  value={settings.operatorName}
                  onChange={(e) => onUpdateSettings({ operatorName: e.target.value })}
                  className={`w-full p-2 rounded-lg border text-xs outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-slate-800 border-slate-700 text-slate-100'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-t ${
            isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/80'
          }`}
        >
          <button
            onClick={onResetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md transition-all cursor-pointer"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
