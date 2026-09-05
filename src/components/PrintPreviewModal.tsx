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
  const isLight = settings.theme === 'light';

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
      className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-xs overflow-hidden ${
        isLight ? 'bg-stone-900/50' : 'bg-black/80'
      }`}
    >
      {/* Dynamic Print Page Media Styling */}
      <style>{`
        @media print {
          @page {
            size: ${isReceipt ? '80mm auto' : `${options.paperSize} ${options.orientation}`};
            margin: ${isReceipt ? '3mm 4mm' : '8mm 12mm 8mm 12mm'};
          }
          html, body, #root, #app-root-container, #print-preview-modal-backdrop, #print-preview-modal, #print-modal-body, #print-preview-canvas-container, #print-sheet-stage, #print-sheet-paper, #printable-report-area {
            background: #ffffff !important;
            background-color: #ffffff !important;
            min-height: 0 !important;
            height: auto !important;
          }
          #printable-report-area, #printable-report-area * {
            background-color: #ffffff !important;
          }
        }
      `}</style>

      <motion.div
        id="print-preview-modal"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className={`relative flex flex-col w-full max-w-7xl h-[92vh] rounded-2xl shadow-2xl overflow-hidden border ${
          isLight
            ? 'bg-[#e6e4df] border-stone-300 text-stone-900'
            : 'bg-slate-900 border-slate-700 text-slate-100'
        }`}
      >
        {/* Modal Header */}
        <div
          id="print-modal-header"
          className={`flex items-center justify-between px-4 sm:px-6 py-3.5 border-b shrink-0 ${
            isLight
              ? 'bg-[#dedbd2] border-stone-300 text-stone-900'
              : 'bg-slate-950/70 border-slate-800 text-slate-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl border ${
                isLight
                  ? 'bg-cyan-500/15 text-cyan-800 border-cyan-500/30'
                  : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
              }`}
            >
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-base sm:text-lg font-bold tracking-tight ${isLight ? 'text-stone-900' : 'text-white'}`}>
                  Print & Printer Preview
                </h2>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                    isLight
                      ? 'bg-emerald-500/15 text-emerald-800 border-emerald-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {records.length} {records.length === 1 ? 'Entry' : 'Entries'}
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>
                WYSIWYG layout preview with custom printer formatting, margins, and paper sizing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="print-action-btn-header"
              onClick={handlePrint}
              disabled={records.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Printer className="w-4 h-4" />
              <span>Print Now</span>
            </button>

            <button
              id="download-pdf-preview-btn"
              onClick={handleExportPdf}
              disabled={records.length === 0}
              title="Download as PDF file"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border font-semibold text-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                isLight
                  ? 'bg-white hover:bg-stone-100 text-stone-800 border-stone-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Download className="w-4 h-4 text-cyan-500" />
              <span className="hidden sm:inline">Save PDF</span>
            </button>

            <button
              id="close-print-preview-btn"
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isLight
                  ? 'text-stone-500 hover:text-stone-900 hover:bg-stone-200'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Area: Options Sidebar + Live Paper Preview */}
        <div id="print-modal-body" className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
          {/* Left Column: Print Options & Controls */}
          <div
            id="print-modal-sidebar"
            className={`w-full lg:w-96 flex flex-col border-b lg:border-b-0 lg:border-r shrink-0 ${
              isLight
                ? 'border-stone-300 bg-[#dedbd2]/60 text-stone-800'
                : 'border-slate-800 bg-slate-950/40 text-slate-200'
            }`}
          >
            {/* Sidebar Header */}
            <div
              className={`flex items-center gap-2 p-3 border-b shrink-0 ${
                isLight ? 'border-stone-300 bg-[#dedbd2]' : 'border-slate-800 bg-slate-900/60'
              }`}
            >
              <Sliders className={`w-4 h-4 ${isLight ? 'text-cyan-800' : 'text-cyan-400'}`} />
              <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-stone-800' : 'text-slate-200'}`}>
                Paper & Layout Settings
              </span>
            </div>

            {/* Scrollable Option Form */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              <div className="space-y-4">
                {/* Paper Size */}
                <div>
                  <label className={`block font-semibold mb-1.5 ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>
                    Paper Size
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['A4', 'Letter', 'Legal', 'Receipt'] as PrintPaperSize[]).map((size) => (
                      <button
                        key={size}
                        onClick={() => setOptions({ ...options, paperSize: size })}
                        className={`py-2 px-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer text-left ${
                          options.paperSize === size
                            ? isLight
                              ? 'bg-cyan-50 border-cyan-500 text-cyan-950 ring-1 ring-cyan-500/50 font-bold shadow-xs'
                              : 'bg-cyan-950/60 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500/40'
                            : isLight
                            ? 'bg-white border-stone-300 text-stone-800 hover:bg-stone-50'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="font-bold">{size}</div>
                        <div className={`text-[10px] ${options.paperSize === size ? (isLight ? 'text-cyan-800' : 'text-cyan-300/80') : (isLight ? 'text-stone-500' : 'text-slate-400')}`}>
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
                    <label className={`block font-semibold mb-1.5 ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>
                      Orientation
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => setOptions({ ...options, orientation: 'portrait' })}
                        className={`py-2 px-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                          options.orientation === 'portrait'
                            ? isLight
                              ? 'bg-cyan-50 border-cyan-500 text-cyan-950 ring-1 ring-cyan-500/50 font-bold'
                              : 'bg-cyan-950/60 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500/40 font-bold'
                            : isLight
                            ? 'bg-white border-stone-300 text-stone-800 hover:bg-stone-50'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        📄 Portrait (Vertical)
                      </button>
                      <button
                        onClick={() => setOptions({ ...options, orientation: 'landscape' })}
                        className={`py-2 px-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                          options.orientation === 'landscape'
                            ? isLight
                              ? 'bg-cyan-50 border-cyan-500 text-cyan-950 ring-1 ring-cyan-500/50 font-bold'
                              : 'bg-cyan-950/60 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500/40 font-bold'
                            : isLight
                            ? 'bg-white border-stone-300 text-stone-800 hover:bg-stone-50'
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
                  <label className={`block font-semibold mb-1.5 ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>
                    Color & Contrast Mode
                  </label>
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
                            ? isLight
                              ? 'bg-cyan-50 border-cyan-500 text-cyan-950 ring-1 ring-cyan-500/50 font-bold'
                              : 'bg-cyan-950/60 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500/40 font-bold'
                            : isLight
                            ? 'bg-white border-stone-300 text-stone-800 hover:bg-stone-50'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div>{mode.label}</div>
                        <div className={`text-[10px] ${options.colorMode === mode.id ? (isLight ? 'text-cyan-800' : 'text-cyan-300/70') : (isLight ? 'text-stone-500' : 'opacity-60')}`}>{mode.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table Density */}
                <div>
                  <label className={`block font-semibold mb-1.5 ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>
                    Row Spacing & Density
                  </label>
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
                            ? isLight
                              ? 'bg-cyan-50 border-cyan-500 text-cyan-950 ring-1 ring-cyan-500/50 font-bold'
                              : 'bg-cyan-950/60 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500/40 font-bold'
                            : isLight
                            ? 'bg-white border-stone-300 text-stone-800 hover:bg-stone-50'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div>{d.label}</div>
                        <div className={`text-[10px] ${options.density === d.id ? (isLight ? 'text-cyan-800' : 'text-cyan-300/70') : (isLight ? 'text-stone-500' : 'opacity-60')}`}>{d.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Watermark Selector */}
                <div>
                  <label className={`block font-semibold mb-1.5 ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>
                    Watermark Stamp
                  </label>
                  <select
                    value={options.watermark}
                    onChange={(e) => setOptions({ ...options, watermark: e.target.value as PrintWatermark })}
                    className={`w-full rounded-lg px-3 py-2 border focus:outline-none focus:border-cyan-500 cursor-pointer ${
                      isLight
                        ? 'bg-white border-stone-300 text-stone-900'
                        : 'bg-slate-900 border-slate-800 text-slate-200'
                    }`}
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
            </div>

            {/* Print Button in Sidebar Footer */}
            <div
              className={`p-3 border-t shrink-0 ${
                isLight ? 'border-stone-300 bg-[#dedbd2]' : 'border-slate-800 bg-slate-950/60'
              }`}
            >
              <button
                id="print-sidebar-submit-btn"
                onClick={handlePrint}
                disabled={records.length === 0}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Printer className="w-4 h-4" />
                <span>Send to Printer ({options.paperSize})</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Sheet Preview Canvas */}
          <div
            id="print-preview-canvas-container"
            className={`flex-1 flex flex-col min-w-0 overflow-hidden ${
              isLight ? 'bg-[#e6e4df]' : 'bg-slate-950/80'
            }`}
          >
            {/* Preview Toolbar */}
            <div
              id="print-preview-toolbar"
              className={`flex items-center justify-between px-4 py-2 border-b shrink-0 ${
                isLight ? 'border-stone-300 bg-[#dedbd2] text-stone-700' : 'border-slate-800 bg-slate-900/50 text-slate-400'
              }`}
            >
              <div className={`flex items-center gap-2 text-xs font-mono ${isLight ? 'text-stone-700' : 'text-slate-400'}`}>
                <span>Format: <strong className={isLight ? 'text-stone-900 font-bold' : 'text-slate-200'}>{options.paperSize}</strong></span>
                <span>•</span>
                <span>Mode: <strong className={isLight ? 'text-stone-900 font-bold' : 'text-slate-200'}>{options.orientation}</strong></span>
                <span>•</span>
                <span>Colors: <strong className={isLight ? 'text-stone-900 font-bold' : 'text-slate-200'}>{options.colorMode}</strong></span>
              </div>

              {/* Zoom Controls */}
              <div
                className={`flex items-center gap-1 rounded-lg p-0.5 border ${
                  isLight ? 'bg-stone-200/90 border-stone-300' : 'bg-slate-800/80 border-slate-700'
                }`}
              >
                <button
                  onClick={() => setPreviewZoom(Math.max(50, previewZoom - 10))}
                  title="Zoom out"
                  className={`p-1 rounded cursor-pointer transition-colors ${
                    isLight ? 'text-stone-700 hover:text-stone-950 hover:bg-stone-300' : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className={`px-2 font-mono text-[11px] font-bold ${isLight ? 'text-stone-900' : 'text-slate-200'}`}>
                  {previewZoom}%
                </span>
                <button
                  onClick={() => setPreviewZoom(Math.min(150, previewZoom + 10))}
                  title="Zoom in"
                  className={`p-1 rounded cursor-pointer transition-colors ${
                    isLight ? 'text-stone-700 hover:text-stone-950 hover:bg-stone-300' : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPreviewZoom(100)}
                  title="Reset 100%"
                  className={`p-1 rounded cursor-pointer ml-0.5 transition-colors ${
                    isLight ? 'text-stone-600 hover:text-stone-950 hover:bg-stone-300' : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
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
                        className="bg-white rounded-lg p-2.5 mb-4 border border-slate-300 text-[11px] font-mono grid grid-cols-4 gap-2 text-slate-900"
                      >
                        <div>
                          <span className="block text-[9px] font-sans uppercase font-bold text-slate-600">
                            Total Records
                          </span>
                          <span className="font-bold text-xs">{count}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-sans uppercase font-bold text-slate-600">
                            Cumulative Sum
                          </span>
                          <span className="font-bold text-xs text-slate-950">
                            {formatAccountingNumber(sum, settings.decimalPlaces, settings.numberFormat)}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-sans uppercase font-bold text-slate-600">
                            Average Value
                          </span>
                          <span className="font-bold text-xs">
                            {formatAccountingNumber(avg, settings.decimalPlaces, settings.numberFormat)}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-sans uppercase font-bold text-slate-600">
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
                      <table className="w-full border-collapse text-left bg-white">
                        <thead>
                          <tr className="border-b-2 border-slate-800 text-slate-900 text-[11px] font-bold bg-white">
                            {options.showLineNumbers && (
                              <th className="py-1.5 px-2 w-8 text-center bg-white">#</th>
                            )}
                            {options.showTimestamps && (
                              <th className="py-1.5 px-2 w-20 text-center font-mono bg-white">Time</th>
                            )}
                            <th className="py-1.5 px-2 bg-white">Mathematical Expression</th>
                            {options.showOperationTypes && (
                              <th className="py-1.5 px-2 w-24 text-center bg-white">Type</th>
                            )}
                            <th className="py-1.5 px-2 text-right bg-white">Result</th>
                          </tr>
                        </thead>
                        <tbody className="font-mono text-slate-800 divide-y divide-slate-200 bg-white">
                          {records.map((record, index) => {
                            const isCompact = options.density === 'compact';
                            const isSpacious = options.density === 'spacious';
                            const paddingY = isCompact ? 'py-1' : isSpacious ? 'py-2.5' : 'py-1.5';
                            const fontSize = isCompact ? 'text-[10px]' : isSpacious ? 'text-xs' : 'text-[11px]';

                            return (
                              <tr
                                key={record.id || index}
                                className={`page-break-inside-avoid bg-white ${fontSize}`}
                              >
                                {options.showLineNumbers && (
                                  <td className={`${paddingY} px-2 text-center text-slate-500 font-mono text-[10px] bg-white`}>
                                    {String(index + 1).padStart(2, '0')}
                                  </td>
                                )}
                                {options.showTimestamps && (
                                  <td className={`${paddingY} px-2 text-center text-slate-500 text-[10px] bg-white`}>
                                    {record.displayTime || ''}
                                  </td>
                                )}
                                <td className={`${paddingY} px-2 text-slate-900 font-sans font-medium bg-white`}>
                                  <div>{record.expression}</div>
                                  {options.showNotes && record.note && (
                                    <div className="text-[10px] text-cyan-700 italic font-sans mt-0.5">
                                      📝 {record.note}
                                    </div>
                                  )}
                                </td>
                                {options.showOperationTypes && (
                                  <td className={`${paddingY} px-2 text-center bg-white`}>
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-sans font-bold uppercase border border-slate-300 bg-white text-slate-700">
                                      {record.operationType
                                        ? record.operationType.toUpperCase().replace('_', ' ')
                                        : 'MATH'}
                                    </span>
                                  </td>
                                )}
                                <td className={`${paddingY} px-2 text-right font-bold text-slate-950 bg-white`}>
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
