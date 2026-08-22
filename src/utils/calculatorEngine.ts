import Decimal from 'decimal.js';

// Configure Decimal precision for financial calculations (32 digits of precision)
Decimal.set({ precision: 32, rounding: Decimal.ROUND_HALF_UP });

export interface EvalResult {
  success: boolean;
  value: number;
  decimalValue: Decimal;
  error?: string;
  expressionFormatted?: string;
}

/**
 * Tokenize mathematical expression into numbers, operators, and functions.
 */
interface Token {
  type: 'NUMBER' | 'OPERATOR' | 'LPAREN' | 'RPAREN' | 'PERCENT';
  value: string;
}

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const str = input.replace(/\s+/g, '');

  while (i < str.length) {
    const char = str[i];

    // Numbers (including decimals)
    if (/[0-9.]/.test(char)) {
      let numStr = '';
      while (i < str.length && /[0-9.]/.test(str[i])) {
        numStr += str[i];
        i++;
      }
      tokens.push({ type: 'NUMBER', value: numStr });
      continue;
    }

    if (char === '(') {
      tokens.push({ type: 'LPAREN', value: '(' });
      i++;
      continue;
    }

    if (char === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      i++;
      continue;
    }

    if (char === '%') {
      tokens.push({ type: 'PERCENT', value: '%' });
      i++;
      continue;
    }

    if (['+', '-', '*', '/', '×', '÷', '^'].includes(char)) {
      // Check for unary minus: at start or right after another operator/lparen
      if (char === '-' || char === '−') {
        const prevToken = tokens[tokens.length - 1];
        if (!prevToken || prevToken.type === 'OPERATOR' || prevToken.type === 'LPAREN') {
          // Unary minus: read the next number
          i++;
          let numStr = '-';
          while (i < str.length && /[0-9.]/.test(str[i])) {
            numStr += str[i];
            i++;
          }
          if (numStr === '-') {
            // Standalone minus (invalid or partial)
            tokens.push({ type: 'OPERATOR', value: '-' });
          } else {
            tokens.push({ type: 'NUMBER', value: numStr });
          }
          continue;
        }
      }

      let op = char;
      if (op === '×') op = '*';
      if (op === '÷') op = '/';
      if (op === '−') op = '-';

      tokens.push({ type: 'OPERATOR', value: op });
      i++;
      continue;
    }

    // Skip unknown character
    i++;
  }

  return tokens;
}

/**
 * Evaluates standard expression using Shunting-yard algorithm + Decimal.js
 * Supports accounting percentages:
 * e.g. 100 + 15% => 115
 * e.g. 100 - 15% => 85
 * e.g. 100 * 15% => 15
 * e.g. 100 / 15% => 666.67
 */
