/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface MathExpressionProps {
  expression: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Strips one pair of matching outer parentheses if they wrap the entire expression
 */
function stripOuterParens(expr: string): string {
  const trimmed = expr.trim();
  if (!trimmed.startsWith('(') || !trimmed.endsWith(')')) return trimmed;

  let depth = 0;
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed[i] === '(') depth++;
    else if (trimmed[i] === ')') depth--;
    if (depth === 0 && i < trimmed.length - 1) {
      // Closed before the end, so outer parens don't wrap the whole string
      return trimmed;
    }
  }
  return trimmed.slice(1, -1).trim();
}

/**
 * Splits a string by a list of separator characters only at parenthesis depth 0
 */
function splitAtTopLevel(
  expr: string,
  isOperator: (ch: string, index: number, str: string) => boolean
): { parts: string[]; ops: string[] } {
  const parts: string[] = [];
  const ops: string[] = [];
  let depth = 0;
  let lastIdx = 0;

  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth = Math.max(0, depth - 1);
    else if (depth === 0 && isOperator(ch, i, expr)) {
      parts.push(expr.slice(lastIdx, i).trim());
      ops.push(ch);
      lastIdx = i + 1;
    }
  }

  parts.push(expr.slice(lastIdx).trim());
  return { parts, ops };
}

/**
 * Find the first top-level '/' outside parentheses
 */
function findTopLevelSlash(expr: string): number {
  let depth = 0;
  for (let i = 0; i < expr.length; i++) {
    if (expr[i] === '(') depth++;
    else if (expr[i] === ')') depth = Math.max(0, depth - 1);
    else if (depth === 0 && expr[i] === '/') return i;
  }
  return -1;
}

const SIZE_CLASSES: Record<NonNullable<MathExpressionProps['size']>, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-2xl md:text-3xl',
};

const FRAC_BORDER_CLASSES: Record<NonNullable<MathExpressionProps['size']>, string> = {
  xs: 'border-b',
  sm: 'border-b-[1.5px]',
  md: 'border-b-2',
  lg: 'border-b-2',
};

