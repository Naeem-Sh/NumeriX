import React from 'react';
import { CalculatorSettings } from '../types';
import { Delete, Percent, Equal } from 'lucide-react';

interface KeypadProps {
  onDigit: (digit: string) => void;
  onOperator: (op: string) => void;
  onCalculate: () => void;
  onClearAll: () => void;
  onClearEntry: () => void;
  onBackspace: () => void;
  onSignToggle: () => void;
  onPercent: () => void;
  onParenthesis: (p: '(' | ')') => void;
  // Accounting
  onTaxPlus: () => void;
  onTaxMinus: () => void;
  onMarkup: () => void;
  onMargin: () => void;
  onDiscount: () => void;
  // Memory
  onMemoryClear: () => void;
  onMemoryRecall: () => void;
  onMemoryAdd: () => void;
  onMemorySubtract: () => void;
  onMemoryStore: () => void;
  // Totals
  onSubtotal: () => void;
  onGrandTotal: () => void;
  settings: CalculatorSettings;
  activeKeyId: string | null;
  isNumLockOn?: boolean;
  onToggleNumLock?: () => void;
}

export const Keypad: React.FC<KeypadProps> = ({
  onDigit,
  onOperator,
  onCalculate,
  onClearAll,
  onClearEntry,
  onBackspace,
  onSignToggle,
  onPercent,
  onParenthesis,
  onTaxPlus,
  onTaxMinus,
  onMarkup,
  onMargin,
  onDiscount,
  onMemoryClear,
  onMemoryRecall,
  onMemoryAdd,
  onMemorySubtract,
  onMemoryStore,
  onSubtotal,
  onGrandTotal,
  settings,
  activeKeyId,
  isNumLockOn = true,
  onToggleNumLock,
}) => {
  const isLight = settings.theme === 'light';

  // Key style helpers with ultra-high contrast and tactile 3D sculpted keycaps
  const btnBase = `relative flex items-center justify-center font-bold select-none active:scale-[0.97] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 cursor-pointer fluid-keypad-btn transition-all ${
    isLight ? 'keycap-light-sculpted' : 'keycap-sculpted'
  }`;

  // Number keys (0, 1, 2, ..., 9): High contrast with exclusive tactile hover effects
  const numBtn = `${btnBase} fluid-keypad-num ${
    isLight
      ? 'bg-white hover:bg-sky-50 hover:border-sky-500 hover:text-sky-950 border-2 border-slate-300 text-slate-950 font-mono font-black text-lg sm:text-xl lg:text-2xl 2xl:text-3xl'
      : 'bg-slate-800/95 hover:bg-slate-750 hover:border-cyan-400/80 hover:text-cyan-100 border border-slate-700/90 text-white font-mono font-bold text-lg sm:text-xl lg:text-2xl 2xl:text-3xl'
  }`;

  // Decimal Point key (no hover effect)
  const dotBtn = `${btnBase} ${
    isLight
      ? 'bg-white border-2 border-slate-300 text-slate-950 font-mono font-black text-xl sm:text-2xl'
      : 'bg-slate-800/95 border border-slate-700/90 text-white font-mono font-bold text-xl sm:text-2xl'
  }`;

  // Operator keys: High contrast teal/cyan without hover effect
  const opBtn = `${btnBase} fluid-keypad-op ${
    isLight
      ? 'bg-cyan-100/90 border-2 border-cyan-300 text-cyan-950 font-mono font-black text-lg sm:text-xl lg:text-2xl'
      : 'bg-cyan-950/70 border border-cyan-700/80 text-cyan-300 font-mono font-bold text-lg sm:text-xl lg:text-2xl'
  }`;

  // Function keys: Crisp contrast borders without hover effect
  const fnBtn = `${btnBase} fluid-keypad-fn uppercase tracking-wider ${
    isLight
      ? 'bg-slate-100 border-2 border-slate-300 text-slate-900 font-extrabold'
      : 'bg-slate-900 border border-slate-750 text-slate-200 font-bold'
  }`;

  // Tax keys without hover effect
  const taxBtn = `${btnBase} fluid-keypad-fn uppercase tracking-wider ${
    isLight
      ? 'bg-amber-100 border-2 border-amber-400 text-amber-950 font-extrabold'
      : 'bg-amber-950/50 border border-amber-700/80 text-amber-300 font-bold'
  }`;

  // Memory keys without hover effect
  const memBtn = `${btnBase} fluid-keypad-fn uppercase tracking-wider ${
    isLight
      ? 'bg-indigo-100 border-2 border-indigo-400 text-indigo-950 font-extrabold'
      : 'bg-indigo-950/50 border border-indigo-700/80 text-indigo-300 font-bold'
  }`;

  // Clear keys without hover effect
  const clearBtn = `${btnBase} fluid-keypad-fn uppercase tracking-wider ${
    isLight
      ? 'bg-rose-100 border-2 border-rose-400 text-rose-950 font-extrabold'
      : 'bg-rose-950/50 border border-rose-700/80 text-rose-300 font-bold'
  }`;

  // Enter / Calculate primary button without hover effect
  const enterBtn = `${btnBase} fluid-keypad-enter ${
    isLight
      ? 'bg-emerald-600 text-white font-extrabold border-2 border-emerald-700'
      : 'bg-emerald-600 text-white font-bold border border-emerald-500'
  }`;

  return (
    <div id="calculator-keypad" className="flex flex-col justify-between h-full min-h-0 gap-1.5 sm:gap-2 p-0.5 sm:p-1">
      {/* 1. Accounting Tax & Financial Function Bar */}
      <div className="grid grid-cols-5 gap-1 sm:gap-1.5 lg:gap-2">
        <button
          id="btn-tax-plus"
          onClick={onTaxPlus}
          title={`Add Tax (+${settings.taxRate}%)`}
          className={`${taxBtn} ${activeKeyId === 'tax+' ? 'ring-2 ring-amber-400 brightness-125' : ''}`}
        >
          <span>TAX+</span>
        </button>
        <button
          id="btn-tax-minus"
          onClick={onTaxMinus}
          title={`Deduct Tax (-${settings.taxRate}%)`}
          className={`${taxBtn} ${activeKeyId === 'tax-' ? 'ring-2 ring-amber-400 brightness-125' : ''}`}
        >
          <span>TAX−</span>
        </button>
        <button
          id="btn-markup"
          onClick={onMarkup}
          title={`Calculate Markup at ${settings.taxRate}%`}
          className={`${fnBtn} ${activeKeyId === 'mu' ? 'ring-2 ring-cyan-400 brightness-125' : ''}`}
        >
          <span>MU%</span>
        </button>
        <button
          id="btn-margin"
          onClick={onMargin}
          title={`Calculate Margin at ${settings.taxRate}%`}
          className={`${fnBtn} ${activeKeyId === 'mgn' ? 'ring-2 ring-cyan-400 brightness-125' : ''}`}
        >
          <span>MAR%</span>
        </button>
        <button
          id="btn-discount"
          onClick={onDiscount}
          title={`Apply Discount (${settings.taxRate}%)`}
          className={`${fnBtn} ${activeKeyId === 'disc' ? 'ring-2 ring-cyan-400 brightness-125' : ''}`}
        >
          <span>DISC</span>
        </button>
      </div>

      {/* 2. Memory Registers Bar */}
      <div className="grid grid-cols-5 gap-1 sm:gap-1.5 lg:gap-2">
        <button
          id="btn-mc"
          onClick={onMemoryClear}
          title="Memory Clear"
          className={`${memBtn} ${activeKeyId === 'mc' ? 'ring-2 ring-indigo-400 brightness-125' : ''}`}
        >
          <span>MC</span>
        </button>
        <button
          id="btn-mr"
          onClick={onMemoryRecall}
          title="Memory Recall"
          className={`${memBtn} ${activeKeyId === 'mr' ? 'ring-2 ring-indigo-400 brightness-125' : ''}`}
        >
          <span>MR</span>
        </button>
        <button
          id="btn-m-plus"
          onClick={onMemoryAdd}
          title="Memory Add (M+)"
          className={`${memBtn} ${activeKeyId === 'm+' ? 'ring-2 ring-indigo-400 brightness-125' : ''}`}
        >
          <span>M+</span>
        </button>
        <button
          id="btn-m-minus"
          onClick={onMemorySubtract}
          title="Memory Subtract (M-)"
          className={`${memBtn} ${activeKeyId === 'm-' ? 'ring-2 ring-indigo-400 brightness-125' : ''}`}
        >
          <span>M−</span>
        </button>
        <button
          id="btn-ms"
          onClick={onMemoryStore}
          title="Memory Store (MS)"
          className={`${memBtn} ${activeKeyId === 'ms' ? 'ring-2 ring-indigo-400 brightness-125' : ''}`}
        >
          <span>MS</span>
        </button>
      </div>

      {/* 3. Primary Keypad Grid */}
      <div className="grid grid-cols-5 gap-1 sm:gap-1.5 lg:gap-2">
        {/* Row 1: AC, CE, ⌫, (, ) */}
        <button
          id="btn-ac"
          onClick={onClearAll}
          title="All Clear"
          className={`${clearBtn} ${activeKeyId === 'ac' ? 'ring-2 ring-rose-400 brightness-125' : ''}`}
        >
          <span>AC</span>
        </button>
        <button
          id="btn-ce"
          onClick={onClearEntry}
          title="Clear Current Entry"
          className={`${clearBtn} ${activeKeyId === 'ce' ? 'ring-2 ring-rose-400 brightness-125' : ''}`}
        >
          <span>CE</span>
        </button>
        <button
          id="btn-backspace"
          onClick={onBackspace}
          title="Backspace"
          className={`${fnBtn} ${activeKeyId === 'backspace' ? 'ring-2 ring-cyan-400 brightness-125' : ''}`}
        >
          <Delete className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button
          id="btn-lparen"
          onClick={() => onParenthesis('(')}
          title="Open Parenthesis ("
          className={`${fnBtn} font-mono text-base sm:text-lg`}
        >
          <span>(</span>
        </button>
        <button
          id="btn-rparen"
          onClick={() => onParenthesis(')')}
          title="Close Parenthesis )"
          className={`${fnBtn} font-mono text-base sm:text-lg`}
        >
          <span>)</span>
        </button>

        {/* Row 2: 7, 8, 9, ÷, % */}
        <button
          id="btn-7"
          onClick={() => onDigit('7')}
          className={`${numBtn} ${activeKeyId === '7' ? 'ring-2 ring-cyan-400 brightness-125' : ''}`}
        >
          <span>7</span>
        </button>
        <button
          id="btn-8"
          onClick={() => onDigit('8')}
          className={`${numBtn} ${activeKeyId === '8' ? 'ring-2 ring-cyan-400 brightness-125' : ''}`}
        >
          <span>8</span>
        </button>
        <button
          id="btn-9"
          onClick={() => onDigit('9')}
          className={`${numBtn} ${activeKeyId === '9' ? 'ring-2 ring-cyan-400 brightness-125' : ''}`}
        >
          <span>9</span>
        </button>
        <button
          id="btn-divide"
          onClick={() => onOperator('/')}
          title="Divide (÷)"
          className={`${opBtn} ${activeKeyId === '/' ? 'ring-2 ring-cyan-400 brightness-125' : ''}`}
        >
          <span>÷</span>
        </button>
        <button
          id="btn-percent"
          onClick={onPercent}
          title="Percentage (%)"
          className={`${opBtn} ${activeKeyId === '%' ? 'ring-2 ring-cyan-400 brightness-125' : ''}`}
        >
          <Percent className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Row 3: 4, 5, 6, ×, +/- */}
        <button
          id="btn-4"
          onClick={() => onDigit('4')}
          className={`${numBtn} ${activeKeyId === '4' ? 'ring-2 ring-cyan-400 brightness-125' : ''}`}
        >
          <span>4</span>
        </button>
        <button
          id="btn-5"
          onClick={() => onDigit('5')}
          className={`${numBtn} ${activeKeyId === '5' ? 'ring-2 ring-cyan-400 brightness-125' : ''}`}
        >
          <span>5</span>
        </button>
        <button
          id="btn-6"
          onClick={() => onDigit('6')}
          className={`${numBtn} ${activeKeyId === '6' ? 'ring-2 ring-cyan-400 brightness-125' : ''}`}
        >
          <span>6</span>
        </button>
        <button
          id="btn-multiply"
          onClick={() => onOperator('*')}
          title="Multiply (×)"
          className={`${opBtn} ${activeKeyId === '*' ? 'ring-2 ring-cyan-400 brightness-125' : ''}`}
        >
          <span>×</span>
        </button>
        <button
          id="btn-sign"
          onClick={onSignToggle}
          title="Toggle Positive/Negative Sign (±)"
          className={`${fnBtn} font-mono text-base sm:text-lg`}
        >
          <span>±</span>
        </button>

        {/* Row 4: 1, 2, 3, −, Subtotal */}
        <button
          id="btn-1"
          onClick={() => onDigit('1')}
          className={`${numBtn} ${activeKeyId === '1' ? 'ring-2 ring-cyan-400 brightness-125' : ''}`}
        >
          <span>1</span>
        </button>
        <button
          id="btn-2"
          onClick={() => onDigit('2')}
          className={`${numBtn} ${activeKeyId === '2' ? 'ring-2 ring-cyan-400 brightness-125' : ''}`}
        >
          <span>2</span>
        </button>
        <button
          id="btn-3"
          onClick={() => onDigit('3')}
          className={`${numBtn} ${activeKeyId === '3' ? 'ring-2 ring-cyan-400 brightness-125' : ''}`}
        >
          <span>3</span>
        </button>
        <button
          id="btn-minus"
          onClick={() => onOperator('-')}
          title="Subtract (−)"
          className={`${opBtn} ${activeKeyId === '-' ? 'ring-2 ring-cyan-400 brightness-125' : ''}`}
        >
          <span>−</span>
        </button>
        <button
          id="btn-st"
          onClick={onSubtotal}
          title="Subtotal (ST)"
          className={`${fnBtn} ${activeKeyId === 'st' ? 'ring-2 ring-indigo-400 brightness-125' : ''}`}
        >
          <span>ST</span>
        </button>

        {/* Row 5: 0, 00, ., +, GT */}
        <button
          id="btn-0"
          onClick={() => onDigit('0')}
          className={`${numBtn} ${activeKeyId === '0' ? 'ring-2 ring-cyan-400 brightness-125' : ''}`}
        >
          <span>0</span>
        </button>
        <button
          id="btn-00"
          onClick={() => onDigit('00')}
          title="Double Zero (00)"
          className={`${numBtn} ${activeKeyId === '00' ? 'ring-2 ring-cyan-400 brightness-125' : ''}`}
        >
          <span>00</span>
        </button>
        <button
          id="btn-dot"
          onClick={() => onDigit('.')}
          title="Decimal point (.)"
          className={`${dotBtn} ${activeKeyId === '.' ? 'ring-2 ring-cyan-400 brightness-125' : ''}`}
        >
          <span>.</span>
        </button>
        <button
          id="btn-plus"
          onClick={() => onOperator('+')}
          title="Add (+)"
          className={`${opBtn} ${activeKeyId === '+' ? 'ring-2 ring-cyan-400 brightness-125' : ''}`}
        >
          <span>+</span>
        </button>
        <button
          id="btn-gt"
          onClick={onGrandTotal}
          title="Grand Total (GT)"
          className={`${fnBtn} ${activeKeyId === 'gt' ? 'ring-2 ring-indigo-400 brightness-125' : ''}`}
        >
          <span>GT</span>
        </button>
      </div>

      {/* 4. Large Primary Enter / Calculate Bar */}
      <div className="grid grid-cols-1 mt-0.5 sm:mt-1">
        <button
          id="btn-enter"
          onClick={onCalculate}
          title="Calculate Result (Enter or =)"
          className={`${enterBtn} py-2.5 sm:py-3 lg:py-3.5 ${activeKeyId === 'enter' ? 'ring-4 ring-emerald-300 brightness-125' : ''}`}
        >
          <div className="flex items-center justify-center gap-2">
            <Equal className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
            <span className="tracking-wider text-sm sm:text-base lg:text-lg font-black">ENTER / CALCULATE</span>
          </div>
        </button>
      </div>
    </div>
  );
};
