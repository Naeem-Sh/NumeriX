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

import {
  Settings as SettingsIcon,
  HelpCircle,
  Volume2,
  VolumeX,
  Calculator as CalcIcon,
  ClipboardCheck,
  PanelRight,
  PanelLeft,
  PanelTop,
  LayoutGrid,
  FileSpreadsheet,
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

  const handleSetLayout = (layout: WorkspaceLayout) => {
    setSettings((prev) => {
      const updated = { ...prev, workspaceLayout: layout };
      saveStoredSettings(updated);
      return updated;
    });
    playKeySound('action', settings.soundVolume);
  };

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

  // Reset defaults handler
  const handleResetDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    saveStoredSettings(DEFAULT_SETTINGS);
    triggerKeyFeedback('reset_defaults', 'action');
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

  // Global Keyboard & Paste Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
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

  // Theme Styling - Strictly 2 themes: dark and light
  const isLight = settings.theme === 'light';
  const themeContainerClass = isLight
    ? 'bg-slate-100 text-slate-900'
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
        className={`w-full border-b transition-all px-4 py-2.5 sm:px-6 lg:px-8 shrink-0 ${
          isLight ? 'bg-white border-slate-300 shadow-xs' : 'bg-slate-900/90 border-slate-800 shadow-sm'
        }`}
      >
        <div className="w-full max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1680px] 3xl:max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Application Title */}
          <div className="flex items-center gap-3">
            <button
              id="header-logo-btn"
              onClick={() => setIsSettingsOpen(true)}
              title="Click to open settings & customize company logo"
              className="relative group w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center p-1 border border-cyan-500/30 bg-cyan-950/30 hover:border-cyan-400 transition-all cursor-pointer shadow-xs overflow-hidden shrink-0"
            >
              {settings.logoDataUrl ? (
                <img
                  src={settings.logoDataUrl}
                  alt="Company Logo"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <CalcIcon className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-cyan-400 group-hover:scale-110 transition-transform" />
              )}
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base xl:text-lg font-black tracking-tight leading-tight flex items-center gap-1.5">
                  <span className={`font-black tracking-wide ${isLight ? 'text-cyan-800' : 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300'}`}>
                    NumeriX
                  </span>
                  {settings.companyName && (
                    <span className={`font-medium text-xs sm:text-sm ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                      • {settings.companyName}
                    </span>
                  )}
                </h1>
                <span className={`hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  isLight ? 'bg-cyan-100 text-cyan-900 border border-cyan-300' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                }`}>
                  Financial Pro
                </span>
              </div>
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
                  ? 'Sound: ON (Enter key only) - Click to Mute'
                  : 'Sound: OFF - Click to Turn Sound ON'
              }
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer text-xs font-bold ${
                settings.soundEnabled
                  ? isLight
                    ? 'bg-emerald-100 hover:bg-emerald-200 border-emerald-300 text-emerald-950 shadow-xs'
                    : 'bg-emerald-950/50 hover:bg-emerald-900/70 border-emerald-700 text-emerald-300 shadow-xs'
                  : isLight
                  ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400'
              }`}
            >
              {settings.soundEnabled ? (
                <>
                  <Volume2 className={`w-4 h-4 ${isLight ? 'text-emerald-800' : 'text-emerald-400'}`} />
                  <span className="text-[11px]">Sound: ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-slate-500" />
                  <span className="text-[11px]">Sound: OFF</span>
                </>
              )}
            </button>

            {/* Export to Excel Quick Header Button */}
            <button
              id="header-export-excel-btn"
              onClick={handleExportExcel}
              disabled={tapeRecords.length === 0}
              title="Export calculation audit tape to Microsoft Excel (.XLSX) - (Ctrl+E)"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed ${
                isLight
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-xs'
                  : 'bg-emerald-700/90 hover:bg-emerald-600 text-white border-emerald-600 shadow-xs'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-white" />
              <span className="text-[11px] hidden sm:inline">Excel</span>
            </button>

            {/* Settings Button */}
            <button
              id="header-settings-btn"
              onClick={() => setIsSettingsOpen(true)}
              title="Calculator Preferences, Presets & Logo"
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'
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
                  ? 'bg-cyan-100 hover:bg-cyan-200 border-cyan-300 text-cyan-950 font-bold'
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

      {/* 2. Main Workstation Area */}
      <main className="flex-1 min-h-0 w-full max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1680px] 3xl:max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex flex-col justify-center">
        {currentLayout === 'audit-left' ? (
          /* Mode 2: Audit Left & Keypad Right */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 lg:gap-5 2xl:gap-6 items-stretch h-full min-h-0">
            {/* Left Column: Paper Tape / Calculation Audit History (5 Cols) */}
            <section className="lg:col-span-5 h-[340px] sm:h-[400px] lg:h-full min-h-0 flex flex-col order-1">
              <TapeHistory
                records={tapeRecords}
                settings={settings}
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
              />

              <div
                className={`p-2.5 sm:p-3 lg:p-3.5 rounded-2xl border-2 transition-colors flex-1 flex flex-col justify-center min-h-0 ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 shadow-sm'
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
                />
              </div>
            </section>
          </div>
        ) : currentLayout === 'audit-top' ? (
          /* Mode 3: Audit Up & Keypad Down (Vertical Stacked Layout) */
          <div className="flex flex-col gap-3 lg:gap-4 items-stretch h-full min-h-0 max-w-4xl mx-auto w-full overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            {/* Top Area: Paper Tape / Calculation Audit History */}
            <section className="h-[280px] sm:h-[320px] lg:h-[350px] shrink-0 flex flex-col">
              <TapeHistory
                records={tapeRecords}
                settings={settings}
                onReuseValue={handleReuseValue}
                onDeleteRecord={handleDeleteRecord}
                onClearTape={handleClearTape}
                onExportExcel={handleExportExcel}
                onExportPdf={handleExportPdf}
                onPrint={handleOpenPrintPreview}
                onUpdateRecordNote={handleUpdateRecordNote}
              />
            </section>

            {/* Bottom Area: Calculator Display, Decimal Controls & Keypad */}
            <section className="flex flex-col gap-2 sm:gap-2.5 lg:gap-3 shrink-0">
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
              />

              <div
                className={`p-2.5 sm:p-3 lg:p-3.5 rounded-2xl border-2 transition-colors flex flex-col justify-center ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 shadow-sm'
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
                />
              </div>
            </section>
          </div>
        ) : (
          /* Mode 1 (DEFAULT): Audit Right & Keypad Left (Optimized for 16:9 widescreen monitors) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 lg:gap-5 2xl:gap-6 items-stretch h-full min-h-0">
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
              />

              <div
                className={`p-2.5 sm:p-3 lg:p-3.5 rounded-2xl border-2 transition-colors flex-1 flex flex-col justify-center min-h-0 ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 shadow-sm'
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
                />
              </div>
            </section>

            {/* Right Column: Paper Tape / Calculation Audit History (5 Cols) */}
            <section className="lg:col-span-5 h-[340px] sm:h-[400px] lg:h-full min-h-0 flex flex-col order-2">
              <TapeHistory
                records={tapeRecords}
                settings={settings}
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

      {/* 3. Bottom 3-Mode Layout Switcher Bar */}
      <aside
        id="bottom-layout-bar"
        aria-label="Workspace Layout Switcher"
        className={`w-full py-1.5 px-4 sm:px-6 lg:px-8 border-t flex items-center justify-center select-none transition-colors shrink-0 ${
          isLight ? 'bg-slate-100/95 border-slate-300' : 'bg-slate-950/95 border-slate-850'
        }`}
      >
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider opacity-60 mr-1 hidden sm:inline-flex items-center gap-1">
            <LayoutGrid className="w-3.5 h-3.5 text-cyan-500" />
            <span>Layout:</span>
          </span>

          {/* Mode 1: Audit Right & Keypad Left (DEFAULT) */}
          <button
            id="btn-layout-audit-right"
            onClick={() => handleSetLayout('audit-right')}
            title="Mode 1: Keypad on Left, Audit Tape on Right (Default 16:9 widescreen layout)"
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
              currentLayout === 'audit-right'
                ? isLight
                  ? 'bg-cyan-600 text-white shadow-sm border border-cyan-700 font-extrabold ring-2 ring-cyan-500/30'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/70 shadow-xs font-extrabold ring-2 ring-cyan-500/20'
                : isLight
                ? 'bg-white hover:bg-slate-200/80 border border-slate-300 text-slate-700'
                : 'bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400'
            }`}
          >
            <PanelRight className="w-3.5 h-3.5" />
            <span>Audit Right • Keypad Left</span>
            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hidden md:inline">DEFAULT</span>
          </button>

          {/* Mode 2: Audit Left & Keypad Right */}
          <button
            id="btn-layout-audit-left"
            onClick={() => handleSetLayout('audit-left')}
            title="Mode 2: Audit Tape on Left, Keypad on Right (Classic accounting layout)"
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
              currentLayout === 'audit-left'
                ? isLight
                  ? 'bg-cyan-600 text-white shadow-sm border border-cyan-700 font-extrabold ring-2 ring-cyan-500/30'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/70 shadow-xs font-extrabold ring-2 ring-cyan-500/20'
                : isLight
                ? 'bg-white hover:bg-slate-200/80 border border-slate-300 text-slate-700'
                : 'bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400'
            }`}
          >
            <PanelLeft className="w-3.5 h-3.5" />
            <span>Audit Left • Keypad Right</span>
          </button>

          {/* Mode 3: Audit Up & Keypad Down */}
          <button
            id="btn-layout-audit-top"
            onClick={() => handleSetLayout('audit-top')}
            title="Mode 3: Audit Tape Up, Keypad Down (Vertical stacked feed)"
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
              currentLayout === 'audit-top'
                ? isLight
                  ? 'bg-cyan-600 text-white shadow-sm border border-cyan-700 font-extrabold ring-2 ring-cyan-500/30'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/70 shadow-xs font-extrabold ring-2 ring-cyan-500/20'
                : isLight
                ? 'bg-white hover:bg-slate-200/80 border border-slate-300 text-slate-700'
                : 'bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400'
            }`}
          >
            <PanelTop className="w-3.5 h-3.5" />
            <span>Audit Up • Keypad Down</span>
          </button>
        </div>
      </aside>

      {/* 3. Footer */}
      <footer
        id="app-footer-bar"
        className={`w-full py-1.5 px-4 sm:px-6 lg:px-8 border-t text-center select-none transition-colors shrink-0 ${
          isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950/80 border-slate-850 text-slate-400'
        }`}
      >
        <div className="w-full max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1680px] 3xl:max-w-[1920px] mx-auto flex items-center justify-between text-[11px] sm:text-xs">
          <div className="font-bold tracking-wider uppercase opacity-90">
            IOOC-ShirazOffice
          </div>
          <div className="font-medium opacity-75">
            By: N.Shaaeri
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