export const MathExpression: React.FC<MathExpressionProps> = ({
  expression,
  size = 'md',
  className = '',
}) => {
  const renderTerm = (rawTerm: string, keyPrefix: string, depthLevel = 0): React.ReactNode => {
    const term = rawTerm.trim();
    if (!term || depthLevel > 6) return term;

    // Check if there is a top-level '+' or '-' (binary operator)
    const addSub = splitAtTopLevel(term, (ch, idx, str) => {
      if (ch !== '+' && ch !== '-') return false;
      // Ignore unary sign at start or right after another operator
      const prevSlice = str.slice(0, idx).trim();
      if (!prevSlice) return false;
      const lastChar = prevSlice[prevSlice.length - 1];
      if (['+', '-', '*', '·', '/', '(', '='].includes(lastChar)) return false;
      return true;
    });

    if (addSub.ops.length > 0) {
      return (
        <span key={keyPrefix} className="inline-flex flex-wrap items-center justify-center gap-x-1.5">
          {addSub.parts.map((part, idx) => (
            <React.Fragment key={`${keyPrefix}-as-${idx}`}>
              {idx > 0 && <span className="mx-0.5">{addSub.ops[idx - 1]}</span>}
              {renderTerm(part, `${keyPrefix}-p-${idx}`, depthLevel + 1)}
            </React.Fragment>
          ))}
        </span>
      );
    }

    // Check top-level multiplication '*' or '·'
    const multSplit = splitAtTopLevel(term, (ch) => ch === '*' || ch === '·');
    if (multSplit.ops.length > 0) {
      return (
        <span key={keyPrefix} className="inline-flex flex-wrap items-center justify-center gap-x-1">
          {multSplit.parts.map((part, idx) => (
            <React.Fragment key={`${keyPrefix}-m-${idx}`}>
              {idx > 0 && <span className="mx-0.5">·</span>}
              {renderTerm(part, `${keyPrefix}-mp-${idx}`, depthLevel + 1)}
            </React.Fragment>
          ))}
        </span>
      );
    }

    // Check top-level fraction '/'
    const slashIdx = findTopLevelSlash(term);
    if (slashIdx > 0 && slashIdx < term.length - 1) {
      // Check for a leading negative sign before a fraction like "-x / 2"
      let prefix = '';
      let numStr = term.slice(0, slashIdx).trim();
      const denStr = term.slice(slashIdx + 1).trim();

      if (numStr.startsWith('-') && numStr.length > 1 && !numStr.startsWith('-(')) {
        // Keep negative sign on numerator unless numerator is complex
        numStr = numStr;
      } else if (numStr.startsWith('-(') && numStr.endsWith(')')) {
        prefix = '-';
        numStr = numStr.slice(1).trim();
      }

      const cleanNum = stripOuterParens(numStr);
      const cleanDen = stripOuterParens(denStr);

      return (
        <span key={keyPrefix} className="inline-flex items-center align-middle">
          {prefix && <span className="mr-0.5">{prefix}</span>}
          <span className="inline-flex flex-col items-center justify-center align-middle mx-1 leading-tight">
            <span
              className={`px-1.5 pb-0.5 ${FRAC_BORDER_CLASSES[size]} border-current text-center text-[0.84em] whitespace-nowrap`}
            >
              {renderTerm(cleanNum, `${keyPrefix}-num`, depthLevel + 1)}
            </span>
            <span className="px-1.5 pt-0.5 text-center text-[0.84em] whitespace-nowrap">
              {renderTerm(cleanDen, `${keyPrefix}-den`, depthLevel + 1)}
            </span>
          </span>
        </span>
      );
    }

    // If wrapped in parentheses and contains a fraction inside, render parentheses around inner expression
    if (term.startsWith('(') && term.endsWith(')')) {
      const inner = stripOuterParens(term);
      if (inner !== term && inner.includes('/')) {
        return (
          <span key={keyPrefix} className="inline-flex items-center">
            <span>(</span>
            {renderTerm(inner, `${keyPrefix}-in`, depthLevel + 1)}
            <span>)</span>
          </span>
        );
      }
    }

    // Plain expression: format * as · for cleaner Catalan math notation
    return <span key={keyPrefix}>{term.replace(/\*/g, ' · ')}</span>;
  };

  const renderEquation = (eqStr: string, keyPrefix: string): React.ReactNode => {
    const eqParts = eqStr.split('=');
    if (eqParts.length === 1) {
      return renderTerm(eqParts[0], `${keyPrefix}-s0`);
    }

    return (
      <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
        {eqParts.map((side, idx) => (
          <React.Fragment key={`${keyPrefix}-eq-${idx}`}>
            {idx > 0 && <span className="mx-0.5">=</span>}
            {renderTerm(side, `${keyPrefix}-side-${idx}`)}
          </React.Fragment>
        ))}
      </span>
    );
  };

  // Support arrow-chained expressions like "3x / 3 = 15 / 3 → x = 5" or "=>"
  const arrowMatch = expression.match(/(→|=>)/);
  if (arrowMatch) {
    const segments = expression.split(/(→|=>)/);
    return (
      <span
        className={`inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-mono ${SIZE_CLASSES[size]} ${className}`}
      >
        {segments.map((seg, idx) => {
          if (seg === '→' || seg === '=>') {
            return (
              <span key={`arr-${idx}`} className="mx-1 font-sans">
                →
              </span>
            );
          }
          return (
            <React.Fragment key={`seg-${idx}`}>
              {renderEquation(seg, `seg-${idx}`)}
            </React.Fragment>
          );
        })}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex flex-wrap items-center justify-center font-mono ${SIZE_CLASSES[size]} ${className}`}
    >
      {renderEquation(expression, 'root')}
    </span>
  );
};
