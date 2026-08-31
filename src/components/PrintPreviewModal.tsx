import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Printer,
  X,
  FileSpreadsheet,
  Download,
  Sliders,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  Building,
  FileText,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { CalculationRecord, CalculatorSettings, PrintOptions, PrintPaperSize, PrintOrientation, PrintColorMode, PrintDensity, PrintWatermark } from '../types';
import { formatAccountingNumber } from '../utils/numberFormat';
import { generatePdfReport } from '../utils/pdfReport';
import { NumerixLogo } from './NumerixLogo';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: CalculationRecord[];
  settings: CalculatorSettings;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  records,
  settings,
}) => {
  // Print & Layout Options State
  const [options, setOptions] = useState<PrintOptions>({
    paperSize: 'A4',
    orientation: 'portrait',
    colorMode: 'color',
    density: 'standard',
    scale: 100,
    title: 'CALCULATION AUDIT REPORT',
    memo: '',
    showLogo: true,
    showCompanyHeader: true,
    showSummaryRibbon: true,
    showTimestamps: true,
    showLineNumbers: true,
    showOperationTypes: true,
    showNotes: true,
    showSignatures: true,
    showPageNumbers: true,
    watermark: 'NONE',
  });

  const [previewZoom, setPreviewZoom] = useState<number>(100);
  const [activeTab, setActiveTab] = useState<'layout' | 'content' | 'templates'>('layout');
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  // Summary Metrics calculations
  const { sum, avg, max, min, count } = useMemo(() => {
    let s = 0;
    let mi = records[0]?.result ?? 0;
    let ma = records[0]?.result ?? 0;
    records.forEach((r) => {
      s += r.result;
      if (r.result < mi) mi = r.result;
      if (r.result > ma) ma = r.result;
    });
    return {
      sum: s,
      avg: records.length > 0 ? s / records.length : 0,
      max: ma,
      min: mi,
      count: records.length,
    };
  }, [records]);

  if (!isOpen) return null;

  // Preset Template Handlers
  const applyTemplate = (preset: 'audit' | 'receipt' | 'executive' | 'eco') => {
    if (preset === 'audit') {
      setOptions({
        ...options,
        paperSize: 'A4',
        orientation: 'portrait',
        colorMode: 'color',
        density: 'standard',
        title: 'OFFICIAL CALCULATION AUDIT REPORT',
        showLogo: true,
        showCompanyHeader: true,
        showSummaryRibbon: true,
        showTimestamps: true,
        showLineNumbers: true,
        showOperationTypes: true,
        showNotes: true,
        showSignatures: true,
        watermark: 'AUDITED',
      });
    } else if (preset === 'receipt') {
      setOptions({
        ...options,
        paperSize: 'Receipt',
        orientation: 'portrait',
        colorMode: 'grayscale',
        density: 'compact',
        title: 'ACCOUNTING TAPE RECEIPT',
        showLogo: false,
        showCompanyHeader: true,
        showSummaryRibbon: true,
        showTimestamps: true,
        showLineNumbers: true,
        showOperationTypes: false,
        showNotes: false,
        showSignatures: false,
        watermark: 'NONE',
      });
    } else if (preset === 'executive') {
      setOptions({
        ...options,
        paperSize: 'A4',
        orientation: 'landscape',
        colorMode: 'color',
        density: 'spacious',
        title: 'EXECUTIVE FINANCIAL SUMMARY',
        showLogo: true,
        showCompanyHeader: true,
        showSummaryRibbon: true,
        showTimestamps: true,
        showLineNumbers: true,
        showOperationTypes: true,
        showNotes: true,
        showSignatures: true,
        watermark: 'CONFIDENTIAL',
      });
    } else if (preset === 'eco') {
      setOptions({
        ...options,
        paperSize: 'A4',
        orientation: 'portrait',
        colorMode: 'ink_saver',
        density: 'compact',
        title: 'CALCULATION AUDIT REPORT',
        showLogo: false,
        showCompanyHeader: true,
        showSummaryRibbon: true,
        showTimestamps: true,
        showLineNumbers: true,
        showOperationTypes: true,
        showNotes: true,
        showSignatures: false,
        watermark: 'NONE',
      });
    }
  };

  // Trigger Native Browser Print
  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 150);
  };

  // Export PDF with exact options
  const handleExportPdf = () => {
    generatePdfReport(records, settings, options);
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const isReceipt = options.paperSize === 'Receipt';
  const isLandscape = options.orientation === 'landscape' && !isReceipt;

  return (
    <div
      id="print-preview-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-hidden"
    >
      {/* Dynamic Print Page Media Styling */}
      <style>{`
        @media print {
          @page {
            size: ${isReceipt ? '80mm auto' : `${options.paperSize} ${options.orientation}`};
            margin: ${isReceipt ? '3mm 4mm' : '8mm 12mm 8mm 12mm'};
          }
        }
      `}</style>

      <motion.div
        id="print-preview-modal"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="relative flex flex-col w-full max-w-7xl h-[92vh] bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div id="print-modal-header" className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  Print & Printer Preview
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {records.length} {records.length === 1 ? 'Entry' : 'Entries'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                WYSIWYG layout preview with custom printer formatting, margins, and paper sizing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="print-action-btn-header"
              onClick={handlePrint}
              disabled={records.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Printer className="w-4 h-4" />
              <span>Print Now</span>
            </button>

            <button
              id="download-pdf-preview-btn"
              onClick={handleExportPdf}
              disabled={records.length === 0}
              title="Download as PDF file"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Save PDF</span>
            </button>

            <button
              id="close-print-preview-btn"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Area: Options Sidebar + Live Paper Preview */}
        <div id="print-modal-body" className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
          {/* Left Column: Print Options & Controls */}
          <div id="print-modal-sidebar" className="w-full lg:w-96 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950/40 shrink-0">
            {/* Sidebar Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-900/60 p-1.5 gap-1 shrink-0">
              <button
                onClick={() => setActiveTab('layout')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'layout'
                    ? 'bg-slate-800 text-cyan-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Paper & Layout</span>
              </button>
              <button
                onClick={() => setActiveTab('content')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'content'
                    ? 'bg-slate-800 text-cyan-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Content & Data</span>
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'templates'
                    ? 'bg-slate-800 text-cyan-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Presets</span>
              </button>
            </div>

            {/* Scrollable Option Form */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {activeTab === 'layout' && (
                <div className="space-y-4">
                  {/* Paper Size */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Paper Size</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['A4', 'Letter', 'Legal', 'Receipt'] as PrintPaperSize[]).map((size) => (
                        <button
                          key={size}
                          onClick={() => setOptions({ ...options, paperSize: size })}
                          className={`py-2 px-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer text-left ${
                            options.paperSize === size
                              ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500/40'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="font-bold">{size}</div>
                          <div className="text-[10px] text-slate-400">
                            {size === 'A4' && '210 × 297 mm'}
                            {size === 'Letter' && '8.5 × 11 in'}
                            {size === 'Legal' && '8.5 × 14 in'}
                            {size === 'Receipt' && '80mm POS Roll'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Orientation (disabled for Receipt) */}
                  {options.paperSize !== 'Receipt' && (
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1.5">Orientation</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => setOptions({ ...options, orientation: 'portrait' })}
                          className={`py-2 px-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                            options.orientation === 'portrait'
                              ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500/40 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          📄 Portrait (Vertical)
                        </button>
                        <button
                          onClick={() => setOptions({ ...options, orientation: 'landscape' })}
                          className={`py-2 px-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                            options.orientation === 'landscape'
                              ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500/40 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          📑 Landscape (Wide)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Color Mode */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Color & Contrast Mode</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'color', label: 'Color', desc: 'Navy/Cyan' },
                        { id: 'grayscale', label: 'Grayscale', desc: 'Monochrome' },
                        { id: 'ink_saver', label: 'Eco Saver', desc: 'Minimal Ink' },
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          onClick={() => setOptions({ ...options, colorMode: mode.id as PrintColorMode })}
                          className={`py-1.5 px-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer text-center ${
                            options.colorMode === mode.id
                              ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500/40 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div>{mode.label}</div>
                          <div className="text-[10px] opacity-60">{mode.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Table Density */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Row Spacing & Density</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'compact', label: 'Compact', desc: 'More Rows' },
                        { id: 'standard', label: 'Standard', desc: 'Balanced' },
                        { id: 'spacious', label: 'Spacious', desc: 'Large Print' },
                      ].map((d) => (
                        <button
                          key={d.id}
                          onClick={() => setOptions({ ...options, density: d.id as PrintDensity })}
                          className={`py-1.5 px-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer text-center ${
                            options.density === d.id
                              ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500/40 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div>{d.label}</div>
                          <div className="text-[10px] opacity-60">{d.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                    {/* Watermark Selector */}
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1.5">Watermark Stamp</label>
                      <select
                        value={options.watermark}
                        onChange={(e) => setOptions({ ...options, watermark: e.target.value as PrintWatermark })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
                      >
                        <option value="NONE">None (Clean Background)</option>
                        <option value="NUMERIX_IOOC">NumeriX logo + IOOC-ShirazOffice</option>
                        <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                        <option value="DRAFT">DRAFT</option>
                        <option value="AUDITED">AUDITED</option>
                        <option value="APPROVED">APPROVED</option>
                        <option value="COPY">COPY</option>
                      </select>
                    </div>
                </div>
              )}

              {activeTab === 'content' && (
                <div className="space-y-4">
                  {/* Custom Title & Memo */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Document Title</label>
                    <input
                      type="text"
                      value={options.title}
                      onChange={(e) => setOptions({ ...options, title: e.target.value })}
                      placeholder="e.g. CALCULATION AUDIT REPORT"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Header Memo / Reference Note</label>
                    <input
                      type="text"
                      value={options.memo}
                      onChange={(e) => setOptions({ ...options, memo: e.target.value })}
                      placeholder="e.g. Shiraz Office - Q3 Financial Review"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Section Toggles */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="block font-semibold text-slate-300">Visible Sections & Details</span>

                    <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800/80 cursor-pointer hover:bg-slate-800/60">
                      <span>Show Company Header & Name</span>
                      <input
                        type="checkbox"
                        checked={options.showCompanyHeader}
                        onChange={(e) => setOptions({ ...options, showCompanyHeader: e.target.checked })}
                        className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500/40 bg-slate-800 border-slate-700 cursor-pointer"
                      />
                    </label>

                    {settings.logoDataUrl && (
                      <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800/80 cursor-pointer hover:bg-slate-800/60">
                        <span>Show Corporate Logo</span>
                        <input
                          type="checkbox"
                          checked={options.showLogo}
                          onChange={(e) => setOptions({ ...options, showLogo: e.target.checked })}
                          className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500/40 bg-slate-800 border-slate-700 cursor-pointer"
                        />
                      </label>
                    )}

                    <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800/80 cursor-pointer hover:bg-slate-800/60">
                      <span>Executive Summary Ribbon (Σ Sum / Avg)</span>
                      <input
                        type="checkbox"
                        checked={options.showSummaryRibbon}
                        onChange={(e) => setOptions({ ...options, showSummaryRibbon: e.target.checked })}
                        className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500/40 bg-slate-800 border-slate-700 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800/80 cursor-pointer hover:bg-slate-800/60">
                      <span>Line Numbers (#1, #2, ...)</span>
                      <input
                        type="checkbox"
                        checked={options.showLineNumbers}
                        onChange={(e) => setOptions({ ...options, showLineNumbers: e.target.checked })}
                        className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500/40 bg-slate-800 border-slate-700 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800/80 cursor-pointer hover:bg-slate-800/60">
                      <span>Time & Timestamp Column</span>
                      <input
                        type="checkbox"
                        checked={options.showTimestamps}
                        onChange={(e) => setOptions({ ...options, showTimestamps: e.target.checked })}
                        className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500/40 bg-slate-800 border-slate-700 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800/80 cursor-pointer hover:bg-slate-800/60">
                      <span>Operation Type Tags (TAX, %, etc.)</span>
                      <input
                        type="checkbox"
                        checked={options.showOperationTypes}
                        onChange={(e) => setOptions({ ...options, showOperationTypes: e.target.checked })}
                        className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500/40 bg-slate-800 border-slate-700 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800/80 cursor-pointer hover:bg-slate-800/60">
                      <span>Item Annotations & Notes</span>
                      <input
                        type="checkbox"
                        checked={options.showNotes}
                        onChange={(e) => setOptions({ ...options, showNotes: e.target.checked })}
                        className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500/40 bg-slate-800 border-slate-700 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800/80 cursor-pointer hover:bg-slate-800/60">
                      <span>Accountant Verification Signature Box</span>
                      <input
                        type="checkbox"
                        checked={options.showSignatures}
                        onChange={(e) => setOptions({ ...options, showSignatures: e.target.checked })}
                        className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500/40 bg-slate-800 border-slate-700 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'templates' && (
                <div className="space-y-2.5">
                  <p className="text-slate-400 text-xs mb-2">
                    Select a curated format preset to quickly reconfigure printer dimensions, color modes, and layout styles:
                  </p>

                  <button
                    onClick={() => applyTemplate('audit')}
                    className="w-full text-left p-3 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-cyan-300">🏢 Official Tax & Audit Report</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400">A4 Portrait</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Full corporate header, logo, executive summary ribbon, verification signature lines, and AUDITED stamp.
                    </p>
                  </button>

                  <button
                    onClick={() => applyTemplate('receipt')}
                    className="w-full text-left p-3 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-amber-300">🧾 80mm POS Paper Tape Slip</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">Continuous Slip</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Narrow ribbon format optimized for thermal receipt printers, itemized line entries, and running totals.
                    </p>
                  </button>

                  <button
                    onClick={() => applyTemplate('executive')}
                    className="w-full text-left p-3 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-indigo-300">📊 Executive Landscape Sheet</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400">Wide A4</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Spacious wide-margin layout designed for boardroom reviews and financial oversight binders.
                    </p>
                  </button>

                  <button
                    onClick={() => applyTemplate('eco')}
                    className="w-full text-left p-3 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-emerald-300">🌱 Ink-Saver Monochrome</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Eco Friendly</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Zero dark fills, pure black-and-white thin borders, compact line spacing for high ink conservation.
                    </p>
                  </button>
                </div>
              )}
            </div>

            {/* Print Button in Sidebar Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/60 shrink-0">
              <button
                id="print-sidebar-submit-btn"
                onClick={handlePrint}
                disabled={records.length === 0}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-950/50 transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Printer className="w-4 h-4" />
                <span>Send to Printer ({options.paperSize})</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Sheet Preview Canvas */}
          <div id="print-preview-canvas-container" className="flex-1 flex flex-col min-w-0 bg-slate-950/80 overflow-hidden">
            {/* Preview Toolbar */}
            <div id="print-preview-toolbar" className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/50 shrink-0">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <span>Format: <strong>{options.paperSize}</strong></span>
                <span>•</span>
                <span>Mode: <strong>{options.orientation}</strong></span>
                <span>•</span>
                <span>Colors: <strong>{options.colorMode}</strong></span>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-slate-800/80 rounded-lg p-0.5 border border-slate-700">
                <button
                  onClick={() => setPreviewZoom(Math.max(50, previewZoom - 10))}
                  title="Zoom out"
                  className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-700 cursor-pointer"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 font-mono text-[11px] font-bold text-slate-200">
                  {previewZoom}%
                </span>
                <button
                  onClick={() => setPreviewZoom(Math.min(150, previewZoom + 10))}
                  title="Zoom in"
                  className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-700 cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPreviewZoom(100)}
                  title="Reset 100%"
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700 cursor-pointer ml-0.5"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Scrollable Sheet Stage */}
            <div id="print-sheet-stage" className="flex-1 overflow-auto p-4 sm:p-8 flex items-start justify-center">
              <div
                id="print-sheet-paper"
                style={{
                  transform: `scale(${previewZoom / 100})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.15s ease-out',
                }}
                className={`bg-white text-slate-900 shadow-2xl rounded-sm transition-all relative select-text ${
                  isReceipt
                    ? 'w-[320px] p-4 text-[11px]'
                    : isLandscape
                    ? 'w-[900px] min-h-[620px] p-8 text-xs'
                    : 'w-[720px] min-h-[920px] p-8 text-xs'
                } ${
                  options.colorMode === 'grayscale'
                    ? 'grayscale'
                    : options.colorMode === 'ink_saver'
                    ? 'border border-slate-300'
                    : ''
                }`}
              >
                {/* Printable Content Target Area */}
                <div id="printable-report-area" className="relative w-full h-full flex flex-col font-sans">
                  {/* Watermark Overlay */}
                  {options.watermark !== 'NONE' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
                      {options.watermark === 'NUMERIX_IOOC' ? (
                        <div className="flex flex-col items-center justify-center gap-2 transform -rotate-30 border-4 border-slate-300/40 px-10 py-5 rounded-3xl opacity-40">
                          <NumerixLogo size="lg" variant="icon" isLight={true} />
                          <span className="text-slate-500 font-black text-2xl md:text-3xl tracking-widest uppercase text-center font-sans">
                            NUMERIX • IOOC-SHIRAZ OFFICE
                          </span>
                        </div>
                      ) : (
                        <div className="text-slate-200/50 font-black text-6xl md:text-8xl transform -rotate-30 tracking-widest uppercase border-4 border-slate-200/40 px-8 py-3 rounded-3xl">
                          {options.watermark}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="relative z-10 flex flex-col h-full">
                    {/* 1. Header Section */}
                    {options.showCompanyHeader && (
                      <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4 mb-4">
                        <div className="flex items-center gap-3">
                          {options.showLogo && (
                            <div className="shrink-0">
                              <NumerixLogo size="sm" variant="horizontal" isLight={true} />
                            </div>
                          )}
                          <div>
                            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                              {settings.companyName || 'IOOC - Shiraz Office'}
                            </h1>
                            <p className="text-[11px] text-slate-600">
                              {settings.department || 'Finance & Accounting'} • Operator:{' '}
                              <strong>{settings.operatorName || 'N.Shaaeri'}</strong>
                            </p>
                            {options.memo && (
                              <p className="text-[10px] italic text-slate-500 mt-0.5">
                                Memo: {options.memo}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <h2 className="text-sm font-bold text-cyan-900 tracking-wider">
                            {options.title}
                          </h2>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                            Date: {currentDate} {currentTime}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* 2. Summary Metric Ribbon */}
                    {options.showSummaryRibbon && (
                      <div
                        className={`rounded-lg p-2.5 mb-4 border text-[11px] font-mono grid grid-cols-4 gap-2 ${
                          options.colorMode === 'ink_saver'
                            ? 'bg-transparent border-slate-300 text-slate-800'
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div>
                          <span className="block text-[9px] font-sans uppercase font-bold text-slate-500">
                            Total Records
                          </span>
                          <span className="font-bold text-xs">{count}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-sans uppercase font-bold text-slate-500">
                            Cumulative Sum
                          </span>
                          <span className="font-bold text-xs text-slate-900">
                            {formatAccountingNumber(sum, settings.decimalPlaces, settings.numberFormat)}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-sans uppercase font-bold text-slate-500">
                            Average Value
                          </span>
                          <span className="font-bold text-xs">
                            {formatAccountingNumber(avg, settings.decimalPlaces, settings.numberFormat)}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-sans uppercase font-bold text-slate-500">
                            Max Value
                          </span>
                          <span className="font-bold text-xs">
                            {formatAccountingNumber(max, settings.decimalPlaces, settings.numberFormat)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* 3. Itemized Tape Records Table */}
                    <div className="flex-1 min-h-0 mb-6">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b-2 border-slate-800 text-slate-900 text-[11px] font-bold">
                            {options.showLineNumbers && (
                              <th className="py-1.5 px-2 w-8 text-center">#</th>
                            )}
                            {options.showTimestamps && (
                              <th className="py-1.5 px-2 w-20 text-center font-mono">Time</th>
                            )}
                            <th className="py-1.5 px-2">Mathematical Expression</th>
                            {options.showOperationTypes && (
                              <th className="py-1.5 px-2 w-24 text-center">Type</th>
                            )}
                            <th className="py-1.5 px-2 text-right">Result</th>
                          </tr>
                        </thead>
                        <tbody className="font-mono text-slate-800 divide-y divide-slate-200">
                          {records.map((record, index) => {
                            const isCompact = options.density === 'compact';
                            const isSpacious = options.density === 'spacious';
                            const paddingY = isCompact ? 'py-1' : isSpacious ? 'py-2.5' : 'py-1.5';
                            const fontSize = isCompact ? 'text-[10px]' : isSpacious ? 'text-xs' : 'text-[11px]';

                            return (
                              <tr
                                key={record.id || index}
                                className={`page-break-inside-avoid ${
                                  index % 2 === 1 && options.colorMode !== 'ink_saver'
                                    ? 'bg-slate-50/60'
                                    : ''
                                } ${fontSize}`}
                              >
                                {options.showLineNumbers && (
                                  <td className={`${paddingY} px-2 text-center text-slate-500 font-mono text-[10px]`}>
                                    {String(index + 1).padStart(2, '0')}
                                  </td>
                                )}
                                {options.showTimestamps && (
                                  <td className={`${paddingY} px-2 text-center text-slate-500 text-[10px]`}>
                                    {record.displayTime || ''}
                                  </td>
                                )}
                                <td className={`${paddingY} px-2 text-slate-800 font-sans font-medium`}>
                                  <div>{record.expression}</div>
                                  {options.showNotes && record.note && (
                                    <div className="text-[10px] text-cyan-700 italic font-sans mt-0.5">
                                      📝 {record.note}
                                    </div>
                                  )}
                                </td>
                                {options.showOperationTypes && (
                                  <td className={`${paddingY} px-2 text-center`}>
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-sans font-bold uppercase bg-slate-200 text-slate-700">
                                      {record.operationType
                                        ? record.operationType.toUpperCase().replace('_', ' ')
                                        : 'MATH'}
                                    </span>
                                  </td>
                                )}
                                <td className={`${paddingY} px-2 text-right font-bold text-slate-900`}>
                                  {record.formattedResult ||
                                    formatAccountingNumber(record.result, record.decimalPlaces, settings.numberFormat)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* 4. Verification Signatures Block */}
                    {options.showSignatures && (
                      <div className="page-break-inside-avoid pt-6 mt-auto border-t border-slate-300 grid grid-cols-2 gap-8 text-[10px] text-slate-600">
                        <div>
                          <div className="border-b border-slate-400 pb-1 mb-1">
                            <span className="font-semibold text-slate-800">
                              Prepared By: {settings.operatorName || 'Operator'}
                            </span>
                          </div>
                          <span className="italic text-slate-500">Accountant Signature & Stamp</span>
                        </div>
                        <div>
                          <div className="border-b border-slate-400 pb-1 mb-1">
                            <span className="font-semibold text-slate-800">Verified & Approved By:</span>
                          </div>
                          <span className="italic text-slate-500">Finance Manager Sign-off & Date</span>
                        </div>
                      </div>
                    )}

                    {/* 5. Document Page Footer */}
                    {options.showPageNumbers && (
                      <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-400 font-sans">
                        <span>IOOC-ShirazOffice | System Audit Tape</span>
                        <span>Page 1 of 1</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
