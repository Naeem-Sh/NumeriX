import React from 'react';
import { CalculatorSettings } from '../types';
import { X, Keyboard, Calculator, HelpCircle, FileSpreadsheet } from 'lucide-react';
import { NumerixLogo } from './NumerixLogo';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CalculatorSettings;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, settings }) => {
  if (!isOpen) return null;

  const isLight = settings.theme === 'light';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        id="help-modal-dialog"
        className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <NumerixLogo size="sm" variant="horizontal" isLight={isLight} />
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
          {/* 1. Keyboard & Numpad Map */}
          <div>
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-cyan-400 mb-3">
              <Keyboard className="w-4 h-4" /> Keyboard & Numeric Keypad Operation
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { key: 'Num Lock', desc: 'Toggle hardware numeric keypad numbers (LED indicator on display & header)' },
                { key: '0 – 9, . , 00', desc: 'Type numbers directly or via NumPad' },
                { key: '+ , − , * , /', desc: 'Standard arithmetic operators' },
                { key: 'Enter or =', desc: 'Execute calculation & record to tape' },
                { key: 'Alt + K', desc: 'Toggle Visual Keymap shortcut badges on keypad' },
                { key: 'Ctrl + Z / Ctrl + Y', desc: 'Undo / Redo calculation history' },
                { key: 'Ctrl + V', desc: 'Quick-paste column of numbers from Excel to auto-tally' },
                { key: 'Ctrl + E', desc: 'Export full calculation audit tape to Microsoft Excel (.XLSX)' },
                { key: 'Ctrl + P', desc: 'Open Print Preview & Printer Options' },
                { key: 'Escape', desc: 'AC (All Clear) – Reset calculation' },
                { key: 'Delete', desc: 'CE (Clear Entry) – Clear current input' },
                { key: 'Backspace', desc: 'Erase last typed digit' },
                { key: '% (Percent)', desc: 'Calculate percentage (e.g. 100 + 15%)' },
                { key: '( and )', desc: 'Nested parenthetical expressions' },
                { key: '[ / ]', desc: 'Decrease / Increase decimal places' },
                { key: 'T / Shift+T', desc: 'Add Tax (+15%) / Deduct Tax (-15%)' },
                { key: 'U / Shift+U', desc: 'Markup (MU%) / Profit Margin (MAR%)' },
                { key: 'D', desc: 'Discount (DISC)' },
                { key: 'M / Shift+M', desc: 'M+ (Memory Add) / M− (Memory Subtract)' },
                { key: 'R / C / Shift+S', desc: 'MR (Recall) / MC (Clear) / MS (Store)' },
                { key: 'G / S', desc: 'Grand Total (GT) / Subtotal (ST)' },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-2 rounded-lg border ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800/80'
                  }`}
                >
                  <kbd className="px-2 py-0.5 rounded font-mono font-bold bg-slate-800 text-cyan-300 border border-slate-700 text-[11px]">
                    {item.key}
                  </kbd>
                  <span className="text-slate-400 text-right">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Accounting Functions Explained */}
          <div>
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-400 mb-3">
              <Calculator className="w-4 h-4" /> Financial & Accounting Functions
            </div>
            <div className="space-y-2 text-xs">
              <div
                className={`p-3 rounded-xl border ${
                  isLight ? 'bg-amber-50/50 border-amber-200' : 'bg-amber-950/20 border-amber-900/50'
                }`}
              >
                <div className="font-bold text-amber-300 mb-1">TAX+ & TAX− (Configurable {settings.taxRate}%)</div>
                <p className="text-slate-300">
                  • <strong>TAX+</strong>: Adds tax to net amount: <code className="font-mono text-cyan-300">Amount × (1 + Rate%)</code>.
                  <br />
                  • <strong>TAX−</strong>: Extracts pre-tax net amount from gross: <code className="font-mono text-cyan-300">Gross / (1 + Rate%)</code>.
                </p>
              </div>

              <div
                className={`p-3 rounded-xl border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/30 border-slate-800'
                }`}
              >
                <div className="font-bold text-cyan-300 mb-1">MU% (Markup) & MAR% (Margin)</div>
                <p className="text-slate-300">
                  • <strong>MU%</strong>: Cost + Markup percentage: <code className="font-mono text-cyan-300">Cost × (1 + Rate%)</code>.
                  <br />
                  • <strong>MAR%</strong>: Target gross margin selling price: <code className="font-mono text-cyan-300">Cost / (1 − Rate%)</code>.
                </p>
              </div>

              <div
                className={`p-3 rounded-xl border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/30 border-slate-800'
                }`}
              >
                <div className="font-bold text-indigo-300 mb-1">Memory Registers (MC, MR, M+, M−, MS)</div>
                <p className="text-slate-300">
                  Accumulate intermediate results in high-precision memory. The display shows <code className="font-mono text-amber-400">[M = ...]</code> when a value is stored in memory.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Excel & Spreadsheet Integration */}
          <div>
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-emerald-400 mb-2">
              <FileSpreadsheet className="w-4 h-4" /> Excel & Spreadsheet Workflow
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              • Click <strong>"Copy for Excel"</strong> to copy the full audit tape directly as tab-separated values. Paste directly into Excel (Ctrl+V) with instant columnar alignment.
              <br />
              • Click <strong>"Raw #"</strong> on any line or display to copy unformatted numeric values without commas for raw spreadsheet arithmetic.
              <br />
              • Click <strong>"Export .XLSX"</strong> to generate a formatted Excel workbook with audit metrics and summary totals.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-t ${
            isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/80'
          }`}
        >
          <span className="text-xs text-slate-400">
            IOOC-ShirazOffice • By: N.Shaaeri
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md transition-all cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
