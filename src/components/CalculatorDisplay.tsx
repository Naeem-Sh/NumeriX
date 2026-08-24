import React, { useState } from 'react';
import { CalculatorSettings } from '../types';
import { Copy, Check, Plus, Minus, FileSpreadsheet, Undo2, Redo2 } from 'lucide-react';
import { formatAccountingNumber } from '../utils/numberFormat';
import { motion, AnimatePresence } from 'motion/react';

interface CalculatorDisplayProps {
  expression: string;
  currentInput: string;
  result: number | null;
  errorMessage: string | null;
  memoryValue: number | null;
  grandTotal: number | null;
  settings: CalculatorSettings;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onDecIncrease: () => void;
  onDecDecrease: () => void;
  onDirectDecSet: (dec: number) => void;
  isNumLockOn?: boolean;
  onToggleNumLock?: () => void;
}

export const CalculatorDisplay: React.FC<CalculatorDisplayProps> = ({
  expression,
  currentInput,
  result,
  errorMessage,
  memoryValue,
  grandTotal,
  settings,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onDecIncrease,
  onDecDecrease,
  onDirectDecSet,
  isNumLockOn = true,
  onToggleNumLock,
}) => {
  const [copiedType, setCopiedType] = useState<'formatted' | 'raw' | null>(null);
  const [copiedPreview, setCopiedPreview] = useState<string>('');

  const isLight = settings.theme === 'light';
  const displayStyle = settings.displayStyle || 'vfd_emerald';

  // Value to display in large primary result
  let primaryDisplayValue = '0';
  if (errorMessage) {
    primaryDisplayValue = errorMessage;
  } else if (currentInput !== '') {
    // Show current typed number with live 3-digit formatting if it's pure number
    if (/^-?\d+(\.\d*)?$/.test(currentInput)) {
      const parts = currentInput.split('.');
      const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, settings.thousandSeparator || ',');
      primaryDisplayValue = parts.length > 1 ? `${intPart}.${parts[1]}` : intPart;
    } else {
      primaryDisplayValue = currentInput;
    }
  } else if (result !== null) {
    primaryDisplayValue = formatAccountingNumber(
      result,
      settings.decimalPlaces,
      settings.numberFormat,
      true
    );
  }

  // Copy current display value
  const handleCopy = (raw = false) => {
    if (errorMessage) return;

    const valToCopy = raw
      ? result !== null
        ? result.toString()
        : currentInput.replace(/,/g, '')
      : primaryDisplayValue;

    navigator.clipboard.writeText(valToCopy);
    setCopiedPreview(valToCopy);
    setCopiedType(raw ? 'raw' : 'formatted');
    setTimeout(() => {
      setCopiedType(null);
    }, 2000);
  };

  // Get shader styling classes
  const getShaderClass = () => {
    if (isLight) {
      if (displayStyle === 'classic_lcd') return 'shader-classic-lcd';
      return 'bg-[#fcfdfd] border-slate-300 text-slate-950 shadow-inner';
    }
    switch (displayStyle) {
      case 'amber_glow':
        return 'shader-amber-glow';
      case 'oled_ice':
        return 'shader-oled-ice';
      case 'classic_lcd':
        return 'shader-classic-lcd text-slate-950 font-bold';
      case 'vfd_emerald':
      default:
        return 'shader-vfd-emerald';
    }
  };

  return (
    <div
      id="calculator-main-display"
      className={`relative flex flex-col p-3 sm:p-3.5 lg:p-4 rounded-xl xl:rounded-2xl border-2 transition-all duration-300 shadow-inner ${
        copiedType
          ? isLight
            ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400/40 text-slate-950 shadow-md'
            : 'bg-slate-950 border-emerald-500/70 ring-2 ring-emerald-500/30 text-white shadow-inner'
          : getShaderClass()
      }`}
    >
      {/* Temporary Toast Notification Inside Display */}
      <AnimatePresence>
        {copiedType && (
          <motion.div
            id="display-copy-toast"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={`absolute top-2.5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-1 rounded-full shadow-lg border text-xs font-bold backdrop-blur-md select-none ${
              isLight
                ? 'bg-emerald-700 text-white border-emerald-600 shadow-emerald-900/25'
                : 'bg-emerald-600/95 text-white border-emerald-400/80 shadow-black/50'
            }`}
          >
            {copiedType === 'raw' ? (
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
            ) : (
              <Check className="w-3.5 h-3.5 text-emerald-200 shrink-0 stroke-[3]" />
            )}
            <span>
              {copiedType === 'raw'
                ? 'Copied plain value for Excel'
                : 'Copied formatted number'}
            </span>
            <span className="font-mono text-[10px] bg-black/30 text-emerald-100 px-1.5 py-0.5 rounded max-w-[130px] truncate">
              {copiedPreview}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Status & Indicator Bar */}
      <div className="flex items-center justify-between text-xs mb-1 opacity-90 select-none">
        {/* Left: Memory & GT badges */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {memoryValue !== null && (
            <span
              className={`px-1.5 py-0.5 rounded font-mono text-[10px] sm:text-[11px] font-black border ${
                isLight
                  ? 'bg-amber-100 border-amber-400 text-amber-950'
                  : 'bg-amber-950/60 border-amber-700/80 text-amber-300'
              }`}
              title={`Memory Register: ${memoryValue}`}
            >
              M = {formatAccountingNumber(memoryValue, settings.decimalPlaces, settings.numberFormat)}
            </span>
          )}

          {grandTotal !== null && grandTotal !== 0 && (
            <span
              className={`px-1.5 py-0.5 rounded font-mono text-[10px] sm:text-[11px] font-black border ${
                isLight
                  ? 'bg-indigo-100 border-indigo-400 text-indigo-950'
                  : 'bg-indigo-950/60 border-indigo-700/80 text-indigo-300'
              }`}
              title={`Grand Total Register: ${grandTotal}`}
            >
              GT = {formatAccountingNumber(grandTotal, settings.decimalPlaces, settings.numberFormat)}
            </span>
          )}

          <span
            className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold ${
              isLight ? 'bg-slate-200 text-slate-900 border border-slate-300' : 'bg-slate-800 text-slate-300'
            }`}
          >
            TAX: {settings.taxRate}%
          </span>

          {/* Num Lock Status LED Badge */}
          <button
            type="button"
            id="calculator-display-numlock-badge"
            onClick={onToggleNumLock}
            title={`Physical Keyboard Num Lock: ${
              isNumLockOn ? 'ON (Numpad input active)' : 'OFF (Numpad input disabled / navigation mode)'
            }. Press Num Lock on your keyboard or click here to toggle.`}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[10px] sm:text-[11px] font-black border transition-all cursor-pointer select-none ${
              isNumLockOn
                ? isLight
                  ? 'bg-emerald-100 border-emerald-400 text-emerald-950 shadow-xs hover:bg-emerald-200'
                  : 'bg-emerald-950/70 border-emerald-500/80 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)] hover:bg-emerald-900/80'
                : isLight
                  ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-xs animate-pulse hover:bg-amber-200'
                  : 'bg-amber-950/70 border-amber-500/80 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)] animate-pulse hover:bg-amber-900/80'
            }`}
          >
            {/* Glowing Hardware-Style LED Lamp */}
            <span
              className={`w-2 h-2 rounded-full transition-all shrink-0 ${
                isNumLockOn
                  ? 'bg-emerald-500 shadow-[0_0_7px_#10b981] ring-1 ring-emerald-400'
                  : 'bg-amber-500 shadow-[0_0_7px_#f59e0b] ring-1 ring-amber-400'
              }`}
            />
            <span className="tracking-tight uppercase">
              NUM {isNumLockOn ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>

        {/* Right: Decimal Controls (DEC - / DEC +) */}
        <div className={`flex items-center gap-1 p-0.5 sm:p-1 rounded-lg border ${
          isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-800/40 border-slate-700/40'
        }`}>
          <button
            id="dec-decrease-btn"
            onClick={onDecDecrease}
            disabled={settings.decimalPlaces <= 0}
            title="Decrease decimal precision (DEC −)"
            className={`px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-bold border transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
              isLight
                ? 'bg-white hover:bg-slate-200 text-slate-950 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <span className="flex items-center gap-0.5">
              <Minus className="w-2.5 h-2.5 stroke-[3]" /> DEC
            </span>
          </button>

          {/* Direct Decimal Precision Selector / Indicator */}
          <div className="flex items-center px-0.5 font-mono text-xs font-black">
            <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
              isLight ? 'bg-cyan-100 text-cyan-950 border border-cyan-300' : 'bg-cyan-500/20 text-cyan-300'
            }`}>
              .{settings.decimalPlaces}
            </span>
          </div>

          <button
            id="dec-increase-btn"
            onClick={onDecIncrease}
            disabled={settings.decimalPlaces >= 8}
            title="Increase decimal precision (DEC +)"
            className={`px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-bold border transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
              isLight
                ? 'bg-white hover:bg-slate-200 text-slate-950 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <span className="flex items-center gap-0.5">
              <Plus className="w-2.5 h-2.5 stroke-[3]" /> DEC
            </span>
          </button>
        </div>
      </div>

      {/* Expression Tape Trail */}
      <div className="h-5 sm:h-6 overflow-x-auto overflow-y-hidden text-right font-mono text-xs sm:text-sm tracking-wider whitespace-nowrap scrollbar-none flex items-center justify-end">
        {expression ? (
          <span className={isLight ? 'text-slate-800 font-bold' : 'text-slate-300 font-medium'}>{expression}</span>
        ) : (
          <span className={isLight ? 'text-slate-500 text-[11px] italic' : 'text-slate-500 text-[11px] italic'}>
            Enter expression or click keys
          </span>
        )}
      </div>

      {/* Primary Display / Giant Formatted Number with Click-to-Copy */}
      <div className="relative flex items-center justify-end min-h-[48px] sm:min-h-[56px] lg:min-h-[64px] py-1 group/res">
        <div
          id="calculator-result-text"
          onClick={() => handleCopy(false)}
          title="Click to copy formatted result to clipboard"
          className={`font-mono font-black tracking-tight text-right select-all overflow-x-auto scrollbar-none cursor-pointer rounded-lg px-1 transition-all ${
            errorMessage
              ? 'text-rose-600 text-xl sm:text-2xl font-sans cursor-default font-bold'
              : primaryDisplayValue.length > 16
              ? 'text-2xl sm:text-3xl lg:text-4xl'
              : primaryDisplayValue.length > 11
              ? 'text-3xl sm:text-4xl lg:text-5xl'
              : 'text-4xl sm:text-5xl lg:text-6xl 2xl:text-7xl'
          } ${
            isLight && !errorMessage
              ? 'text-slate-950 hover:bg-slate-100'
              : errorMessage
              ? 'text-rose-600'
              : 'text-slate-50 hover:bg-slate-900/60'
          }`}
        >
          {primaryDisplayValue}
        </div>
      </div>

      {/* Bottom Quick-Action Bar for Copying & Undo/Redo */}
      <div className={`flex flex-wrap items-center justify-between pt-1.5 border-t text-xs gap-1.5 ${
        isLight ? 'border-slate-300 text-slate-800' : 'border-slate-800/40 text-slate-400'
      }`}>
        <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono font-semibold">
          <span>Format: {settings.numberFormat.replace('_', ' / ')}</span>
          <span>•</span>
          <span>Precision: {settings.decimalPlaces} dec</span>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Undo / Redo controls */}
          {onUndo && (
            <button
              id="calculator-undo-btn"
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo calculation step (Ctrl+Z)"
              className={`p-1 sm:p-1.5 rounded-md border text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                isLight
                  ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-900'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Undo</span>
            </button>
          )}

          {onRedo && (
            <button
              id="calculator-redo-btn"
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo calculation step (Ctrl+Y)"
              className={`p-1 sm:p-1.5 rounded-md border text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                isLight
                  ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-900'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
            >
              <Redo2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Redo</span>
            </button>
          )}

          {/* Copy Formatted Button */}
          <button
            id="display-copy-formatted-btn"
            onClick={() => handleCopy(false)}
            disabled={!!errorMessage}
            title="Copy formatted number with thousand separators"
            className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              copiedType === 'formatted'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : isLight
                ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-900'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
          >
            {copiedType === 'formatted' ? (
              <Check className="w-3 h-3 text-white stroke-[3]" />
            ) : (
              <Copy className="w-3 h-3 text-cyan-600" />
            )}
            <span>Copy</span>
          </button>

          {/* Copy Plain / Excel Value Button */}
          <button
            id="display-copy-raw-btn"
            onClick={() => handleCopy(true)}
            disabled={!!errorMessage}
            title="Copy plain decimal value without commas (ready for spreadsheet cells)"
            className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              copiedType === 'raw'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : isLight
                ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-950'
                : 'bg-emerald-950/40 hover:bg-emerald-900/60 border-emerald-800 text-emerald-300'
            }`}
          >
            <FileSpreadsheet className="w-3 h-3" />
            <span>Excel Value</span>
          </button>
        </div>
      </div>
    </div>
  );
};
