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

  // Number keys (0, 1, 2, ..., 9): High contrast with primary accent glowing border
  const numBtn = `${btnBase} fluid-keypad-num ${
    isLight
      ? 'bg-white hover:bg-stone-50 hover:text-stone-950 border-2 border-stone-300 text-stone-950 font-mono font-black text-lg sm:text-xl lg:text-2xl 2xl:text-3xl shadow-2xs'
      : 'bg-slate-800/95 hover:bg-slate-750 hover:text-cyan-100 border border-slate-700/90 text-white font-mono font-bold text-lg sm:text-xl lg:text-2xl 2xl:text-3xl'
  }`;

  // Decimal Point key
  const dotBtn = `${btnBase} ${
    isLight
      ? 'bg-white hover:bg-stone-50 border-2 border-stone-300 text-stone-950 font-mono font-black text-xl sm:text-2xl shadow-2xs'
      : 'bg-slate-800/95 hover:bg-slate-750 border border-slate-700/90 text-white font-mono font-bold text-xl sm:text-2xl'
  }`;

  // Operator keys: High contrast teal/cyan
  const opBtn = `${btnBase} fluid-keypad-op ${
    isLight
      ? 'bg-cyan-100 hover:bg-cyan-50 border-2 border-cyan-300 text-cyan-950 font-mono font-black text-lg sm:text-xl lg:text-2xl shadow-2xs'
      : 'bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-700/80 text-cyan-300 font-mono font-bold text-lg sm:text-xl lg:text-2xl'
  }`;

  // Dedicated Tall Accumulator Plus Key (+) spanning 2 vertical rows
  const plusAccumulatorBtn = `${btnBase} ${
    isLight
      ? 'bg-cyan-600 hover:bg-cyan-700 border-2 border-cyan-700 text-white font-mono font-black text-2xl sm:text-3xl shadow-md ring-1 ring-cyan-500/40'
      : 'bg-cyan-500 hover:bg-cyan-400 border border-cyan-300 text-slate-950 font-mono font-black text-2xl sm:text-3xl shadow-md ring-1 ring-cyan-400/50'
  }`;

  // Function keys: Crisp contrast borders with subtle hover feedback
  const fnBtn = `${btnBase} fluid-keypad-fn uppercase tracking-wider ${
    isLight
      ? 'bg-stone-100 hover:bg-stone-50 border-2 border-stone-300 text-stone-800 font-bold shadow-2xs'
      : 'bg-slate-900 hover:bg-slate-850 border border-slate-750 text-slate-200 font-bold'
  }`;

  // Tax keys
  const taxBtn = `${btnBase} fluid-keypad-fn uppercase tracking-wider ${
    isLight
      ? 'bg-amber-100/80 hover:bg-amber-50 border-2 border-amber-300 text-amber-950 font-bold shadow-2xs'
      : 'bg-amber-950/50 hover:bg-amber-900/60 border border-amber-700/80 text-amber-300 font-bold'
  }`;

  // Memory keys
  const memBtn = `${btnBase} fluid-keypad-fn uppercase tracking-wider ${
    isLight
      ? 'bg-indigo-100/80 hover:bg-indigo-50 border-2 border-indigo-300 text-indigo-950 font-bold shadow-2xs'
      : 'bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-700/80 text-indigo-300 font-bold'
  }`;

  // Clear keys with tactile bevel inset
  const clearBtn = `${btnBase} fluid-keypad-fn uppercase tracking-wider ${
    isLight
      ? 'bg-rose-100 hover:bg-rose-50 border-2 border-rose-300 text-rose-950 font-black key-bevel-clear-light shadow-2xs'
      : 'bg-rose-950/60 hover:bg-rose-900/70 border border-rose-700/80 text-rose-200 font-bold key-bevel-clear-dark'
  }`;

  // Enter / Calculate primary button with tactile bevel inset
  const enterBtn = `${btnBase} fluid-keypad-enter ${
    isLight
      ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold border-2 border-emerald-700 key-bevel-enter-light shadow-md'
      : 'bg-emerald-600 hover:bg-emerald-500 text-white font-bold border border-emerald-500 key-bevel-enter-dark shadow-md'
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

      {/* 3. Primary Keypad Grid (Ergonomic 10-Key Layout with Tall + Accumulator and Tactile Nub on 5) */}
      <div className="grid grid-cols-5 gap-1 sm:gap-1.5 lg:gap-2">
        {/* Row 1: AC, CE, ⌫, (, ) */}
        <button
          id="btn-ac"
          onClick={onClearAll}
          title="All Clear (Tactile Beveled)"
          className={`${clearBtn} ${activeKeyId === 'ac' ? 'ring-2 ring-rose-400 brightness-125' : ''}`}
        >
          <span>AC</span>
        </button>
        <button
          id="btn-ce"
          onClick={onClearEntry}
          title="Clear Current Entry (Tactile Beveled)"
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

        {/* Row 3: 4, 5 (with tactile nub!), 6, ×, ST */}
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
          aria-label="5, homing key with tactile locator"
          title="5 (Homing key with tactile locator nub)"
          className={`${numBtn} ${activeKeyId === '5' ? 'ring-2 ring-cyan-400 brightness-125' : ''}`}
        >
          <span>5</span>
          {/* Classic 10-Key Tactile Raised Homing Nub */}
          <span className={`tactile-nub-pip ${isLight ? 'tactile-nub-light' : 'tactile-nub-dark'}`} aria-hidden="true" />
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
          id="btn-st"
          onClick={onSubtotal}
          title="Subtotal (ST)"
          className={`${fnBtn} ${activeKeyId === 'st' ? 'ring-2 ring-indigo-400 brightness-125' : ''}`}
        >
          <span>ST</span>
        </button>

        {/* Row 4: 1, 2, 3, −, and + (tall accumulator spanning rows 4 & 5!) */}
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

        {/* Tall Accumulator Plus Key (+) spanning 2 vertical rows (Rows 4 and 5) */}
        <button
          id="btn-plus"
          onClick={() => onOperator('+')}
          title="Add (+) – Primary 10-Key Accumulator"
          className={`${plusAccumulatorBtn} row-span-2 col-start-5 flex items-center justify-center ${
            activeKeyId === '+' ? 'ring-4 ring-cyan-300 brightness-125' : ''
          }`}
        >
          <span className="text-2xl sm:text-3xl lg:text-4xl leading-none">+</span>
        </button>

        {/* Row 5: 0, 00, ., ± (Column 5 is occupied by tall +) */}
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
          id="btn-sign"
          onClick={onSignToggle}
          title="Toggle Positive/Negative Sign (±)"
          className={`${fnBtn} font-mono text-base sm:text-lg`}
        >
          <span>±</span>
        </button>
      </div>

      {/* 4. Large Primary Enter / Calculate Bar + Grand Total */}
      <div className="grid grid-cols-5 gap-1 sm:gap-1.5 lg:gap-2 mt-0.5 sm:mt-1">
        <button
          id="btn-gt"
          onClick={onGrandTotal}
          title="Grand Total (GT)"
          className={`${fnBtn} col-span-1 py-2 sm:py-2.5 ${activeKeyId === 'gt' ? 'ring-2 ring-indigo-400 brightness-125' : ''}`}
        >
          <span>GT</span>
        </button>

        <button
          id="btn-enter"
          onClick={onCalculate}
          title="Calculate Result (Enter or =)"
          className={`${enterBtn} col-span-4 py-2 sm:py-2.5 lg:py-3 ${activeKeyId === 'enter' ? 'ring-4 ring-emerald-300 brightness-125' : ''}`}
        >
          <div className="flex items-center justify-center gap-2">
            <Equal className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
            <span className="tracking-wider text-xs sm:text-sm lg:text-base font-black">ENTER / CALCULATE</span>
          </div>
        </button>
      </div>
    </div>
  );
};