export function evaluateExpression(exprString: string): EvalResult {
  if (!exprString || exprString.trim() === '') {
    return { success: true, value: 0, decimalValue: new Decimal(0) };
  }

  try {
    const rawTokens = tokenize(exprString);
    if (rawTokens.length === 0) {
      return { success: true, value: 0, decimalValue: new Decimal(0) };
    }

    // Process percentage tokens in context
    const tokens: Token[] = [];
    for (let j = 0; j < rawTokens.length; j++) {
      const current = rawTokens[j];
      if (current.type === 'PERCENT') {
        // Look back
        const prev = tokens[tokens.length - 1];
        if (prev && prev.type === 'NUMBER') {
          const percentVal = new Decimal(prev.value);
          // Look before that for operator and base number
          const opToken = tokens[tokens.length - 2];
          const baseToken = tokens[tokens.length - 3];

          if (opToken && opToken.type === 'OPERATOR' && baseToken && baseToken.type === 'NUMBER') {
            const baseVal = new Decimal(baseToken.value);
            if (opToken.value === '+' || opToken.value === '-') {
              // 100 + 15% => calculate (100 * 15 / 100) = 15
              const calcPercentAmount = baseVal.mul(percentVal).div(100);
              tokens[tokens.length - 1] = { type: 'NUMBER', value: calcPercentAmount.toString() };
              continue;
            }
          }
          // Default percentage: value / 100 (e.g. 100 * 15% => 100 * 0.15)
          tokens[tokens.length - 1] = { type: 'NUMBER', value: percentVal.div(100).toString() };
          continue;
        }
      }
      tokens.push(current);
    }

    // Shunting-yard into RPN
    const outputQueue: Token[] = [];
    const opStack: Token[] = [];

    const precedence: Record<string, number> = {
      '+': 1,
      '-': 1,
      '*': 2,
      '/': 2,
      '^': 3,
    };

    for (const token of tokens) {
      if (token.type === 'NUMBER') {
        outputQueue.push(token);
      } else if (token.type === 'OPERATOR') {
        while (
          opStack.length > 0 &&
          opStack[opStack.length - 1].type === 'OPERATOR' &&
          precedence[opStack[opStack.length - 1].value] >= precedence[token.value]
        ) {
          outputQueue.push(opStack.pop()!);
        }
        opStack.push(token);
      } else if (token.type === 'LPAREN') {
        opStack.push(token);
      } else if (token.type === 'RPAREN') {
        while (opStack.length > 0 && opStack[opStack.length - 1].type !== 'LPAREN') {
          outputQueue.push(opStack.pop()!);
        }
        if (opStack.length > 0 && opStack[opStack.length - 1].type === 'LPAREN') {
          opStack.pop(); // remove LPAREN
        }
      }
    }

    while (opStack.length > 0) {
      const top = opStack.pop()!;
      if (top.type === 'LPAREN' || top.type === 'RPAREN') {
        return { success: false, value: 0, decimalValue: new Decimal(0), error: 'Mismatched parentheses' };
      }
      outputQueue.push(top);
    }

    // Evaluate RPN
    const evalStack: Decimal[] = [];

    for (const token of outputQueue) {
      if (token.type === 'NUMBER') {
        evalStack.push(new Decimal(token.value));
      } else if (token.type === 'OPERATOR') {
        if (evalStack.length < 2) {
          return { success: false, value: 0, decimalValue: new Decimal(0), error: 'Invalid expression' };
        }
        const b = evalStack.pop()!;
        const a = evalStack.pop()!;

        let res: Decimal;
        switch (token.value) {
          case '+':
            res = a.plus(b);
            break;
          case '-':
            res = a.minus(b);
            break;
          case '*':
            res = a.times(b);
            break;
          case '/':
            if (b.isZero()) {
              return { success: false, value: 0, decimalValue: new Decimal(0), error: 'Division by zero' };
            }
            res = a.dividedBy(b);
            break;
          case '^':
            res = a.pow(b);
            break;
          default:
            return { success: false, value: 0, decimalValue: new Decimal(0), error: `Unknown operator: ${token.value}` };
        }
        evalStack.push(res);
      }
    }

    if (evalStack.length !== 1) {
      return { success: false, value: 0, decimalValue: new Decimal(0), error: 'Incomplete expression' };
    }

    const finalDecimal = evalStack[0];
    return {
      success: true,
      value: finalDecimal.toNumber(),
      decimalValue: finalDecimal,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Calculation error';
    return {
      success: false,
      value: 0,
      decimalValue: new Decimal(0),
      error: message,
    };
  }
}

/**
 * Accounting calculation helpers
 */
export function calculateTaxPlus(amount: number, taxRatePercentage: number): { total: number; taxAmount: number } {
  const dAmount = new Decimal(amount);
  const dRate = new Decimal(taxRatePercentage).div(100);
  const tax = dAmount.mul(dRate);
  const total = dAmount.plus(tax);
  return {
    total: total.toNumber(),
    taxAmount: tax.toNumber(),
  };
}

export function calculateTaxMinus(grossAmount: number, taxRatePercentage: number): { net: number; taxAmount: number } {
  const dGross = new Decimal(grossAmount);
  const dRate = new Decimal(taxRatePercentage).div(100);
  // Net = Gross / (1 + Rate)
  const net = dGross.div(new Decimal(1).plus(dRate));
  const tax = dGross.minus(net);
  return {
    net: net.toNumber(),
    taxAmount: tax.toNumber(),
  };
}

export function calculateMarkup(cost: number, markupPercentage: number): { sellingPrice: number; markupAmount: number } {
  const dCost = new Decimal(cost);
  const dMarkup = new Decimal(markupPercentage).div(100);
  const markupAmount = dCost.mul(dMarkup);
  const sellingPrice = dCost.plus(markupAmount);
  return {
    sellingPrice: sellingPrice.toNumber(),
    markupAmount: markupAmount.toNumber(),
  };
}

export function calculateMargin(cost: number, marginPercentage: number): { sellingPrice: number; profit: number } {
  const dCost = new Decimal(cost);
  const dMargin = new Decimal(marginPercentage).div(100);
  if (dMargin.greaterThanOrEqualTo(1)) {
    throw new Error('Margin must be less than 100%');
  }
  // Selling Price = Cost / (1 - Margin%)
  const sellingPrice = dCost.div(new Decimal(1).minus(dMargin));
  const profit = sellingPrice.minus(dCost);
  return {
    sellingPrice: sellingPrice.toNumber(),
    profit: profit.toNumber(),
  };
}

export function calculateDiscount(originalPrice: number, discountPercentage: number): { discountedPrice: number; savings: number } {
  const dPrice = new Decimal(originalPrice);
  const dDiscount = new Decimal(discountPercentage).div(100);
  const savings = dPrice.mul(dDiscount);
  const discountedPrice = dPrice.minus(savings);
  return {
    discountedPrice: discountedPrice.toNumber(),
    savings: savings.toNumber(),
  };
}
