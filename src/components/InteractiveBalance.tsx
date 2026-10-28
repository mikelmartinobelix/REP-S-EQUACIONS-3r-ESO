/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Scale, RotateCcw } from 'lucide-react';

interface InteractiveBalanceProps {
  initialLeftX?: number;
  initialLeftConst?: number;
  initialRightX?: number;
  initialRightConst?: number;
  equationString?: string;
  onEquilibriumReached?: () => void;
}

export const InteractiveBalance: React.FC<InteractiveBalanceProps> = ({
  initialLeftX = 2,
  initialLeftConst = 3,
  initialRightX = 0,
  initialRightConst = 9,
  equationString = '2x + 3 = 9',
}) => {
  const [leftX, setLeftX] = useState(initialLeftX);
  const [leftConst, setLeftConst] = useState(initialLeftConst);
  const [rightX, setRightX] = useState(initialRightX);
  const [rightConst, setRightConst] = useState(initialRightConst);
  const [lastActionMessage, setLastActionMessage] = useState<string>('La balança està en equilibri inicial.');

  // Calculate hypothetical solution x assuming initial balance
  const targetX = initialLeftX !== initialRightX 
    ? (initialRightConst - initialLeftConst) / (initialLeftX - initialRightX)
    : 3;

  // Current weight comparison with current x = targetX
  const leftWeight = leftX * targetX + leftConst;
  const rightWeight = rightX * targetX + rightConst;
  const isBalanced = Math.abs(leftWeight - rightWeight) < 0.001;
  const tilt = isBalanced ? 0 : leftWeight > rightWeight ? -4 : 4; // degrees

  const handleSubConstBoth = (val: number) => {
    setLeftConst((prev) => prev - val);
    setRightConst((prev) => prev - val);
    setLastActionMessage(`Has restat ${val} a ambdós costats. La balança continua en equilibri!`);
  };

  const handleAddConstBoth = (val: number) => {
    setLeftConst((prev) => prev + val);
    setRightConst((prev) => prev + val);
    setLastActionMessage(`Has sumat ${val} a ambdós costats. Es manté la igualtat!`);
  };

  const handleSubXBoth = (val: number) => {
    if (leftX >= val && rightX >= val) {
      setLeftX((prev) => prev - val);
      setRightX((prev) => prev - val);
      setLastActionMessage(`Has restat ${val}x a ambdós costats.`);
    }
  };

  const handleDivideBoth = (divisor: number) => {
    if (divisor !== 0 && leftConst === 0 && rightConst % divisor === 0 && leftX % divisor === 0) {
      setLeftX((prev) => prev / divisor);
      setRightConst((prev) => prev / divisor);
      setLastActionMessage(`Has dividit ambdós plats entre ${divisor}. Has trobat quant val 1x!`);
    }
  };

  const resetBalance = () => {
    setLeftX(initialLeftX);
    setLeftConst(initialLeftConst);
    setRightX(initialRightX);
    setRightConst(initialRightConst);
    setLastActionMessage('Balança restablerta a l\'estat inicial.');
  };

  const isIsolated = leftX === 1 && leftConst === 0 && rightX === 0;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-slate-800 text-base">La Balança d'Àlgebra</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Una equació és com una balança de dos plats: el que facis a l'esquerra ho has de fer a la dreta per mantenir l'equilibri.
          </p>
        </div>

        <button
          onClick={resetBalance}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
          title="Tornar a l'inici"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reiniciar balança
        </button>
      </div>

      {/* Visual Balance Display */}
      <div className="relative py-8 px-4 bg-white border border-slate-100 rounded-xl flex flex-col items-center overflow-hidden">
        {/* Top fulcrum beam */}
        <div
          className="w-full max-w-md h-2 bg-slate-700 rounded-full transition-transform duration-500 origin-center relative"
          style={{ transform: `rotate(${tilt}deg)` }}
        >
          {/* Left Pan cord & tray */}
          <div className="absolute left-4 top-2 flex flex-col items-center">
            <div className="w-0.5 h-12 bg-slate-400" />
            <div className="w-36 min-h-[64px] bg-indigo-50 border-2 border-indigo-300 rounded-b-xl shadow-xs p-2 flex flex-wrap items-center justify-center gap-1">
              {/* x blocks */}
              {Array.from({ length: Math.max(0, leftX) }).map((_, i) => (
                <span
                  key={`lx-${i}`}
                  className="inline-flex items-center justify-center w-7 h-7 bg-indigo-600 text-white font-mono text-xs font-bold rounded-md shadow-xs"
                >
                  x
                </span>
              ))}
              {/* Constant weights */}
              {Array.from({ length: Math.max(0, Math.min(leftConst, 12)) }).map((_, i) => (
                <span
                  key={`lc-${i}`}
                  className="inline-flex items-center justify-center w-6 h-6 bg-amber-500 text-white font-mono text-[10px] font-bold rounded-full shadow-xs"
                >
                  1
                </span>
              ))}
              {leftConst > 12 && (
                <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                  +{leftConst}
                </span>
              )}
              {leftConst < 0 && (
                <span className="text-xs font-semibold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                  {leftConst}
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-indigo-900 mt-1">
              {leftX > 0 ? `${leftX}x` : ''} {leftConst > 0 ? `+ ${leftConst}` : leftConst < 0 ? `${leftConst}` : ''}
              {leftX === 0 && leftConst === 0 ? '0' : ''}
            </span>
          </div>

          {/* Right Pan cord & tray */}
          <div className="absolute right-4 top-2 flex flex-col items-center">
            <div className="w-0.5 h-12 bg-slate-400" />
            <div className="w-36 min-h-[64px] bg-emerald-50 border-2 border-emerald-300 rounded-b-xl shadow-xs p-2 flex flex-wrap items-center justify-center gap-1">
              {/* x blocks */}
              {Array.from({ length: Math.max(0, rightX) }).map((_, i) => (
                <span
                  key={`rx-${i}`}
                  className="inline-flex items-center justify-center w-7 h-7 bg-indigo-600 text-white font-mono text-xs font-bold rounded-md shadow-xs"
                >
                  x
                </span>
              ))}
              {/* Constant weights */}
              {Array.from({ length: Math.max(0, Math.min(rightConst, 12)) }).map((_, i) => (
                <span
                  key={`rc-${i}`}
                  className="inline-flex items-center justify-center w-6 h-6 bg-amber-500 text-white font-mono text-[10px] font-bold rounded-full shadow-xs"
                >
                  1
                </span>
              ))}
              {rightConst > 12 && (
                <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                  +{rightConst}
                </span>
              )}
              {rightConst < 0 && (
                <span className="text-xs font-semibold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                  {rightConst}
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-emerald-900 mt-1">
              {rightX > 0 ? `${rightX}x` : ''} {rightConst > 0 ? `+ ${rightConst}` : rightConst < 0 ? `${rightConst}` : ''}
              {rightX === 0 && rightConst === 0 ? '0' : ''}
            </span>
          </div>
        </div>

        {/* Central Triangle Fulcrum Pillar */}
        <div className="mt-14 w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-b-[32px] border-b-slate-700" />
        <div className="w-24 h-2 bg-slate-600 rounded-sm" />
      </div>

      {/* Status banner */}
      <div className="mt-3 text-xs text-center font-medium text-slate-700 bg-slate-100 py-1.5 px-3 rounded-lg">
        {lastActionMessage}
      </div>

      {isIsolated ? (
        <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm text-center font-medium">
          Molt bé! La x ha quedat completament aïllada: <strong className="font-bold text-base">x = {rightConst}</strong>.
        </div>
      ) : (
        /* Action buttons to experiment */
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {leftConst > 0 && (
            <button
              onClick={() => handleSubConstBoth(Math.min(leftConst, 3))}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
            >
              Restar {Math.min(leftConst, 3)} a banda i banda
            </button>
          )}

          {rightX > 0 && leftX >= rightX && (
            <button
              onClick={() => handleSubXBoth(rightX)}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
            >
              Restar {rightX}x a banda i banda
            </button>
          )}

          {leftX > 1 && leftConst === 0 && rightConst % leftX === 0 && (
            <button
              onClick={() => handleDivideBoth(leftX)}
              className="px-2.5 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors font-semibold"
            >
              Dividir ambdós costats entre {leftX}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
