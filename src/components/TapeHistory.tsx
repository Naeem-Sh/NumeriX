import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CalculationRecord, CalculatorSettings } from '../types';
import {
  Copy,
  Trash2,
  ArrowUpRight,
  Check,
  FileSpreadsheet,
  Download,
  Sparkles,
  Printer,
  ChevronDown,
  Tag,
  X,
  Edit3,
} from 'lucide-react';
import { formatAccountingNumber } from '../utils/numberFormat';
import { motion, AnimatePresence } from 'motion/react';

interface TapeHistoryProps {
  records: CalculationRecord[];
  settings: CalculatorSettings;
  onReuseValue: (value: number) => void;
  onDeleteRecord: (id: string) => void;
  onClearTape: () => void;
  onExportExcel: () => void;
  onExportPdf: () => void;
  onPrint: () => void;
  onUpdateRecordNote: (id: string, note: string) => void;
}

export const TapeHistory: React.FC<TapeHistoryProps> = ({
  records,
  settings,
  onReuseValue,
  onDeleteRecord,
  onClearTape,
  onExportExcel,
  onExportPdf,
  onPrint,
  onUpdateRecordNote,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copyAllStatus, setCopyAllStatus] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [isCompact, setIsCompact] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState<string>('');
  const noteInputRef = useRef<HTMLInputElement>(null);
  const tapeContainerRef = useRef<HTMLDivElement>(null);
  const clearConfirmTimeoutRef = useRef<number | null>(null);
  const prevCountRef = useRef(records.length);
  const prevLastIdRef = useRef(records[records.length - 1]?.id);

  const isLight = settings.theme === 'light';
  const dualColorRibbon = settings.dualColorRibbon ?? true;

  // Focus input when starting note edit
  useEffect(() => {
    if (editingNoteId && noteInputRef.current) {
      noteInputRef.current.focus();
      noteInputRef.current.select();
    }
  }, [editingNoteId]);

  const startEditingNote = (rec: CalculationRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingNoteId(rec.id);
    setTempNote(rec.note || '');
  };

  const handleSaveNote = (id: string, e?: React.MouseEvent | React.FormEvent) => {
    if (e) e.stopPropagation();
    onUpdateRecordNote(id, tempNote.trim());
    setEditingNoteId(null);
  };

  const handleCancelNote = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingNoteId(null);
  };

  // Handle safe inline clear tape
  const handleClearClick = () => {
    if (records.length === 0) return;
    if (showClearConfirm) {
      if (clearConfirmTimeoutRef.current) window.clearTimeout(clearConfirmTimeoutRef.current);
      setShowClearConfirm(false);
      onClearTape();
    } else {
      setShowClearConfirm(true);
      if (clearConfirmTimeoutRef.current) window.clearTimeout(clearConfirmTimeoutRef.current);
      clearConfirmTimeoutRef.current = window.setTimeout(() => {
        setShowClearConfirm(false);
      }, 4000);
    }
  };

  // High-reliability container auto-scroll ensuring the newest calculation record is always fully visible
  const scrollToBottom = useCallback((instant = false) => {
    const el = tapeContainerRef.current;
    if (!el) return;

    const performScroll = () => {
      if (!tapeContainerRef.current) return;
      const targetScroll = tapeContainerRef.current.scrollHeight;
      if (instant) {
        tapeContainerRef.current.scrollTop = targetScroll;
      } else {
        tapeContainerRef.current.scrollTo({
          top: targetScroll,
          behavior: 'smooth',
        });
      }
    };

    // 1. Immediate scroll attempt
    performScroll();

    // 2. Next animation frames
    requestAnimationFrame(() => {
      performScroll();
      requestAnimationFrame(performScroll);
    });

    // 3. Staggered timers for DOM layout & Framer Motion entrance completion
    setTimeout(performScroll, 40);
    setTimeout(performScroll, 120);
    setTimeout(() => {
      if (tapeContainerRef.current) {
        tapeContainerRef.current.scrollTop = tapeContainerRef.current.scrollHeight;
      }
    }, 250);
  }, []);

  // Monitor scroll position to show jump-to-bottom indicator when user scrolls up
  const handleScroll = useCallback(() => {
    if (!tapeContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = tapeContainerRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 50;
    setIsNearBottom(atBottom);
  }, []);

  // Trigger auto-scroll on new calculation record additions
  useEffect(() => {
    const currentLastId = records[records.length - 1]?.id;
    const isNewRecordAdded = records.length > prevCountRef.current || currentLastId !== prevLastIdRef.current;

    prevCountRef.current = records.length;
    prevLastIdRef.current = currentLastId;

    if (autoScroll && isNewRecordAdded && records.length > 0) {
      scrollToBottom(false);
    }
  }, [records, autoScroll, scrollToBottom]);

  // Adjust scroll when view mode updates
  useEffect(() => {
    if (autoScroll && records.length > 0) {
      scrollToBottom(true);
    }
  }, [isCompact, autoScroll, scrollToBottom]);

  // Copy single formatted or raw result
  const handleCopyValue = (rec: CalculationRecord, e: React.MouseEvent, raw = false) => {
    e.stopPropagation();
    const textToCopy = raw
      ? rec.result.toString()
      : rec.formattedResult || formatAccountingNumber(rec.result, rec.decimalPlaces, settings.numberFormat);
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(rec.id);
    setTimeout(() => setCopiedId(null), 1600);
  };

  // Copy entire tape formatted or for Excel
  const handleCopyAll = (formatType: 'formatted' | 'excel_tsv') => {
    if (records.length === 0) return;

    let content = '';
    if (formatType === 'excel_tsv') {
      // TSV ready to paste directly into Excel columns
      content = 'Date\tTime\tExpression\tResult\tDecimals\n' +
        records
          .map(
            (r) =>
              `${r.displayDate}\t${r.displayTime}\t${r.expression}\t${r.result}\t${r.decimalPlaces}`
          )
          .join('\n');
    } else {
      content = records
        .map(
          (r, idx) =>
            `[#${idx + 1}] ${r.displayTime} | ${r.expression} = ${
              r.formattedResult || formatAccountingNumber(r.result, r.decimalPlaces, settings.numberFormat)
            }`
        )
        .join('\n');
    }

    navigator.clipboard.writeText(content);
    setCopyAllStatus(formatType === 'excel_tsv' ? 'Excel TSV Copied!' : 'Tape Copied!');
    setTimeout(() => setCopyAllStatus(null), 2000);
  };

  return (
    <div
      id="tape-history-panel"
      className={`flex flex-col h-full rounded-2xl border transition-colors ${
        isLight
          ? 'bg-slate-50 border-slate-300 text-slate-900 shadow-sm'
          : 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-md'
      }`}
    >
      {/* Tape Header & Controls */}
      <div
        className={`flex flex-wrap items-center justify-between gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 border-b text-xs font-medium ${
          isLight ? 'border-slate-300 bg-white' : 'border-slate-800/80 bg-slate-950/40'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-extrabold tracking-wider uppercase">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className={isLight ? 'text-slate-900' : 'text-slate-100'}>Audit Tape</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                isLight ? 'bg-slate-200 text-slate-900 border border-slate-300' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {records.length} {records.length === 1 ? 'line' : 'lines'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            onClick={() => setIsCompact(!isCompact)}
            title={isCompact ? 'Switch to Detailed view' : 'Switch to Compact view'}
            className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border text-[10px] sm:text-[11px] font-bold transition-colors cursor-pointer ${
              isCompact
                ? isLight
                  ? 'bg-cyan-600 border-cyan-600 text-white font-bold'
                  : 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                : isLight
                ? 'bg-white border-slate-300 text-slate-900 hover:bg-slate-100 font-semibold'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isCompact ? 'Compact' : 'Standard'}
          </button>

          <button
            id="copy-all-tape-btn"
            onClick={() => handleCopyAll('formatted')}
            disabled={records.length === 0}
            title="Copy all tape lines to clipboard"
            className={`flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border text-[10px] sm:text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              isLight
                ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-900 font-bold'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
          >
            {copyAllStatus === 'Tape Copied!' ? (
              <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            <span>{copyAllStatus || 'Copy All'}</span>
          </button>

          <button
            id="copy-excel-tsv-btn"
            onClick={() => handleCopyAll('excel_tsv')}
            disabled={records.length === 0}
            title="Copy as Tab-Separated Values for instant Excel paste (Ctrl+V into spreadsheet)"
            className={`flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border text-[10px] sm:text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              isLight
                ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-950 font-bold'
                : 'bg-emerald-950/30 hover:bg-emerald-900/50 border-emerald-800 text-emerald-300'
            }`}
          >
            <Copy className="w-3 h-3" />
            <span>Copy for Excel</span>
          </button>

          <button
            id="export-excel-header-btn"
            onClick={onExportExcel}
            disabled={records.length === 0}
            title="Export full calculation audit tape to Microsoft Excel (.XLSX) file"
            className={`flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              isLight
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-xs'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-xs'
            }`}
          >
            <FileSpreadsheet className="w-3 h-3 text-white" />
            <span>Export Excel</span>
          </button>

          <button
            id="print-tape-header-btn"
            onClick={onPrint}
            disabled={records.length === 0}
            title="Print preview & printer options"
            className={`flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border text-[10px] sm:text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              isLight
                ? 'bg-cyan-100 hover:bg-cyan-200 border-cyan-300 text-cyan-950 font-bold'
                : 'bg-cyan-950/40 hover:bg-cyan-900/60 border-cyan-800 text-cyan-300'
            }`}
          >
            <Printer className="w-3 h-3" />
            <span>Print</span>
          </button>

          <button
            id="clear-tape-btn"
            onClick={handleClearClick}
            disabled={records.length === 0}
            title="Clear all tape history"
            className={`flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              showClearConfirm
                ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600 ring-2 ring-rose-400 animate-pulse'
                : isLight
                ? 'bg-rose-100 hover:bg-rose-200 border-rose-300 text-rose-950'
                : 'bg-rose-950/30 hover:bg-rose-900/50 border-rose-900 text-rose-300'
            }`}
          >
            <Trash2 className="w-3 h-3" />
            <span>{showClearConfirm ? 'Confirm Clear?' : 'Clear'}</span>
          </button>
        </div>
      </div>

      {/* 20-Line Paper Tape Scroll Area with Clean View */}
      <div className="relative flex-1 min-h-0 flex flex-col">
        <div
          ref={tapeContainerRef}
          onScroll={handleScroll}
          id="tape-records-container"
          className={`flex-1 overflow-y-auto font-mono select-text ${
            isCompact ? 'p-2 pb-10 space-y-1 text-xs sm:text-sm' : 'p-3 xl:p-4 pb-14 xl:pb-16 space-y-1.5 xl:space-y-2 text-sm xl:text-base'
          } fluid-tape-container`}
          style={{ scrollbarWidth: 'thin' }}
        >
          {records.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16 xl:py-24 opacity-60">
              <div className="w-12 h-12 xl:w-16 xl:h-16 rounded-full border-2 border-dashed border-slate-400 flex items-center justify-center mb-3 xl:mb-4">
                <Sparkles className="w-5 h-5 xl:w-7 xl:h-7 text-cyan-600" />
              </div>
              <p className={`text-sm xl:text-base font-bold tracking-wide ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                Tape is currently empty
              </p>
              <p className={`text-xs xl:text-sm mt-1 max-w-[280px] ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                Type numbers on your keyboard or keypad and press Enter to record audit entries.
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {records.map((rec, index) => {
                const isLatest = index === records.length - 1;
                const isCopied = copiedId === rec.id;
                const isNegative = rec.result < 0 || rec.operationType === 'tax_minus' || rec.operationType === 'discount';

                // Dual Color Ribbon logic: Red for subtractions/negatives, Carbon Black/Emerald for standard
                const resultColorClass = dualColorRibbon && isNegative
                  ? 'text-rose-600 dark:text-rose-400'
                  : isLight
                  ? 'text-slate-950 font-black'
                  : 'text-emerald-400 font-bold';

                if (isCompact) {
                  return (
                    <motion.div
                      key={rec.id}
                      id={`tape-line-${rec.id}`}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                      onClick={() => onReuseValue(rec.result)}
                      onDoubleClick={(e) => startEditingNote(rec, e)}
                      title="Click to load result, Double-click to add/edit note"
                      className={`group flex flex-col px-2 py-1.5 rounded-md border text-xs transition-all cursor-pointer ${
                        isLight
                          ? isLatest
                            ? 'bg-cyan-50/90 border-2 border-cyan-400 text-slate-950 font-bold shadow-2xs'
                            : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-900'
                          : isLatest
                          ? 'bg-cyan-950/30 border-cyan-700 text-cyan-200 font-bold'
                          : 'bg-slate-950/50 hover:bg-slate-900/60 border-slate-800/80 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 w-full">
                        {/* Time, Sentence/Expression, Note */}
                        <div className="flex items-center gap-1.5 truncate min-w-0 flex-1">
                          <span className={`text-[10px] font-mono font-black shrink-0 ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>#{index + 1}</span>
                          <span className={`font-mono text-[9px] px-1 py-0.2 rounded border shrink-0 ${isLight ? 'bg-slate-100 border-slate-250 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                            {rec.displayTime}
                          </span>
                          <span className={`truncate font-sans font-semibold text-xs ${isLight ? 'text-sky-900' : 'text-sky-300'}`}>{rec.expression}</span>
                          {rec.note && (
                            <span className={`text-[9px] px-1 py-0.2 rounded border shrink-0 font-sans font-medium flex items-center gap-0.5 ${isLight ? 'bg-amber-100 text-amber-950 border-amber-300' : 'bg-amber-950/50 text-amber-300 border-amber-800/60'}`}>
                              <Tag className="w-2 h-2 shrink-0 text-amber-600" />
                              <span className="truncate max-w-[120px]">{rec.note}</span>
                            </span>
                          )}
                        </div>

                        {/* Result & Actions */}
                        <div className="flex items-center gap-1 shrink-0 ml-auto text-right">
                          <span className={`font-black font-mono tabular-nums text-sm ${resultColorClass}`}>
                            {rec.formattedResult || formatAccountingNumber(rec.result, rec.decimalPlaces, settings.numberFormat)}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => startEditingNote(rec, e)}
                            title="Edit note"
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-cyan-600 cursor-pointer"
                          >
                            <Tag className="w-2.5 h-2.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleCopyValue(rec, e, false)}
                            title="Copy result"
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-cyan-600 cursor-pointer"
                          >
                            {isCopied ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Inline Note Editor in Compact Mode */}
                      {editingNoteId === rec.id && (
                        <div
                          className="mt-1 flex items-center gap-1 w-full pt-1 border-t border-dashed border-slate-300 dark:border-slate-700"
                          onClick={(e) => e.stopPropagation()}
                          onDoubleClick={(e) => e.stopPropagation()}
                        >
                          <input
                            ref={noteInputRef}
                            type="text"
                            value={tempNote}
                            onChange={(e) => setTempNote(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSaveNote(rec.id, e);
                              } else if (e.key === 'Escape') {
                                e.preventDefault();
                                handleCancelNote(e);
                              }
                            }}
                            placeholder="Type note..."
                            className={`flex-1 px-1.5 py-0.5 text-xs rounded border outline-none font-sans ${
                              isLight
                                ? 'bg-white border-cyan-500 text-slate-900 ring-1 ring-cyan-400'
                                : 'bg-slate-900 border-cyan-500 text-slate-100 ring-1 ring-cyan-500'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={(e) => handleSaveNote(rec.id, e)}
                            className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-600 text-white cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelNote}
                            className={`px-1.5 py-0.5 text-[10px] rounded border cursor-pointer ${
                              isLight ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-slate-800 border-slate-700 text-slate-300'
                            }`}
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={rec.id}
                    id={`tape-line-${rec.id}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => onReuseValue(rec.result)}
                    onDoubleClick={(e) => startEditingNote(rec, e)}
                    title="Click to load result into calculator, Double-click to add/edit note"
                    className={`group relative flex flex-col px-3 py-2 xl:py-2.5 rounded-xl border transition-all cursor-pointer ${
                      isLight
                        ? isLatest
                          ? 'bg-cyan-50/90 border-2 border-cyan-400 text-slate-950 shadow-xs'
                          : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 shadow-2xs'
                        : isLatest
                        ? 'bg-cyan-950/30 border-cyan-750 text-slate-100 shadow-xs'
                        : 'bg-slate-950/50 hover:bg-slate-900/60 border-slate-800/80 text-slate-200'
                    }`}
                  >
                    {/* Unified Single-Line Layout: [ #Index | Time | Type | Sentence/Expression | Note ] ---------- [ Result | Actions ] */}
                    <div className="flex items-center justify-between gap-3 w-full">
                      {/* Left: Index, Time, Sentence / Expression, Note */}
                      <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                        {/* 1. Index Number (Cyan / Steel) */}
                        <span className={`text-[11px] font-mono font-black shrink-0 ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>
                          #{index + 1}
                        </span>

                        {/* 2. Timestamp (Color-coded Slate/Indigo Badge) */}
                        <span
                          className={`font-mono text-[10px] xl:text-[11px] px-1.5 py-0.5 rounded shrink-0 border select-none ${
                            isLight
                              ? 'bg-slate-100 border-slate-250 text-slate-600 font-semibold'
                              : 'bg-slate-900 border-slate-750 text-slate-400 font-medium'
                          }`}
                          title={`Recorded at ${rec.displayTime}`}
                        >
                          {rec.displayTime}
                        </span>

                        {/* 3. Special Operation Tag (if applicable) */}
                        {rec.operationType && rec.operationType !== 'arithmetic' && (
                          <span
                            className={`text-[9px] xl:text-[10px] px-1.5 py-0.5 rounded font-sans font-bold uppercase shrink-0 border ${
                              rec.operationType.startsWith('tax')
                                ? isLight
                                  ? 'bg-amber-100 text-amber-950 border-amber-300'
                                  : 'bg-amber-950/50 text-amber-300 border-amber-700/60'
                                : isLight
                                ? 'bg-indigo-100 text-indigo-950 border-indigo-300'
                                : 'bg-indigo-950/50 text-indigo-300 border-indigo-700/60'
                            }`}
                          >
                            {rec.operationType.replace('_', ' ')}
                          </span>
                        )}

                        {/* 4. Sentence / Calculation Expression (Color-coded Sky/Blue) */}
                        <span
                          className={`font-sans font-semibold text-xs xl:text-sm truncate shrink-1 tracking-wide ${
                            isLight ? 'text-sky-900 font-bold' : 'text-sky-300 font-semibold'
                          }`}
                          title={rec.expression}
                        >
                          {rec.expression}
                        </span>

                        {/* 5. Custom Note (Color-coded Warm Amber Chip) */}
                        {rec.note && editingNoteId !== rec.id && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditingNote(rec, e);
                            }}
                            title="Click to edit note"
                            className={`flex items-center gap-1 text-[10px] xl:text-[11px] px-1.5 py-0.5 rounded shrink-0 font-sans font-medium border max-w-[220px] truncate cursor-pointer transition-colors ${
                              isLight
                                ? 'bg-amber-100 text-amber-950 border-amber-300 hover:bg-amber-200'
                                : 'bg-amber-950/50 text-amber-300 border-amber-700/60 hover:bg-amber-900/60'
                            }`}
                          >
                            <Tag className="w-2.5 h-2.5 shrink-0 text-amber-600 dark:text-amber-400" />
                            <span className="truncate">{rec.note}</span>
                          </span>
                        )}
                      </div>

                      {/* Right: Result & Actions */}
                      <div className="flex items-center gap-2 shrink-0 text-right ml-auto">
                        {/* 6. Result (Color-coded Emerald or Crimson Red for deductions) */}
                        <span
                          className={`text-base xl:text-lg 2xl:text-xl font-black font-mono tabular-nums tracking-tight transition-colors ${resultColorClass}`}
                        >
                          {rec.formattedResult ||
                            formatAccountingNumber(rec.result, rec.decimalPlaces, settings.numberFormat)}
                        </span>

                        {/* Action Toolbar on Hover */}
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                          <button
                            type="button"
                            onClick={(e) => startEditingNote(rec, e)}
                            title="Add / Edit Note"
                            className={`p-1 rounded text-slate-400 hover:text-cyan-600 cursor-pointer ${
                              isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'
                            }`}
                          >
                            <Tag className="w-3 h-3" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleCopyValue(rec, e, false)}
                            title="Copy formatted result"
                            className={`p-1 rounded text-slate-400 hover:text-emerald-600 cursor-pointer ${
                              isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'
                            }`}
                          >
                            {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteRecord(rec.id);
                            }}
                            title="Delete this line"
                            className={`p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer ${
                              isLight ? 'hover:bg-rose-50' : 'hover:bg-rose-950/40'
                            }`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>

                          <ArrowUpRight
                            className={`w-3.5 h-3.5 opacity-70 group-hover:opacity-100 shrink-0 ${
                              isLight ? 'text-cyan-700' : 'text-cyan-400'
                            }`}
                            title="Click to load into calculator"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Inline Note Editor */}
                    {editingNoteId === rec.id && (
                      <div
                        className="mt-2 flex items-center gap-1.5 w-full pt-1.5 border-t border-dashed border-slate-300 dark:border-slate-700"
                        onClick={(e) => e.stopPropagation()}
                        onDoubleClick={(e) => e.stopPropagation()}
                      >
                        <Tag className="w-3 h-3 text-cyan-500 shrink-0" />
                        <input
                          ref={noteInputRef}
                          type="text"
                          value={tempNote}
                          onChange={(e) => setTempNote(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveNote(rec.id, e);
                            } else if (e.key === 'Escape') {
                              e.preventDefault();
                              handleCancelNote(e);
                            }
                          }}
                          placeholder="Type note (e.g. Invoice #104, Tax deduction, Shipping fee)..."
                          className={`flex-1 px-2.5 py-1 text-xs rounded-lg border outline-none font-sans ${
                            isLight
                              ? 'bg-white border-cyan-500 text-slate-950 ring-1 ring-cyan-400 shadow-xs'
                              : 'bg-slate-900 border-cyan-500 text-slate-100 ring-1 ring-cyan-500 shadow-xs'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={(e) => handleSaveNote(rec.id, e)}
                          title="Save note (Enter)"
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-xs transition-colors"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelNote}
                          title="Cancel (Escape)"
                          className={`px-2 py-1 text-xs font-medium rounded-lg border cursor-pointer transition-colors ${
                            isLight
                              ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                          }`}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
          {/* Bottom Anchor target for precise auto-scrolling */}
          <div id="tape-bottom-anchor" className="h-3 w-full shrink-0" aria-hidden="true" />
        </div>

        {/* Floating "Scroll to Latest" Button when scrolled away from bottom */}
        {!isNearBottom && records.length > 0 && (
          <button
            id="jump-to-latest-tape-btn"
            onClick={() => {
              setAutoScroll(true);
              scrollToBottom(false);
            }}
            title="Scroll to most recent calculation"
            className={`absolute bottom-3 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer border ${
              isLight
                ? 'bg-slate-900 text-white border-slate-700 hover:bg-slate-800'
                : 'bg-cyan-500 text-slate-950 border-cyan-400 hover:bg-cyan-400'
            }`}
          >
            <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
            <span>Latest Entry</span>
          </button>
        )}
      </div>

      {/* Tape Footer with Clear & Export shortcuts */}
      <div
        className={`flex flex-wrap items-center justify-between gap-1.5 p-2 sm:p-2.5 border-t text-xs ${
          isLight ? 'border-slate-300 bg-white' : 'border-slate-800 bg-slate-950/30'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] sm:text-[11px] font-bold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
            {records.length} items recorded
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            id="print-tape-footer-btn"
            onClick={onPrint}
            disabled={records.length === 0}
            title="Open print preview & printer options"
            className={`flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md border text-[10px] sm:text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              isLight
                ? 'bg-cyan-700 hover:bg-cyan-800 text-white border-cyan-700 shadow-xs'
                : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold border-cyan-500 shadow-xs'
            }`}
          >
            <Printer className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Print Preview</span>
          </button>

          <button
            id="export-excel-tape-footer"
            onClick={onExportExcel}
            disabled={records.length === 0}
            className={`flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md border text-[10px] sm:text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              isLight
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-700 shadow-xs'
                : 'bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-600 shadow-xs'
            }`}
          >
            <FileSpreadsheet className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Export .XLSX</span>
          </button>

          <button
            id="export-pdf-tape-footer"
            onClick={onExportPdf}
            disabled={records.length === 0}
            className={`flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md border text-[10px] sm:text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              isLight
                ? 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900 shadow-xs'
                : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700 shadow-xs'
            }`}
          >
            <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
