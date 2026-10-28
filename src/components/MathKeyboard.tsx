/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Delete } from 'lucide-react';

interface MathKeyboardProps {
  onInsert: (char: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  disabled?: boolean;
}

export const MathKeyboard: React.FC<MathKeyboardProps> = ({
  onInsert,
  onBackspace,
  onClear,
  onSubmit,
  submitLabel = 'Comprova',
  disabled = false,
}) => {
  const keys = [
    ['7', '8', '9', 'x', '('],
    ['4', '5', '6', '+', ')'],
    ['1', '2', '3', '-', '='],
    ['0', '/', '.', 'clear', 'backspace'],
  ];

  return (
    <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200 select-none max-w-md mx-auto">
      <div className="grid grid-cols-5 gap-1.5">
        {keys.flat().map((k, idx) => {
          if (k === 'clear') {
            return (
              <button
                key={`key-${idx}`}
                type="button"
                disabled={disabled}
                onClick={onClear}
                className="py-2.5 px-2 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-700 font-medium text-xs rounded-lg transition-colors cursor-pointer"
                title="Esborra tot"
              >
                C
              </button>
            );
          }
          if (k === 'backspace') {
            return (
              <button
                key={`key-${idx}`}
                type="button"
                disabled={disabled}
                onClick={onBackspace}
                className="py-2.5 px-2 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-700 font-medium text-xs rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                title="Esborra l'últim caràcter"
              >
                <Delete className="w-4 h-4" />
              </button>
            );
          }

          const isVariable = k === 'x';
          const isOperator = ['+', '-', '=', '/'].includes(k);

          let btnClass = 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200';
          if (isVariable) {
            btnClass = 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 font-bold';
          } else if (isOperator) {
            btnClass = 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200 font-semibold';
          }

          return (
            <button
              key={`key-${idx}`}
              type="button"
              disabled={disabled}
              onClick={() => onInsert(k)}
              className={`py-2 px-3 font-mono text-base border rounded-lg shadow-2xs transition-colors cursor-pointer active:scale-95 ${btnClass}`}
            >
              {k}
            </button>
          );
        })}
      </div>

      {onSubmit && (
        <button
          type="button"
          disabled={disabled}
          onClick={onSubmit}
          className="w-full mt-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium text-sm rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          {submitLabel}
        </button>
      )}
    </div>
  );
};
