import { useState, useEffect, useCallback, useRef } from 'react';
import { CalculationRecord, CalculatorSettings, WorkspaceLayout } from './types';
import {
  DEFAULT_SETTINGS,
  loadStoredSettings,
  saveStoredSettings,
  loadStoredTape,
  saveStoredTape,
  saveStoredLogo,
} from './utils/storage';
import {
  evaluateExpression,
  calculateTaxPlus,
  calculateTaxMinus,
  calculateMarkup,
  calculateMargin,
  calculateDiscount,
} from './utils/calculatorEngine';
import { playKeySound } from './utils/audio';
import { formatAccountingNumber, parseClipboardFinancialData } from './utils/numberFormat';
import { exportTapeToExcel } from './utils/excelExport';
import { generatePdfReport } from './utils/pdfReport';

import { AnalogClock } from './components/AnalogClock';
import { TapeHistory } from './components/TapeHistory';
import { CalculatorDisplay } from './components/CalculatorDisplay';
import { Keypad } from './components/Keypad';
import { SettingsModal } from './components/SettingsModal';
import { HelpModal } from './components/HelpModal';
import { PrintPreviewModal } from './components/PrintPreviewModal';
import { NumerixLogo } from './components/NumerixLogo';

import {
  Settings as SettingsIcon,
  HelpCircle,
  Volume2,
  VolumeX,
  Calculator as CalcIcon,
  ClipboardCheck,
  PanelRight,
  PanelLeft,
  LayoutGrid,
  FileSpreadsheet,
  FileText,
  Sun,
  Moon,
} from 'lucide-react';

interface CalcStateSnapshot {
  expression: string;
  currentInput: string;
  result: number | null;
  errorMessage: string | null;
  memoryValue: number | null;
  grandTotal: number | null;
  tapeRecords: CalculationRecord[];
}

