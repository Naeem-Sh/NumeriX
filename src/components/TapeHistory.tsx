import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { CalculationRecord, CalculatorSettings } from '../types';
import {
  Copy,
  Trash2,
  ArrowUpRight,
  Check,
  Download,
  Sparkles,
  Printer,
  FileSpreadsheet,
  ChevronDown,
  Tag,
  X,
  Clock,
} from 'lucide-react';
import { formatAccountingNumber } from '../utils/numberFormat';
import { motion, AnimatePresence } from 'motion/react';

interface TapeHistoryProps {
  records: CalculationRecord[];
  settings: CalculatorSettings;
  enterTrigger?: number;
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
  enterTrigger = 0,
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
  const [heartbeatKey, setHeartbeatKey] = useState<number>(0);
  const [isHeartbeating, setIsHeartbeating] = useState<boolean>(false);
  const heartbeatTimerRef = useRef<number | null>(null);
  const noteInputRef = useRef<HTMLInputElement>(null);
  const tapeContainerRef = useRef<HTMLDivElement>(null);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);
  const clearConfirmTimeoutRef = useRef<number | null>(null);
  const prevCountRef = useRef(records.length);
  const prevLastIdRef = useRef(records[records.length - 1]?.id);

  const isLight = settings.theme === 'light';
  const dualColorRibbon = settings.dualColorRibbon ?? true;

  // Seamless 3-beat heartbeat trigger
  const triggerHeartbeat = useCallback(() => {
    setHeartbeatKey((prev) => prev + 1);
    setIsHeartbeating(true);
    if (heartbeatTimerRef.current) {
      window.clearTimeout(heartbeatTimerRef.current);
    }
    heartbeatTimerRef.current = window.setTimeout(() => {
      setIsHeartbeating(false);
    }, 2650);
  }, []);

  // Trigger heartbeat when enter is pressed
  useEffect(() => {
    if (enterTrigger > 0) {
      triggerHeartbeat();
    }
  }, [enterTrigger, triggerHeartbeat]);

  // Also trigger heartbeat whenever a new record is added to the tape
  useEffect(() => {
    if (records.length > prevCountRef.current) {
      triggerHeartbeat();
    }
    prevCountRef.current = records.length;
  }, [records.length, triggerHeartbeat]);

  // Clean up heartbeat timer
  useEffect(() => {
    return () => {
      if (heartbeatTimerRef.current) {
        window.clearTimeout(heartbeatTimerRef.current);
      }
    };
  }, []);

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

  const handleCancelNote = (e?: React.SyntheticEvent) => {
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

  // High-reliability container auto-scroll animation ensuring the newest calculation record is always fully visible
  const scrollToBottom = useCallback((instant = false) => {
    const container = tapeContainerRef.current;
    if (!container) return;

    const performScroll = (behavior: ScrollBehavior = 'smooth') => {
      if (!tapeContainerRef.current) return;
      
      // 1. Scroll container directly to scrollHeight
      tapeContainerRef.current.scrollTo({
        top: tapeContainerRef.current.scrollHeight,
        behavior,
      });

      // 2. Also ensure bottom anchor element is scrolled into view
      if (bottomAnchorRef.current) {
        bottomAnchorRef.current.scrollIntoView({
          behavior,
          block: 'end',
          inline: 'nearest',
        });
      }
    };

    if (instant) {
      performScroll('auto');
    } else {
      // Immediate smooth scroll
      performScroll('smooth');

      // Request animation frame passes for render pipeline
      requestAnimationFrame(() => {
        performScroll('smooth');
        requestAnimationFrame(() => performScroll('smooth'));
      });

      // Timed passes to account for Framer Motion item entry expansions
      setTimeout(() => performScroll('smooth'), 50);
      setTimeout(() => performScroll('smooth'), 150);
      setTimeout(() => {
        if (tapeContainerRef.current) {
          tapeContainerRef.current.scrollTop = tapeContainerRef.current.scrollHeight;
        }
      }, 280);
    }
  }, []);

  // Monitor scroll position to show jump-to-bottom indicator when user scrolls up
  const handleScroll = useCallback(() => {
    if (!tapeContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = tapeContainerRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 60;
    setIsNearBottom(atBottom);
  }, []);

  // Trigger auto-scroll animation whenever a new calculation record is added
  useEffect(() => {
    const currentLastId = records[records.length - 1]?.id;
    const isNewRecordAdded = records.length > prevCountRef.current || (records.length > 0 && currentLastId !== prevLastIdRef.current);

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

    let text = '';
    if (formatType === 'excel_tsv') {
      // TSV ready to paste directly into Excel columns
      text = ['Date\tTime\tExpression\tResult\tDecimals',
        ...records.map(
          (r) => `${r.displayDate}\t${r.displayTime}\t${r.expression}\t${r.result}\t${r.decimalPlaces}`
        )
      ].join('\n');
    } else {
      text = records
        .map(
          (r, idx) =>
            `[#${String(idx + 1).padStart(2, '0')}] ${r.displayTime} | ${r.expression} = ${
              r.formattedResult || formatAccountingNumber(r.result, r.decimalPlaces, settings.numberFormat)
            }`
        )
        .join('\n');
    }

    navigator.clipboard.writeText(text);
    setCopyAllStatus(formatType === 'excel_tsv' ? 'Excel TSV Copied!' : 'Tape Copied!');
    setTimeout(() => setCopyAllStatus(null), 2000);
  };

  // Cumulative Tape Sum for Quick Financial Overview
  const totalSum = useMemo(() => {
    return records.reduce(
      (acc, r) => acc + (typeof r.result === 'number' && !isNaN(r.result) ? r.result : 0),
      0
    );
  }, [records]);

  return (
    <div
      id="tape-history-panel"
      className={`flex flex-col h-full rounded-2xl border transition-colors ${
        isLight
          ? 'bg-[#dedbd2] border-stone-300 text-stone-900 shadow-xs'
          : 'bg-slate-900/95 border-slate-800 text-slate-100 shadow-md'
      }`}
    >
      {/* Tape Header & Controls */}
      <div
        className={`flex flex-wrap items-center justify-between gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 border-b text-xs font-medium shrink-0 ${
          isLight ? 'border-stone-300 bg-[#d3cfc4]' : 'border-slate-800/80 bg-slate-950/40'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 font-extrabold tracking-wider uppercase">
            <div className="relative flex items-center justify-center w-3.5 h-3.5">
              {/* Ripple aura radiating 3 times on heartbeat */}
              {isHeartbeating && (
                <span
                  key={`ripple-${heartbeatKey}`}
                  className="absolute inset-0 rounded-full bg-emerald-400 pointer-events-none animate-heartbeat-ripple-3x"
                />
              )}
              {/* Core emerald status indicator with 3-cycle heartbeat pulse */}
              <span
                key={`dot-${heartbeatKey}`}
                className={`w-2.5 h-2.5 rounded-full bg-emerald-500 transition-all ${
                  isHeartbeating
                    ? 'animate-heartbeat-3x ring-2 ring-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.9)]'
                    : 'shadow-2xs border border-emerald-400/40 opacity-90 hover:opacity-100'
                }`}
                title="Audit Tape Status: Active (Flashes 3x on Enter)"
              />
            </div>
            <span className={isLight ? 'text-stone-900 font-bold' : 'text-slate-100 font-bold'}>Audit Tape</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] xl:text-[11px] font-mono font-bold ${
                isLight ? 'bg-stone-200/90 text-stone-900 border border-stone-300' : 'bg-slate-800 text-slate-300 border border-slate-700/60'
              }`}
            >
              {records.length} {records.length === 1 ? 'line' : 'lines'}
            </span>
          </div>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Mode Toggle: Standard vs Compact */}
          <div className={`inline-flex p-0.5 rounded-lg border ${isLight ? 'bg-stone-200/60 border-stone-300' : 'bg-slate-950/60 border-slate-800'}`}>
            <button
              type="button"
              onClick={() => setIsCompact(false)}
              title="Detailed card view with high-res typography"
              className={`px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                !isCompact
                  ? isLight
                    ? 'bg-white text-stone-950 shadow-2xs border border-stone-300/80'
                    : 'bg-slate-800 text-cyan-300 shadow-2xs border border-slate-700'
                  : isLight
                  ? 'text-stone-600 hover:text-stone-900'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Standard
            </button>
            <button
              type="button"
              onClick={() => setIsCompact(true)}
              title="High-density single-line view"
              className={`px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                isCompact
                  ? isLight
                    ? 'bg-cyan-700 text-white shadow-2xs'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-2xs'
                  : isLight
                  ? 'text-stone-600 hover:text-stone-900'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Compact
            </button>
          </div>

          {/* Copy All Button */}
          <button
            id="copy-all-tape-btn"
            onClick={() => handleCopyAll('formatted')}
            disabled={records.length === 0}
            title="Copy all tape lines to clipboard"
            className={`flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1 rounded-md border text-[10px] sm:text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              isLight
                ? 'bg-white hover:bg-stone-50 border-stone-300 text-stone-900 font-bold shadow-2xs'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 shadow-2xs'
            }`}
          >
            {copyAllStatus === 'Tape Copied!' ? (
              <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            <span>{copyAllStatus || 'Copy All'}</span>
          </button>

          {/* Clear Tape Button */}
          <button
            id="clear-tape-btn"
            onClick={handleClearClick}
            disabled={records.length === 0}
            title="Clear all tape history"
            className={`flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1 rounded-md border text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
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

      {/* Modern Streamlined Scroll Area */}
      <div className="relative flex-1 min-h-0 flex flex-col">
        <div
          ref={tapeContainerRef}
          onScroll={handleScroll}
          id="tape-records-container"
          className={`flex-1 overflow-y-auto font-mono select-text ${
            isCompact
              ? 'p-2.5 xl:p-3 pb-12 xl:pb-14 space-y-1.5 xl:space-y-2 text-xs sm:text-sm'
              : 'p-3 sm:p-3.5 xl:p-4.5 2xl:p-5 pb-16 xl:pb-20 space-y-2.5 sm:space-y-3 xl:space-y-3.5 2xl:space-y-4 text-sm xl:text-base'
          } fluid-tape-container`}
          style={{ scrollbarWidth: 'thin' }}
        >
          {records.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16 xl:py-24 opacity-65 select-none">
              <div className="w-12 h-12 xl:w-16 xl:h-16 rounded-2xl border-2 border-dashed border-stone-400 dark:border-slate-700 flex items-center justify-center mb-3 xl:mb-4 bg-stone-100/50 dark:bg-slate-800/40">
                <Sparkles className="w-5 h-5 xl:w-7 xl:h-7 text-cyan-600 dark:text-cyan-400" />
              </div>
              <p className={`text-sm xl:text-base font-bold tracking-wide ${isLight ? 'text-stone-900' : 'text-slate-100'}`}>
                Tape is currently empty
              </p>
              <p className={`text-xs xl:text-sm mt-1 max-w-[280px] font-sans ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>
                Type numbers on your keypad and press Enter to record clear financial audit entries.
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {records.map((rec, index) => {
                const isLatest = index === records.length - 1;
                const isCopied = copiedId === rec.id;
                const isNegative = rec.result < 0 || rec.operationType === 'tax_minus' || rec.operationType === 'discount';

                // Dual Color Ribbon logic: Red for subtractions/negatives, Carbon Black / Emerald for positive
                const resultColorClass = dualColorRibbon && isNegative
                  ? 'text-rose-600 dark:text-rose-400 font-black'
                  : isLight
                  ? 'text-stone-950 font-black'
                  : 'text-emerald-400 font-bold';

                // -------------------------------------------------------------
                // COMPACT STREAMLINED ROW
                // -------------------------------------------------------------
                if (isCompact) {
                  return (
                    <motion.div
                      key={rec.id}
                      id={`tape-line-${rec.id}`}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                      onClick={() => onReuseValue(rec.result)}
                      onDoubleClick={(e) => startEditingNote(rec, e)}
                      title="Click to load result into calculator • Double-click to edit note"
                      className={`group relative flex flex-col px-3 py-1.5 xl:py-2 rounded-lg border text-xs transition-all cursor-pointer ${
                        isLight
                          ? isLatest
                            ? 'bg-amber-50/90 border-amber-300 text-stone-950 font-bold shadow-2xs'
                            : 'bg-white/95 hover:bg-white border-stone-250 hover:border-stone-350 text-stone-900 shadow-2xs'
                          : isLatest
                          ? 'bg-cyan-950/40 border-cyan-700/80 text-cyan-200 font-bold shadow-2xs'
                          : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800 text-slate-200 shadow-2xs'
                      }`}
                    >
                      {/* Left accent indicator */}
                      <div
                        className={`absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r transition-colors ${
                          isLatest
                            ? 'bg-cyan-500'
                            : isNegative
                            ? 'bg-rose-500'
                            : isLight
                            ? 'bg-emerald-600/70'
                            : 'bg-emerald-400/60'
                        }`}
                      />

                      <div className="flex items-center justify-between gap-2 w-full pl-1.5">
                        {/* Left metadata & expression */}
                        <div className="flex items-center gap-1.5 truncate min-w-0 flex-1">
                          <span className={`text-[10px] font-mono font-black shrink-0 ${isLight ? 'text-cyan-800' : 'text-cyan-400'}`}>
                            #{String(index + 1).padStart(2, '0')}
                          </span>
                          <span
                            className={`font-mono text-[9px] xl:text-[10px] px-1.5 py-0.2 rounded border shrink-0 ${
                              isLight
                                ? 'bg-stone-50 border-stone-200 text-stone-600'
                                : 'bg-slate-950 border-slate-800 text-slate-400'
                            }`}
                          >
                            {rec.displayTime}
                          </span>
                          <span
                            className={`truncate font-mono font-medium text-xs xl:text-sm tracking-tight ${
                              isLight ? 'text-stone-800 font-semibold' : 'text-slate-200'
                            }`}
                          >
                            {rec.expression}
                          </span>
                          {rec.note && (
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded border shrink-0 font-sans font-medium flex items-center gap-1 ${
                                isLight
                                  ? 'bg-amber-100 text-amber-950 border-amber-300'
                                  : 'bg-amber-950/50 text-amber-300 border-amber-800/60'
                              }`}
                            >
                              <Tag className="w-2 h-2 shrink-0 text-amber-600" />
                              <span className="truncate max-w-[110px]">{rec.note}</span>
                            </span>
                          )}
                        </div>

                        {/* Right: formatted result and actions */}
                        <div className="flex items-center gap-1.5 shrink-0 ml-auto text-right">
                          <span className={`font-black font-mono tabular-nums text-xs sm:text-sm xl:text-base ${resultColorClass}`}>
                            {rec.formattedResult || formatAccountingNumber(rec.result, rec.decimalPlaces, settings.numberFormat)}
                          </span>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={(e) => startEditingNote(rec, e)}
                              title="Edit note"
                              className="p-0.5 text-stone-400 hover:text-cyan-600 cursor-pointer"
                            >
                              <Tag className="w-2.5 h-2.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleCopyValue(rec, e, false)}
                              title="Copy result"
                              className="p-0.5 text-stone-400 hover:text-emerald-600 cursor-pointer"
                            >
                              {isCopied ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                            </button>
                            <span title="Load into calculator">
                              <ArrowUpRight className="w-2.5 h-2.5 text-cyan-600 dark:text-cyan-400" />
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Inline Note Editor in Compact Mode */}
                      {editingNoteId === rec.id && (
                        <div
                          className="mt-1.5 flex items-center gap-1 w-full pt-1.5 border-t border-dashed border-stone-300 dark:border-slate-700 pl-1.5"
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
                                ? 'bg-white border-cyan-500 text-stone-900 ring-1 ring-cyan-400'
                                : 'bg-slate-950 border-cyan-500 text-slate-100 ring-1 ring-cyan-500'
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
                              isLight ? 'bg-stone-100 border-stone-300 text-stone-700' : 'bg-slate-800 border-slate-700 text-slate-300'
                            }`}
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  );
                }

                // -------------------------------------------------------------
                // STANDARD STREAMLINED CARD LIST DESIGN (High-Resolution Optimized)
                // -------------------------------------------------------------
                return (
                  <motion.div
                    key={rec.id}
                    id={`tape-line-${rec.id}`}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => onReuseValue(rec.result)}
                    onDoubleClick={(e) => startEditingNote(rec, e)}
                    title="Click to load result into calculator • Double-click to edit note"
                    className={`group relative flex flex-col p-3 sm:p-3.5 xl:p-4 2xl:p-4.5 rounded-xl border transition-all cursor-pointer select-text ${
                      isLight
                        ? isLatest
                          ? 'bg-amber-50/90 border-amber-300 shadow-xs ring-1 ring-amber-400/20 text-stone-950'
                          : 'bg-white/95 hover:bg-white border-stone-300/80 hover:border-stone-400 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-xs text-stone-900'
                        : isLatest
                        ? 'bg-cyan-950/40 border-cyan-700/80 shadow-xs ring-1 ring-cyan-500/20 text-slate-100'
                        : 'bg-slate-900/90 hover:bg-slate-850 border-slate-800/90 hover:border-slate-700 shadow-xs text-slate-100'
                    }`}
                  >
                    {/* 3.5px Left Accent Bar for immediate card edge definition */}
                    <div
                      className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full transition-colors ${
                        isLatest
                          ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                          : isNegative
                          ? 'bg-rose-500'
                          : isLight
                          ? 'bg-emerald-600/75'
                          : 'bg-emerald-400/70'
                      }`}
                    />

                    {/* Row 1: Header / Metadata Badge Bar & Action Icons */}
                    <div className="flex items-center justify-between gap-2 pl-1.5 mb-2 sm:mb-2.5">
                      {/* Left metadata tags */}
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
                        {/* Index Number */}
                        <span
                          className={`px-1.5 py-0.5 rounded-md font-mono text-[10px] xl:text-[11px] font-black shrink-0 border ${
                            isLight
                              ? 'bg-stone-100 border-stone-250 text-cyan-800'
                              : 'bg-slate-800 border-slate-700 text-cyan-300'
                          }`}
                        >
                          #{String(index + 1).padStart(2, '0')}
                        </span>

                        {/* Monospace Timestamp */}
                        <span
                          className={`px-1.5 py-0.5 rounded-md font-mono text-[10px] xl:text-[11px] shrink-0 border select-none inline-flex items-center gap-1 ${
                            isLight
                              ? 'bg-stone-50 border-stone-200 text-stone-600 font-medium'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 font-medium'
                          }`}
                          title={`Recorded at ${rec.displayTime}`}
                        >
                          <Clock className="w-2.5 h-2.5 opacity-70" />
                          {rec.displayTime}
                        </span>

                        {/* Special Operation Tag (if applicable) */}
                        {rec.operationType && rec.operationType !== 'arithmetic' && (
                          <span
                            className={`text-[9px] xl:text-[10px] px-1.5 py-0.5 rounded-md font-sans font-bold uppercase shrink-0 border ${
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

                        {/* Latest Indicator Chip */}
                        {isLatest && (
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] xl:text-[10px] font-extrabold uppercase border ${
                              isLight
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                : 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Latest
                          </span>
                        )}
                      </div>

                      {/* Right: Note Badge (if present) + Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {rec.note && editingNoteId !== rec.id && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditingNote(rec, e);
                            }}
                            title="Click to edit note"
                            className={`flex items-center gap-1 text-[10px] xl:text-[11px] px-2 py-0.5 rounded-md font-sans font-medium border max-w-[150px] sm:max-w-[200px] truncate cursor-pointer transition-colors ${
                              isLight
                                ? 'bg-amber-100/80 text-amber-950 border-amber-300 hover:bg-amber-200'
                                : 'bg-amber-950/50 text-amber-300 border-amber-700/60 hover:bg-amber-900/60'
                            }`}
                          >
                            <Tag className="w-2.5 h-2.5 shrink-0 text-amber-600 dark:text-amber-400" />
                            <span className="truncate">{rec.note}</span>
                          </span>
                        )}

                        {/* Action Buttons Toolbar */}
                        <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => startEditingNote(rec, e)}
                            title="Add / Edit Note"
                            className={`p-1 rounded-md text-stone-400 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors cursor-pointer ${
                              isLight ? 'hover:bg-stone-100' : 'hover:bg-slate-800'
                            }`}
                          >
                            <Tag className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleCopyValue(rec, e, false)}
                            title="Copy formatted result"
                            className={`p-1 rounded-md text-stone-400 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors cursor-pointer ${
                              isLight ? 'hover:bg-stone-100' : 'hover:bg-slate-800'
                            }`}
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteRecord(rec.id);
                            }}
                            title="Delete entry"
                            className={`p-1 rounded-md text-stone-400 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors cursor-pointer ${
                              isLight ? 'hover:bg-rose-50' : 'hover:bg-rose-950/50'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onReuseValue(rec.result)}
                            title="Load value into calculator"
                            className={`p-1 rounded-md text-cyan-600 dark:text-cyan-400 transition-colors cursor-pointer ${
                              isLight ? 'hover:bg-cyan-50' : 'hover:bg-cyan-950/50'
                            }`}
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Mathematical Expression & Tabular Result */}
                    <div className="flex items-baseline justify-between gap-3 pl-1.5 w-full">
                      {/* Calculation Expression */}
                      <div
                        className={`font-mono text-sm sm:text-base xl:text-lg 2xl:text-xl font-medium tracking-normal break-words flex-1 min-w-0 select-all ${
                          isLight ? 'text-stone-800 font-semibold' : 'text-slate-200 font-medium'
                        }`}
                        title={rec.expression}
                      >
                        {rec.expression}
                      </div>

                      {/* Tabular Result Total */}
                      <div className="flex items-baseline gap-1.5 shrink-0 text-right ml-auto pl-2">
                        <span
                          className={`font-mono font-bold text-sm sm:text-base xl:text-lg 2xl:text-xl select-none ${
                            isLight ? 'text-stone-400' : 'text-slate-500'
                          }`}
                        >
                          =
                        </span>
                        <span
                          className={`text-base sm:text-lg xl:text-xl 2xl:text-2xl font-black font-mono tabular-nums tracking-tight select-all ${resultColorClass}`}
                        >
                          {rec.formattedResult || formatAccountingNumber(rec.result, rec.decimalPlaces, settings.numberFormat)}
                        </span>
                      </div>
                    </div>

                    {/* Row 3: Inline Note Editor */}
                    {editingNoteId === rec.id && (
                      <div
                        className="mt-2.5 flex items-center gap-1.5 w-full pt-2 border-t border-dashed border-stone-300 dark:border-slate-700 pl-1.5"
                        onClick={(e) => e.stopPropagation()}
                        onDoubleClick={(e) => e.stopPropagation()}
                      >
                        <Tag className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
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
                          placeholder="Type note (e.g. Invoice #104, Tax deduction)..."
                          className={`flex-1 px-2.5 py-1 text-xs xl:text-sm rounded-lg border outline-none font-sans ${
                            isLight
                              ? 'bg-white border-cyan-500 text-stone-900 ring-1 ring-cyan-400 shadow-xs'
                              : 'bg-slate-950 border-cyan-500 text-slate-100 ring-1 ring-cyan-500 shadow-xs'
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
                              ? 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-800'
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

          {/* Bottom Anchor target for auto-scrolling */}
          <div ref={bottomAnchorRef} id="tape-bottom-anchor" className="h-4 w-full shrink-0 pointer-events-none" aria-hidden="true" />
        </div>

        {/* Floating Scroll to Latest Button */}
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
                ? 'bg-stone-900 text-white border-stone-700 hover:bg-stone-800'
                : 'bg-cyan-500 text-slate-950 border-cyan-400 hover:bg-cyan-400'
            }`}
          >
            <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
            <span>Latest Entry</span>
          </button>
        )}
      </div>

      {/* Tape Footer with Running Total & Export Actions */}
      <div
        className={`flex flex-wrap items-center justify-between gap-2 p-2.5 sm:p-3 border-t text-xs shrink-0 ${
          isLight ? 'border-stone-300 bg-[#f5f3ef]' : 'border-slate-800 bg-slate-950/40'
        }`}
      >
        {/* Left: Entry count & running tape sum */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          <span className={`text-[10px] sm:text-[11px] font-bold ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>
            {records.length} {records.length === 1 ? 'entry' : 'entries'}
          </span>
          {records.length > 0 && (
            <>
              <span className={isLight ? 'text-stone-400' : 'text-slate-700'}>•</span>
              <span className={`text-[10px] sm:text-[11px] font-mono font-bold ${isLight ? 'text-stone-900' : 'text-slate-200'}`}>
                Sum:{' '}
                <span className={isLight ? 'text-emerald-800 font-extrabold' : 'text-emerald-400 font-extrabold'}>
                  {formatAccountingNumber(totalSum, settings.decimalPlaces, settings.numberFormat)}
                </span>
              </span>
            </>
          )}
        </div>

        {/* Right: Print, Excel, PDF Export Buttons */}
        <div className="flex items-center gap-1.5">
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
            <span>Print</span>
          </button>

          <button
            id="export-excel-tape-footer"
            onClick={onExportExcel}
            disabled={records.length === 0}
            title="Export full calculation audit tape to Microsoft Excel (.XLSX) file"
            className={`flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md border text-[10px] sm:text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              isLight
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-700 shadow-xs'
                : 'bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-600 shadow-xs'
            }`}
          >
            <FileSpreadsheet className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Export Excel</span>
          </button>

          <button
            id="export-pdf-tape-footer"
            onClick={onExportPdf}
            disabled={records.length === 0}
            title="Export calculation audit tape to PDF"
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