export default function App() {
  // 1. Settings State
  const [settings, setSettings] = useState<CalculatorSettings>(() => {
    const loaded = loadStoredSettings();
    // Ensure companyName is empty if user didn't explicitly set one
    if (loaded.companyName === 'IOOC - Shiraz Office') {
      loaded.companyName = '';
    }
    if (!loaded.workspaceLayout) {
      loaded.workspaceLayout = 'audit-right';
    }
    return loaded;
  });

  const currentLayout: WorkspaceLayout = settings.workspaceLayout || 'audit-right';

  // 2. Calculator & Tape State
  const [expression, setExpression] = useState<string>('');
  const [currentInput, setCurrentInput] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [memoryValue, setMemoryValue] = useState<number | null>(null);
  const [grandTotal, setGrandTotal] = useState<number | null>(null);
  const [tapeRecords, setTapeRecords] = useState<CalculationRecord[]>(() => loadStoredTape());
  const [activeKeyId, setActiveKeyId] = useState<string | null>(null);

  // Undo / Redo History Snapshots
  const [pastStates, setPastStates] = useState<CalcStateSnapshot[]>([]);
  const [futureStates, setFutureStates] = useState<CalcStateSnapshot[]>([]);

  // 3. Modals State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [pasteToast, setPasteToast] = useState<{ show: boolean; count: number; sum: number } | null>(null);

  // Num Lock Detection & Live Status
  const [isNumLockOn, setIsNumLockOn] = useState<boolean>(true);

  // Enter / Calculate heartbeat pulse trigger for audit tape indicator
  const [enterPulseTrigger, setEnterPulseTrigger] = useState<number>(0);

  // Reference for active key flash timeout
  const keyFlashTimeout = useRef<number | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  // Persist settings
  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  // Persist tape
  useEffect(() => {
    saveStoredTape(tapeRecords);
  }, [tapeRecords]);

  // Trigger brief visual feedback for button press (sound effect exclusively on Enter/Calculate when sound is on)
  const triggerKeyFeedback = useCallback(
    (keyId: string, soundType: 'num' | 'operator' | 'action' | 'enter' | 'clear' | 'error' = 'num') => {
      setActiveKeyId(keyId);
      if (keyFlashTimeout.current) window.clearTimeout(keyFlashTimeout.current);
      keyFlashTimeout.current = window.setTimeout(() => setActiveKeyId(null), 160);

      // In ON mode, sound effect is strictly for Enter key
      if (settings.soundEnabled && soundType === 'enter') {
        playKeySound('enter', settings.soundVolume || 0.6);
      }
    },
    [settings.soundEnabled, settings.soundVolume]
  );

  // Push state snapshot to undo history
  const pushStateSnapshot = useCallback(() => {
    setPastStates((prev) => [
      ...prev.slice(-30),
      {
        expression,
        currentInput,
        result,
        errorMessage,
        memoryValue,
        grandTotal,
        tapeRecords,
      },
    ]);
    setFutureStates([]);
  }, [expression, currentInput, result, errorMessage, memoryValue, grandTotal, tapeRecords]);

  // Undo previous calculation action
  const handleUndo = useCallback(() => {
    if (pastStates.length === 0) return;
    const previous = pastStates[pastStates.length - 1];
    const currentSnapshot: CalcStateSnapshot = {
      expression,
      currentInput,
      result,
      errorMessage,
      memoryValue,
      grandTotal,
      tapeRecords,
    };
    setFutureStates((prev) => [...prev, currentSnapshot]);
    setPastStates((prev) => prev.slice(0, prev.length - 1));

    setExpression(previous.expression);
    setCurrentInput(previous.currentInput);
    setResult(previous.result);
    setErrorMessage(previous.errorMessage);
    setMemoryValue(previous.memoryValue);
    setGrandTotal(previous.grandTotal);
    setTapeRecords(previous.tapeRecords);
    triggerKeyFeedback('undo', 'action');
  }, [pastStates, expression, currentInput, result, errorMessage, memoryValue, grandTotal, tapeRecords, triggerKeyFeedback]);

  // Redo undone calculation action
  const handleRedo = useCallback(() => {
    if (futureStates.length === 0) return;
    const next = futureStates[futureStates.length - 1];
    const currentSnapshot: CalcStateSnapshot = {
      expression,
      currentInput,
      result,
      errorMessage,
      memoryValue,
      grandTotal,
      tapeRecords,
    };
    setPastStates((prev) => [...prev, currentSnapshot]);
    setFutureStates((prev) => prev.slice(0, prev.length - 1));

    setExpression(next.expression);
    setCurrentInput(next.currentInput);
    setResult(next.result);
    setErrorMessage(next.errorMessage);
    setMemoryValue(next.memoryValue);
    setGrandTotal(next.grandTotal);
    setTapeRecords(next.tapeRecords);
    triggerKeyFeedback('redo', 'action');
  }, [futureStates, expression, currentInput, result, errorMessage, memoryValue, grandTotal, tapeRecords, triggerKeyFeedback]);

  // Decimal controls
  const handleDecIncrease = useCallback(() => {
    triggerKeyFeedback('dec_inc', 'action');
    setSettings((prev) => ({
      ...prev,
      decimalPlaces: Math.min(8, prev.decimalPlaces + 1),
    }));
  }, [triggerKeyFeedback]);

  const handleDecDecrease = useCallback(() => {
    triggerKeyFeedback('dec_dec', 'action');
    setSettings((prev) => ({
      ...prev,
      decimalPlaces: Math.max(0, prev.decimalPlaces - 1),
    }));
  }, [triggerKeyFeedback]);

  const handleDirectDecSet = useCallback(
    (dec: number) => {
      triggerKeyFeedback(`dec_${dec}`, 'action');
      setSettings((prev) => ({ ...prev, decimalPlaces: dec }));
    },
    [triggerKeyFeedback]
  );

  // Digit input (0-9, ., 00)
  const handleDigit = useCallback(
    (digit: string) => {
      triggerKeyFeedback(digit, 'num');
      setErrorMessage(null);

      setCurrentInput((prev) => {
        if (digit === '.') {
          if (prev.includes('.')) return prev;
          return prev === '' ? '0.' : prev + '.';
        }
        if (digit === '00') {
          if (prev === '' || prev === '0') return '0';
          return prev + '00';
        }
        if (prev === '0') {
          return digit;
        }
        return prev + digit;
      });
    },
    [triggerKeyFeedback]
  );

  // Operator input (+, -, *, /)
  const handleOperator = useCallback(
    (op: string) => {
      triggerKeyFeedback(op, 'operator');
      setErrorMessage(null);

      const opSymbol = op === '*' ? '×' : op === '/' ? '÷' : op === '-' ? '−' : '+';

      setExpression((prevExpr) => {
        if (currentInput !== '') {
          const next = prevExpr ? `${prevExpr} ${currentInput} ${opSymbol}` : `${currentInput} ${opSymbol}`;
          setCurrentInput('');
          return next;
        } else if (result !== null && !prevExpr) {
          // Continue from previous calculation result
          const next = `${result} ${opSymbol}`;
          setCurrentInput('');
          return next;
        } else if (prevExpr && /[+−×÷]$/.test(prevExpr.trim())) {
          // Replace trailing operator
          return prevExpr.trim().slice(0, -1) + opSymbol;
        }
        return prevExpr;
      });
    },
    [currentInput, result, triggerKeyFeedback]
  );

  // Parentheses
  const handleParenthesis = useCallback(
    (p: '(' | ')') => {
      triggerKeyFeedback(p, 'operator');
      setErrorMessage(null);

      if (p === '(') {
        setExpression((prev) => (prev ? `${prev} (` : '('));
      } else {
        setExpression((prev) => {
          if (currentInput !== '') {
            const next = `${prev} ${currentInput} )`;
            setCurrentInput('');
            return next;
          }
          return `${prev} )`;
        });
      }
    },
    [currentInput, triggerKeyFeedback]
  );

  // Primary Calculation (Enter / =)
  const handleCalculate = useCallback(() => {
    triggerKeyFeedback('enter', 'enter');
    setEnterPulseTrigger((prev) => prev + 1);

    let fullExpr = expression;
    if (currentInput !== '') {
      fullExpr = fullExpr ? `${fullExpr} ${currentInput}` : currentInput;
    }

    if (!fullExpr.trim()) return;

    // Convert display operators to standard math
    const sanitized = fullExpr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-');

    const evalResult = evaluateExpression(sanitized);

    if (evalResult.success) {
      pushStateSnapshot();
      const calculatedVal = evalResult.value;
      setResult(calculatedVal);
      setCurrentInput('');
      setExpression('');
      setErrorMessage(null);

      // Update Grand Total
      setGrandTotal((prev) => (prev === null ? calculatedVal : prev + calculatedVal));

      // Append record to tape
      const now = new Date();
      const newRecord: CalculationRecord = {
        id: `calc_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        timestamp: now.toISOString(),
        displayTime: now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }),
        displayDate: now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        expression: fullExpr,
        rawExpression: sanitized,
        result: calculatedVal,
        formattedResult: formatAccountingNumber(calculatedVal, settings.decimalPlaces, settings.numberFormat),
        decimalPlaces: settings.decimalPlaces,
        operationType: 'arithmetic',
      };

      setTapeRecords((prev) => [...prev, newRecord]);
    } else {
      triggerKeyFeedback('error', 'error');
      setErrorMessage(evalResult.error || 'Invalid calculation');
    }
  }, [expression, currentInput, settings, triggerKeyFeedback, pushStateSnapshot]);

  // Backspace
  const handleBackspace = useCallback(() => {
    triggerKeyFeedback('backspace', 'action');
    if (currentInput.length > 0) {
      setCurrentInput((prev) => (prev.length > 1 ? prev.slice(0, -1) : ''));
    } else if (expression.length > 0) {
      setExpression((prev) => prev.trim().slice(0, -1).trim());
    }
  }, [currentInput, expression, triggerKeyFeedback]);

  // Clear Entry (CE)
  const handleClearEntry = useCallback(() => {
    triggerKeyFeedback('ce', 'clear');
    setCurrentInput('');
    setErrorMessage(null);
  }, [triggerKeyFeedback]);

  // All Clear (AC)
  const handleClearAll = useCallback(() => {
    pushStateSnapshot();
    triggerKeyFeedback('ac', 'clear');
    setExpression('');
    setCurrentInput('');
    setResult(null);
    setErrorMessage(null);
  }, [triggerKeyFeedback, pushStateSnapshot]);

  // Sign toggle (+/-)
  const handleSignToggle = useCallback(() => {
    triggerKeyFeedback('sign', 'action');
    if (currentInput !== '') {
      setCurrentInput((prev) => (prev.startsWith('-') ? prev.slice(1) : '-' + prev));
    } else if (result !== null) {
      pushStateSnapshot();
      const inverted = -result;
      setResult(inverted);
    }
  }, [currentInput, result, triggerKeyFeedback, pushStateSnapshot]);

  // Percentage (%)
  const handlePercent = useCallback(() => {
    triggerKeyFeedback('%', 'operator');
    if (currentInput !== '') {
      // If within an expression: append %
      setExpression((prev) => (prev ? `${prev} ${currentInput}%` : `${currentInput}%`));
      setCurrentInput('');
    } else if (result !== null) {
      pushStateSnapshot();
      const percentVal = result / 100;
      setResult(percentVal);
    }
  }, [currentInput, result, triggerKeyFeedback, pushStateSnapshot]);

  // Accounting TAX+
  const handleTaxPlus = useCallback(() => {
    triggerKeyFeedback('tax+', 'action');
    const baseVal = currentInput !== '' ? parseFloat(currentInput) : result !== null ? result : 0;
    const { total, taxAmount } = calculateTaxPlus(baseVal, settings.taxRate);

    pushStateSnapshot();
    setResult(total);
    setCurrentInput('');
    setExpression('');

    const now = new Date();
    const newRecord: CalculationRecord = {
      id: `tax_${Date.now()}`,
      timestamp: now.toISOString(),
      displayTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      displayDate: now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      expression: `${formatAccountingNumber(baseVal, settings.decimalPlaces, settings.numberFormat)} + ${settings.taxRate}% TAX (Tax: ${formatAccountingNumber(taxAmount, settings.decimalPlaces, settings.numberFormat)})`,
      rawExpression: `${baseVal} + ${settings.taxRate}%`,
      result: total,
      formattedResult: formatAccountingNumber(total, settings.decimalPlaces, settings.numberFormat),
      decimalPlaces: settings.decimalPlaces,
      operationType: 'tax_plus',
      note: `Tax Amount: ${formatAccountingNumber(taxAmount, settings.decimalPlaces, settings.numberFormat)}`,
    };
    setTapeRecords((prev) => [...prev, newRecord]);
  }, [currentInput, result, settings, triggerKeyFeedback, pushStateSnapshot]);

  // Accounting TAX-
  const handleTaxMinus = useCallback(() => {
    triggerKeyFeedback('tax-', 'action');
    const grossVal = currentInput !== '' ? parseFloat(currentInput) : result !== null ? result : 0;
    const { net, taxAmount } = calculateTaxMinus(grossVal, settings.taxRate);

    pushStateSnapshot();
    setResult(net);
    setCurrentInput('');
    setExpression('');

    const now = new Date();
    const newRecord: CalculationRecord = {
      id: `tax_min_${Date.now()}`,
      timestamp: now.toISOString(),
      displayTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      displayDate: now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      expression: `${formatAccountingNumber(grossVal, settings.decimalPlaces, settings.numberFormat)} − ${settings.taxRate}% TAX (Pre-tax Net)`,
      rawExpression: `${grossVal} - ${settings.taxRate}% TAX`,
      result: net,
      formattedResult: formatAccountingNumber(net, settings.decimalPlaces, settings.numberFormat),
      decimalPlaces: settings.decimalPlaces,
      operationType: 'tax_minus',
      note: `Tax Deducted: ${formatAccountingNumber(taxAmount, settings.decimalPlaces, settings.numberFormat)}`,
    };
    setTapeRecords((prev) => [...prev, newRecord]);
  }, [currentInput, result, settings, triggerKeyFeedback, pushStateSnapshot]);

  // Markup MU%
  const handleMarkup = useCallback(() => {
    triggerKeyFeedback('mu', 'action');
    const cost = currentInput !== '' ? parseFloat(currentInput) : result !== null ? result : 0;
    const { sellingPrice, markupAmount } = calculateMarkup(cost, settings.taxRate);

    pushStateSnapshot();
    setResult(sellingPrice);
    setCurrentInput('');
    setExpression('');

    const now = new Date();
    const newRecord: CalculationRecord = {
      id: `mu_${Date.now()}`,
      timestamp: now.toISOString(),
      displayTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      displayDate: now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      expression: `Cost ${formatAccountingNumber(cost, settings.decimalPlaces, settings.numberFormat)} + ${settings.taxRate}% Markup`,
      rawExpression: `${cost} Markup ${settings.taxRate}%`,
      result: sellingPrice,
      formattedResult: formatAccountingNumber(sellingPrice, settings.decimalPlaces, settings.numberFormat),
      decimalPlaces: settings.decimalPlaces,
      operationType: 'markup',
      note: `Markup: ${formatAccountingNumber(markupAmount, settings.decimalPlaces, settings.numberFormat)}`,
    };
    setTapeRecords((prev) => [...prev, newRecord]);
  }, [currentInput, result, settings, triggerKeyFeedback, pushStateSnapshot]);

  // Margin MAR%
  const handleMargin = useCallback(() => {
    triggerKeyFeedback('mgn', 'action');
    const cost = currentInput !== '' ? parseFloat(currentInput) : result !== null ? result : 0;
    try {
      const { sellingPrice, profit } = calculateMargin(cost, settings.taxRate);
      pushStateSnapshot();
      setResult(sellingPrice);
      setCurrentInput('');
      setExpression('');

      const now = new Date();
      const newRecord: CalculationRecord = {
        id: `mgn_${Date.now()}`,
        timestamp: now.toISOString(),
        displayTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
        displayDate: now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        expression: `Cost ${formatAccountingNumber(cost, settings.decimalPlaces, settings.numberFormat)} @ ${settings.taxRate}% Gross Margin`,
        rawExpression: `${cost} Margin ${settings.taxRate}%`,
        result: sellingPrice,
        formattedResult: formatAccountingNumber(sellingPrice, settings.decimalPlaces, settings.numberFormat),
        decimalPlaces: settings.decimalPlaces,
        operationType: 'margin',
        note: `Target Profit: ${formatAccountingNumber(profit, settings.decimalPlaces, settings.numberFormat)}`,
      };
      setTapeRecords((prev) => [...prev, newRecord]);
    } catch {
      triggerKeyFeedback('error', 'error');
      setErrorMessage('Margin rate must be < 100%');
    }
  }, [currentInput, result, settings, triggerKeyFeedback, pushStateSnapshot]);

  // Discount
  const handleDiscount = useCallback(() => {
    triggerKeyFeedback('disc', 'action');
    const price = currentInput !== '' ? parseFloat(currentInput) : result !== null ? result : 0;
    const { discountedPrice, savings } = calculateDiscount(price, settings.taxRate);

    pushStateSnapshot();
    setResult(discountedPrice);
    setCurrentInput('');
    setExpression('');

    const now = new Date();
    const newRecord: CalculationRecord = {
      id: `disc_${Date.now()}`,
      timestamp: now.toISOString(),
      displayTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      displayDate: now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      expression: `${formatAccountingNumber(price, settings.decimalPlaces, settings.numberFormat)} − ${settings.taxRate}% Discount`,
      rawExpression: `${price} Discount ${settings.taxRate}%`,
      result: discountedPrice,
      formattedResult: formatAccountingNumber(discountedPrice, settings.decimalPlaces, settings.numberFormat),
      decimalPlaces: settings.decimalPlaces,
      operationType: 'discount',
      note: `Savings: ${formatAccountingNumber(savings, settings.decimalPlaces, settings.numberFormat)}`,
    };
    setTapeRecords((prev) => [...prev, newRecord]);
  }, [currentInput, result, settings, triggerKeyFeedback, pushStateSnapshot]);

  // Memory Registers
  const handleMemoryClear = useCallback(() => {
    triggerKeyFeedback('mc', 'clear');
    pushStateSnapshot();
    setMemoryValue(null);
  }, [triggerKeyFeedback, pushStateSnapshot]);

  const handleMemoryRecall = useCallback(() => {
    triggerKeyFeedback('mr', 'action');
    if (memoryValue !== null) {
      setCurrentInput(memoryValue.toString());
    }
  }, [memoryValue, triggerKeyFeedback]);

  const handleMemoryAdd = useCallback(() => {
    triggerKeyFeedback('m+', 'action');
    const val = currentInput !== '' ? parseFloat(currentInput) : result !== null ? result : 0;
    pushStateSnapshot();
    setMemoryValue((prev) => (prev === null ? val : prev + val));
  }, [currentInput, result, triggerKeyFeedback, pushStateSnapshot]);

  const handleMemorySubtract = useCallback(() => {
    triggerKeyFeedback('m-', 'action');
    const val = currentInput !== '' ? parseFloat(currentInput) : result !== null ? result : 0;
    pushStateSnapshot();
    setMemoryValue((prev) => (prev === null ? -val : prev - val));
  }, [currentInput, result, triggerKeyFeedback, pushStateSnapshot]);

  const handleMemoryStore = useCallback(() => {
    triggerKeyFeedback('ms', 'action');
    const val = currentInput !== '' ? parseFloat(currentInput) : result !== null ? result : 0;
    pushStateSnapshot();
    setMemoryValue(val);
  }, [currentInput, result, triggerKeyFeedback, pushStateSnapshot]);

  // Subtotal & Grand Total
  const handleSubtotal = useCallback(() => {
    triggerKeyFeedback('st', 'action');
    const subtotalVal = tapeRecords.reduce((acc, curr) => acc + curr.result, 0);
    setResult(subtotalVal);
    setCurrentInput('');
  }, [tapeRecords, triggerKeyFeedback]);

  const handleGrandTotal = useCallback(() => {
    triggerKeyFeedback('gt', 'action');
    if (grandTotal !== null) {
      setResult(grandTotal);
      setCurrentInput('');
    }
  }, [grandTotal, triggerKeyFeedback]);

  // Reuse value from tape into calculator
  const handleReuseValue = useCallback(
    (val: number) => {
      triggerKeyFeedback('reuse', 'action');
      setCurrentInput(val.toString());
    },
    [triggerKeyFeedback]
  );

  // Delete single tape record
  const handleDeleteRecord = useCallback((id: string) => {
    pushStateSnapshot();
    setTapeRecords((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      saveStoredTape(updated);
      return updated;
    });
  }, [pushStateSnapshot]);

  // Update note/annotation on a tape record
  const handleUpdateRecordNote = useCallback((id: string, note: string) => {
    pushStateSnapshot();
    setTapeRecords((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, note } : r));
      saveStoredTape(updated);
      return updated;
    });
  }, [pushStateSnapshot]);

  // Clear all tape records
  const handleClearTape = useCallback(() => {
    pushStateSnapshot();
    setTapeRecords([]);
    setGrandTotal(null);
    saveStoredTape([]);
    triggerKeyFeedback('clear_tape', 'clear');
  }, [triggerKeyFeedback, pushStateSnapshot]);

  // Export handlers
  const handleExportExcel = useCallback(() => {
    exportTapeToExcel(tapeRecords, settings);
  }, [tapeRecords, settings]);

  const handleExportPdf = useCallback(() => {
    generatePdfReport(tapeRecords, settings);
  }, [tapeRecords, settings]);

  const handleOpenPrintPreview = useCallback(() => {
    setIsPrintPreviewOpen(true);
  }, []);

  // Workspace Layout Switcher (2 Modes: audit-right vs audit-left)
  const handleSetLayout = useCallback((layout: WorkspaceLayout) => {
    setSettings((prev) => {
      const updated = { ...prev, workspaceLayout: layout };
      saveStoredSettings(updated);
      return updated;
    });
    playKeySound('action', settings.soundVolume);
  }, [settings.soundVolume]);

  // Reset defaults handler
  const handleResetDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    saveStoredSettings(DEFAULT_SETTINGS);
    triggerKeyFeedback('reset_defaults', 'action');
  }, [triggerKeyFeedback]);

  // Num Lock manual toggle
  const handleToggleNumLock = useCallback(() => {
    setIsNumLockOn((prev) => !prev);
    triggerKeyFeedback('numlock', 'action');
  }, [triggerKeyFeedback]);

  // Auto-Tally numbers from Excel / Clipboard with Intelligent Parsing
  const handleAutoTallyFromText = useCallback(
    (text: string) => {
      if (!text || text.trim().length === 0) return false;

      // Extract intelligently sanitized financial numbers (supporting currencies, commas, parentheses)
      const validNumbers = parseClipboardFinancialData(text);

      if (validNumbers.length === 0) return false;

      pushStateSnapshot();

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const dateStr = now.toLocaleDateString();

      let runningSum = result !== null && !isNaN(result) ? result : 0;
      const initialPrev = runningSum;
      const newRecords: CalculationRecord[] = [];

      validNumbers.forEach((val, idx) => {
        const prev = runningSum;
        runningSum += val;
        const expr =
          idx === 0 && initialPrev === 0
            ? `${val}`
            : `${formatAccountingNumber(prev, settings.decimalPlaces, settings.numberFormat)} + ${val}`;

        newRecords.push({
          id: `paste_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 5)}`,
          timestamp: new Date(Date.now() + idx * 10).toISOString(),
          displayTime: timeStr,
          displayDate: dateStr,
          expression: expr,
          rawExpression: `${prev} + ${val}`,
          result: runningSum,
          formattedResult: formatAccountingNumber(runningSum, settings.decimalPlaces, settings.numberFormat),
          decimalPlaces: settings.decimalPlaces,
          operationType: 'arithmetic',
          note: validNumbers.length > 1 ? `Excel Column (${idx + 1}/${validNumbers.length})` : 'Pasted Value',
        });
      });

      setTapeRecords((prev) => [...prev, ...newRecords]);
      setResult(runningSum);
      setCurrentInput('');
      setExpression('');
      triggerKeyFeedback('enter', 'enter');

      // Floating Toast
      setPasteToast({ show: true, count: validNumbers.length, sum: runningSum });
      if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = window.setTimeout(() => setPasteToast(null), 4000);

      return true;
    },
    [result, settings, triggerKeyFeedback, pushStateSnapshot]
  );

  // Global Keyboard & Interaction Listener with Real-Time Physical Keyboard Num Lock Detection
  useEffect(() => {
    const syncPhysicalNumLock = (e: KeyboardEvent | MouseEvent | PointerEvent | FocusEvent) => {
      if ('getModifierState' in e && typeof (e as KeyboardEvent).getModifierState === 'function') {
        const physicalState = (e as KeyboardEvent).getModifierState('NumLock');
        setIsNumLockOn(physicalState);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      syncPhysicalNumLock(e);

      // Dedicated NumLock key press
      if (e.key === 'NumLock') {
        const physicalState = typeof e.getModifierState === 'function' ? e.getModifierState('NumLock') : undefined;
        setIsNumLockOn((prev) => (physicalState !== undefined ? physicalState : !prev));
        triggerKeyFeedback('numlock', 'action');
        return;
      }

      // Check if numpad navigation key was pressed while NumLock is off
      if (e.code && e.code.startsWith('Numpad')) {
        if (['Insert', 'End', 'ArrowDown', 'PageDown', 'ArrowLeft', 'Clear', 'ArrowRight', 'Home', 'ArrowUp', 'PageUp', 'Delete'].includes(e.key)) {
          setIsNumLockOn(false);
        } else if (/^[0-9]$/.test(e.key) || e.key === '.') {
          setIsNumLockOn(true);
        }
      }

      // Don't capture when typing inside an open modal input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }

      const key = e.key;


      // Intercept Ctrl+P / Cmd+P to open rich print preview
      if ((e.ctrlKey || e.metaKey) && (key === 'p' || key === 'P')) {
        e.preventDefault();
        handleOpenPrintPreview();
        return;
      }

      // Intercept Ctrl+E / Cmd+E to Export to Excel
      if ((e.ctrlKey || e.metaKey) && (key === 'e' || key === 'E')) {
        e.preventDefault();
        handleExportExcel();
        return;
      }

      // Undo (Ctrl+Z / Cmd+Z) & Redo (Ctrl+Y / Cmd+Y or Ctrl+Shift+Z / Cmd+Shift+Z)
      if ((e.ctrlKey || e.metaKey) && (key === 'z' || key === 'Z')) {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (key === 'y' || key === 'Y')) {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Digits 0-9
      if (/^[0-9]$/.test(key)) {
        e.preventDefault();
        handleDigit(key);
        return;
      }

      // Decimal point
      if (key === '.' || key === ',') {
        e.preventDefault();
        handleDigit('.');
        return;
      }

      // Operators
      if (key === '+' || key === '-' || key === '*' || key === '/') {
        e.preventDefault();
        handleOperator(key);
        return;
      }

      // Enter or = for Calculate
      if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleCalculate();
        return;
      }

      // Escape -> All Clear (AC)
      if (key === 'Escape') {
        e.preventDefault();
        handleClearAll();
        return;
      }

      // Delete -> Clear Entry (CE)
      if (key === 'Delete') {
        e.preventDefault();
        handleClearEntry();
        return;
      }

      // Backspace
      if (key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
        return;
      }

      // Parentheses
      if (key === '(' || key === ')') {
        e.preventDefault();
        handleParenthesis(key);
        return;
      }

      // Percentage
      if (key === '%') {
        e.preventDefault();
        handlePercent();
        return;
      }

      // Accounting Hotkeys
      if (key === 't' || key === 'T') {
        e.preventDefault();
        if (e.shiftKey) {
          handleTaxMinus();
        } else {
          handleTaxPlus();
        }
        return;
      }

      if (key === 'u' || key === 'U') {
        e.preventDefault();
        if (e.shiftKey) {
          handleMargin();
        } else {
          handleMarkup();
        }
        return;
      }

      if (key === 'd' || key === 'D') {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          handleDiscount();
          return;
        }
      }

      if (key === 'm' || key === 'M') {
        e.preventDefault();
        if (e.shiftKey) {
          handleMemorySubtract();
        } else {
          handleMemoryAdd();
        }
        return;
      }

      if (key === 'r' || key === 'R') {
        e.preventDefault();
        handleMemoryRecall();
        return;
      }

      if (key === 'c' || key === 'C') {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          handleMemoryClear();
          return;
        }
      }

      if (key === 'g' || key === 'G') {
        e.preventDefault();
        handleGrandTotal();
        return;
      }

      if (key === 's' || key === 'S') {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          if (e.shiftKey) {
            handleMemoryStore();
          } else {
            handleSubtotal();
          }
          return;
        }
      }

      // Decimal places adjustment
      if (key === '[') {
        e.preventDefault();
        handleDecDecrease();
        return;
      }
      if (key === ']') {
        e.preventDefault();
        handleDecIncrease();
        return;
      }

      // Help Modal shortcut (?)
      if (key === '?' || key === 'F1') {
        e.preventDefault();
        setIsHelpOpen((prev) => !prev);
        return;
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }
      const text = e.clipboardData?.getData('text');
      if (text) {
        const handled = handleAutoTallyFromText(text);
        if (handled) {
          e.preventDefault();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      syncPhysicalNumLock(e);
      if (e.key === 'NumLock') {
        const physicalState = typeof e.getModifierState === 'function' ? e.getModifierState('NumLock') : undefined;
        if (physicalState !== undefined) {
          setIsNumLockOn(physicalState);
        }
      }
    };

    const handlePointerDown = (e: MouseEvent) => {
      syncPhysicalNumLock(e);
    };

    const handleMouseMove = (e: MouseEvent) => {
      syncPhysicalNumLock(e);
    };

    const handleWindowFocus = () => {
      // Re-verify on window focus if possible
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('paste', handlePaste);
    };
  }, [
    handleDigit,
    handleOperator,
    handleCalculate,
    handleClearAll,
    handleClearEntry,
    handleBackspace,
    handleParenthesis,
    handlePercent,
    handleTaxPlus,
    handleTaxMinus,
    handleMarkup,
    handleMargin,
    handleDiscount,
    handleMemoryAdd,
    handleMemorySubtract,
    handleMemoryRecall,
    handleMemoryClear,
    handleMemoryStore,
    handleGrandTotal,
    handleSubtotal,
    handleDecDecrease,
    handleDecIncrease,
    handleUndo,
    handleRedo,
    handleOpenPrintPreview,
    handleAutoTallyFromText,
    triggerKeyFeedback,
  ]);

  // 2-State Sound Switcher: On / Off Toggle (in On mode, sound effect plays only on Enter key)
  const handleToggleSound = useCallback(() => {
    setSettings((prev) => {
      const nextSoundState = !prev.soundEnabled;
      if (nextSoundState) {
        playKeySound('enter', prev.soundVolume || 0.6);
      }
      return { ...prev, soundEnabled: nextSoundState };
    });
  }, []);

  // Theme Toggle: Light / Dark Mode Toggle
  const handleToggleTheme = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light',
    }));
  }, []);

  // Theme Styling - Strictly 2 themes: dark and light
  const isLight = settings.theme === 'light';
  const themeContainerClass = isLight
    ? 'bg-[#e6e4df] text-stone-900'
    : 'bg-slate-950 text-slate-100';

  const uiScaleClass =
    settings.uiScale === 'compact'
      ? 'ui-scale-compact'
      : settings.uiScale === 'expanded'
      ? 'ui-scale-expanded'
      : 'ui-scale-standard';

  return (
    <div
      id="app-root-container"
      className={`min-h-screen lg:h-screen lg:max-h-screen flex flex-col justify-between font-sans transition-colors duration-200 lg:overflow-hidden ${themeContainerClass} ${uiScaleClass}`}
    >
      {/* 1. Header Bar (Decluttered & Clean) */}
      <header
        id="app-header-bar"
        className={`w-full border-b transition-all px-4 py-2 sm:px-6 lg:px-8 shrink-0 ${
          isLight ? 'bg-[#dedbd2] border-stone-300 shadow-xs' : 'bg-slate-900/90 border-slate-800 shadow-sm'
        }`}
      >
        <div className="w-full max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1680px] 3xl:max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
          {/* Left: Official NumeriX App Logo & Title (50% enlarged, Financial Pro badge omitted) */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              id="header-logo-btn"
              onClick={() => setIsHelpOpen(true)}
              title="NumeriX Web Calculator - Click for Quick Guide & Shortcuts"
              className="flex items-center gap-2.5 sm:gap-3 hover:opacity-90 transition-opacity cursor-pointer text-left py-0.5"
            >
              <NumerixLogo size="sm" variant="horizontal" isLight={isLight} />
            </button>
          </div>

          {/* Center: Sleek Top Slide Toggle for the 2 Layouts */}
          <div className="flex items-center">
            <div
              id="header-layout-slide-toggle"
              role="group"
              aria-label="Workspace Layout Switcher"
              className={`flex items-center p-0.5 sm:p-1 rounded-xl border transition-all select-none shadow-2xs ${
                isLight ? 'bg-[#d3cfc4] border-stone-300' : 'bg-slate-950/90 border-slate-800'
              }`}
            >
              {/* Option 1: Keypad Left • Audit Tape Right (DEFAULT) */}
              <button
                id="toggle-layout-audit-right"
                type="button"
                onClick={() => handleSetLayout('audit-right')}
                title="Layout: Keypad on Left, Audit Tape on Right (Widescreen Default)"
                className={`relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentLayout === 'audit-right'
                    ? isLight
                      ? 'bg-white text-cyan-950 shadow-xs border border-stone-300 font-extrabold ring-1 ring-cyan-600/30'
                      : 'bg-cyan-500 text-slate-950 shadow-md font-black ring-1 ring-cyan-400/50'
                    : isLight
                    ? 'text-stone-800 hover:text-stone-950 hover:bg-stone-200/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <PanelRight className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keypad Left</span>
                <span className="sm:hidden text-[11px]">Left</span>
              </button>

              {/* Option 2: Audit Tape Left • Keypad Right */}
              <button
                id="toggle-layout-audit-left"
                type="button"
                onClick={() => handleSetLayout('audit-left')}
                title="Layout: Audit Tape on Left, Keypad on Right (Classic Accounting Standard)"
                className={`relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentLayout === 'audit-left'
                    ? isLight
                      ? 'bg-white text-cyan-950 shadow-xs border border-stone-300 font-extrabold ring-1 ring-cyan-600/30'
                      : 'bg-cyan-500 text-slate-950 shadow-md font-black ring-1 ring-cyan-400/50'
                    : isLight
                    ? 'text-stone-800 hover:text-stone-950 hover:bg-stone-200/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <PanelLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keypad Right</span>
                <span className="sm:hidden text-[11px]">Right</span>
              </button>
            </div>
          </div>

          {/* Right Header: Clean Essential Tools */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* 2-Option Sound Toggle: Sound ON / OFF (Enter key only when ON) */}
            <button
              id="header-sound-toggle-btn"
              onClick={handleToggleSound}
              title={
                settings.soundEnabled
                  ? 'Sound: ON (Audible tactile clicks) - Click to Mute'
                  : 'Sound: OFF - Click to Turn Sound ON'
              }
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer text-xs font-bold ${
                settings.soundEnabled
                  ? isLight
                    ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-900 shadow-2xs'
                    : 'bg-emerald-950/50 hover:bg-emerald-900/70 border-emerald-700 text-emerald-300 shadow-xs'
                  : isLight
                  ? 'bg-slate-200/80 hover:bg-slate-200 border-slate-300 text-slate-500'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400'
              }`}
            >
              {settings.soundEnabled ? (
                <>
                  <Volume2 className={`w-4 h-4 ${isLight ? 'text-cyan-700' : 'text-emerald-400'}`} />
                  <span className="text-[11px]">Sound: ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-slate-400" />
                  <span className="text-[11px]">Sound: OFF</span>
                </>
              )}
            </button>

            {/* 2-Option Theme Toggle: Light / Dark Mode */}
            <button
              id="header-theme-btn"
              onClick={handleToggleTheme}
              title={`Switch Theme (Current: ${isLight ? 'Light Mode' : 'Dark Mode'}). Click to toggle.`}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer text-xs font-bold ${
                isLight
                  ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-900 shadow-2xs'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
            >
              {isLight ? (
                <Sun className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              )}
              <span className="text-[11px]">{isLight ? 'LIGHT' : 'DARK'}</span>
            </button>

            {/* Quick PDF Report & Print Preview Button */}
            <button
              id="header-pdf-btn"
              onClick={handleOpenPrintPreview}
              title="Export calculation tape to PDF / Print Report (Ctrl+P)"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer text-xs font-bold ${
                isLight
                  ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-900 shadow-2xs'
                  : 'bg-rose-950/60 hover:bg-rose-900/80 border-rose-800 text-rose-300 shadow-xs'
              }`}
            >
              <FileText className="w-4 h-4 text-rose-600" />
              <span className="text-[11px]">PDF</span>
            </button>

            {/* Settings Button */}
            <button
              id="header-settings-btn"
              onClick={() => setIsSettingsOpen(true)}
              title="Calculator Preferences, Presets & Logo"
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800 shadow-2xs'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
            </button>

            {/* Help Button */}
            <button
              id="header-help-btn"
              onClick={() => setIsHelpOpen(true)}
              title="Keyboard shortcuts & Accounting manual (F1 or ?)"
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isLight
                  ? 'bg-cyan-50 hover:bg-cyan-100 border-cyan-300 text-cyan-950 font-bold shadow-2xs'
                  : 'bg-cyan-950/60 hover:bg-cyan-900 border-cyan-800 text-cyan-300'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Analog Clock & Live Date */}
            {settings.showClock !== false && (
              <div className="flex items-center pl-1 sm:pl-2 shrink-0">
                <AnalogClock theme={settings.theme} dateFormat={settings.dateFormat} />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Floating Toast Notification for Excel Quick-Paste */}
      {pasteToast && pasteToast.show && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-emerald-500/50 bg-emerald-950/90 text-emerald-100 shadow-2xl backdrop-blur-sm animate-bounce text-xs font-semibold">
          <ClipboardCheck className="w-4 h-4 text-emerald-400" />
          <span>
            Pasted & auto-tallied <strong>{pasteToast.count}</strong> numbers from clipboard (Sum:{' '}
            <strong className="text-emerald-300">
              {formatAccountingNumber(pasteToast.sum, settings.decimalPlaces, settings.numberFormat)}
            </strong>
            )
          </span>
        </div>
      )}

      {/* 2. Main Workstation Area (2 Layout Modes: Audit Left vs Audit Right) */}
      <main id="app-main-workspace" className="flex-1 min-h-0 w-full max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1680px] 3xl:max-w-[1920px] mx-auto px-3 sm:px-5 lg:px-7 py-2 sm:py-2.5 flex flex-col justify-center">
        {currentLayout === 'audit-left' ? (
          /* Mode 2: Audit Left & Keypad Right (Accounting Standard) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-5 items-stretch h-full min-h-0">
            {/* Left Column: Paper Tape / Calculation Audit History (5 Cols) */}
            <section className="lg:col-span-5 h-[360px] sm:h-[420px] lg:h-full min-h-0 flex flex-col order-1">
              <TapeHistory
                records={tapeRecords}
                settings={settings}
                enterTrigger={enterPulseTrigger}
                onReuseValue={handleReuseValue}
                onDeleteRecord={handleDeleteRecord}
                onClearTape={handleClearTape}
                onExportExcel={handleExportExcel}
                onExportPdf={handleExportPdf}
                onPrint={handleOpenPrintPreview}
                onUpdateRecordNote={handleUpdateRecordNote}
              />
            </section>

            {/* Right Column: Calculator Display, Decimal Controls & Keypad (7 Cols) */}
            <section className="lg:col-span-7 flex flex-col justify-between gap-2 sm:gap-2.5 lg:gap-3 h-full min-h-0 order-2">
              <CalculatorDisplay
                expression={expression}
                currentInput={currentInput}
                result={result}
                errorMessage={errorMessage}
                memoryValue={memoryValue}
                grandTotal={grandTotal}
                settings={settings}
                canUndo={pastStates.length > 0}
                canRedo={futureStates.length > 0}
                onUndo={handleUndo}
                onRedo={handleRedo}
                onDecIncrease={handleDecIncrease}
                onDecDecrease={handleDecDecrease}
                onDirectDecSet={handleDirectDecSet}
                isNumLockOn={isNumLockOn}
                onToggleNumLock={handleToggleNumLock}
              />

              <div
                className={`p-2.5 sm:p-3 lg:p-3.5 rounded-2xl border-2 transition-colors flex-1 flex flex-col justify-center min-h-0 ${
                  isLight
                    ? 'bg-[#dedbd2] border-stone-300 shadow-xs'
                    : 'bg-slate-900/95 border-slate-800 shadow-md'
                }`}
              >
                <Keypad
                  onDigit={handleDigit}
                  onOperator={handleOperator}
                  onCalculate={handleCalculate}
                  onClearAll={handleClearAll}
                  onClearEntry={handleClearEntry}
                  onBackspace={handleBackspace}
                  onSignToggle={handleSignToggle}
                  onPercent={handlePercent}
                  onParenthesis={handleParenthesis}
                  onTaxPlus={handleTaxPlus}
                  onTaxMinus={handleTaxMinus}
                  onMarkup={handleMarkup}
                  onMargin={handleMargin}
                  onDiscount={handleDiscount}
                  onMemoryClear={handleMemoryClear}
                  onMemoryRecall={handleMemoryRecall}
                  onMemoryAdd={handleMemoryAdd}
                  onMemorySubtract={handleMemorySubtract}
                  onMemoryStore={handleMemoryStore}
                  onSubtotal={handleSubtotal}
                  onGrandTotal={handleGrandTotal}
                  settings={settings}
                  activeKeyId={activeKeyId}
                  isNumLockOn={isNumLockOn}
                  onToggleNumLock={handleToggleNumLock}
                />
              </div>
            </section>
          </div>
        ) : (
          /* Mode 1 (DEFAULT): Audit Right & Keypad Left (Widescreen Optimized) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-5 items-stretch h-full min-h-0">
            {/* Left Column: Calculator Display, Decimal Controls & Keypad (7 Cols) */}
            <section className="lg:col-span-7 flex flex-col justify-between gap-2 sm:gap-2.5 lg:gap-3 h-full min-h-0 order-1">
              <CalculatorDisplay
                expression={expression}
                currentInput={currentInput}
                result={result}
                errorMessage={errorMessage}
                memoryValue={memoryValue}
                grandTotal={grandTotal}
                settings={settings}
                canUndo={pastStates.length > 0}
                canRedo={futureStates.length > 0}
                onUndo={handleUndo}
                onRedo={handleRedo}
                onDecIncrease={handleDecIncrease}
                onDecDecrease={handleDecDecrease}
                onDirectDecSet={handleDirectDecSet}
                isNumLockOn={isNumLockOn}
                onToggleNumLock={handleToggleNumLock}
              />

              <div
                className={`p-2.5 sm:p-3 lg:p-3.5 rounded-2xl border-2 transition-colors flex-1 flex flex-col justify-center min-h-0 ${
                  isLight
                    ? 'bg-[#dedbd2] border-stone-300 shadow-xs'
                    : 'bg-slate-900/95 border-slate-800 shadow-md'
                }`}
              >
                <Keypad
                  onDigit={handleDigit}
                  onOperator={handleOperator}
                  onCalculate={handleCalculate}
                  onClearAll={handleClearAll}
                  onClearEntry={handleClearEntry}
                  onBackspace={handleBackspace}
                  onSignToggle={handleSignToggle}
                  onPercent={handlePercent}
                  onParenthesis={handleParenthesis}
                  onTaxPlus={handleTaxPlus}
                  onTaxMinus={handleTaxMinus}
                  onMarkup={handleMarkup}
                  onMargin={handleMargin}
                  onDiscount={handleDiscount}
                  onMemoryClear={handleMemoryClear}
                  onMemoryRecall={handleMemoryRecall}
                  onMemoryAdd={handleMemoryAdd}
                  onMemorySubtract={handleMemorySubtract}
                  onMemoryStore={handleMemoryStore}
                  onSubtotal={handleSubtotal}
                  onGrandTotal={handleGrandTotal}
                  settings={settings}
                  activeKeyId={activeKeyId}
                  isNumLockOn={isNumLockOn}
                  onToggleNumLock={handleToggleNumLock}
                />
              </div>
            </section>

            {/* Right Column: Paper Tape / Calculation Audit History (5 Cols) */}
            <section className="lg:col-span-5 h-[360px] sm:h-[420px] lg:h-full min-h-0 flex flex-col order-2">
              <TapeHistory
                records={tapeRecords}
                settings={settings}
                enterTrigger={enterPulseTrigger}
                onReuseValue={handleReuseValue}
                onDeleteRecord={handleDeleteRecord}
                onClearTape={handleClearTape}
                onExportExcel={handleExportExcel}
                onExportPdf={handleExportPdf}
                onPrint={handleOpenPrintPreview}
                onUpdateRecordNote={handleUpdateRecordNote}
              />
            </section>
          </div>
        )}
      </main>

      {/* 3. Footer */}
      <footer
        id="app-footer-bar"
        className={`w-full py-1.5 px-4 sm:px-6 lg:px-8 border-t text-center select-none transition-colors shrink-0 ${
          isLight ? 'bg-[#dedbd2] border-stone-300 text-stone-800' : 'bg-slate-950/80 border-slate-850 text-slate-400'
        }`}
      >
        <div className="w-full max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1680px] 3xl:max-w-[1920px] mx-auto flex items-center justify-between text-[11px] sm:text-xs">
          <div className="flex items-center gap-2 font-bold tracking-wider uppercase opacity-90">
            <span>IOOC-ShirazOffice</span>
          </div>
          <div className="font-medium opacity-75">
            By: N.Shaaeri/A.Kanani
          </div>
        </div>
      </footer>

      {/* 4. Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newVals) => {
          if (newVals.logoDataUrl !== undefined) {
            saveStoredLogo(newVals.logoDataUrl);
          }
          setSettings((prev) => ({ ...prev, ...newVals }));
        }}
        onResetDefaults={handleResetDefaults}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        settings={settings}
      />

      <PrintPreviewModal
        isOpen={isPrintPreviewOpen}
        onClose={() => setIsPrintPreviewOpen(false)}
        records={tapeRecords}
        settings={settings}
      />
    </div>
  );
}
