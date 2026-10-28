/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EquationExercise } from '../types/math';
import { diagnoseEquationStep, splitEquation, evalLinearSide } from '../utils/algebraEngine';
import { MathKeyboard } from './MathKeyboard';
import { soundEffects } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import { CheckCircle2, AlertCircle, Sparkles, Eye, ArrowRight, Plus, Trash2, HelpCircle } from 'lucide-react';
import { InteractiveBalance } from './InteractiveBalance';

interface AutonomousPracticeProps {
  exercise: EquationExercise;
  onCompleted: (isFirstTry: boolean) => void;
  onNextExercise: () => void;
}

interface StepAttempt {
  id: string;
  expression: string;
  status: 'valid' | 'error' | 'pending';
  feedbackTitle?: string;
  feedbackText?: string;
}

export const AutonomousPractice: React.FC<AutonomousPracticeProps> = ({
  exercise,
  onCompleted,
  onNextExercise,
}) => {
  const [steps, setSteps] = useState<StepAttempt[]>([
    { id: '1', expression: '', status: 'pending' },
  ]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [showFullSolution, setShowFullSolution] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [hadError, setHadError] = useState(false);

  const handleUpdateStepText = (index: number, val: string) => {
    setSteps((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], expression: val, status: 'pending', feedbackText: undefined };
      return copy;
    });
  };

  const handleVerifyStep = (index: number) => {
    const stepToVerify = steps[index];
    if (!stepToVerify.expression.trim()) return;

    // Check if user reached final solution: x = solution
    const sides = splitEquation(stepToVerify.expression);
    const clean = stepToVerify.expression.replace(/\s+/g, '');

    if (clean === `x=${exercise.solution}` || (!stepToVerify.expression.includes('=') && parseFloat(clean) === exercise.solution)) {
      setSteps((prev) => {
        const copy = [...prev];
        copy[index] = {
          ...copy[index],
          status: 'valid',
          feedbackTitle: 'Molt bé! Solució trobada!',
          feedbackText: `Has resolt l'equació correctament: x = ${exercise.solution}.`,
        };
        return copy;
      });
      setIsSolved(true);
      soundEffects.playCelebration();
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
      onCompleted(!hadError);
      return;
    }

    // Context for comparison
    const previousContext = index === 0 ? exercise.rawEquation : steps[index - 1].expression;
    const diag = diagnoseEquationStep(
      previousContext,
      stepToVerify.expression,
      exercise.solution,
      exercise.steps[Math.min(index, exercise.steps.length - 1)]?.expectedExpression || `x = ${exercise.solution}`
    );

    if (diag.isCorrect) {
      soundEffects.playSuccess();
      setSteps((prev) => {
        const copy = [...prev];
        copy[index] = {
          ...copy[index],
          status: 'valid',
          feedbackTitle: diag.title,
          feedbackText: diag.explanation,
        };
        // Add next step if not solved
        if (index === prev.length - 1) {
          copy.push({ id: String(Date.now()), expression: '', status: 'pending' });
          setActiveStepIndex(index + 1);
        }
        return copy;
      });
    } else {
      soundEffects.playGentleRetry();
      setHadError(true);
      setSteps((prev) => {
        const copy = [...prev];
        copy[index] = {
          ...copy[index],
          status: 'error',
          feedbackTitle: diag.title,
          feedbackText: `${diag.explanation} ${diag.pedagogicalTip ? '💡 ' + diag.pedagogicalTip : ''}`,
        };
        return copy;
      });
    }
  };

  const handleAddStep = () => {
    setSteps((prev) => [...prev, { id: String(Date.now()), expression: '', status: 'pending' }]);
    setActiveStepIndex(steps.length);
  };

  const handleRemoveStep = (idx: number) => {
    if (steps.length <= 1) return;
    setSteps((prev) => prev.filter((_, i) => i !== idx));
    setActiveStepIndex(Math.max(0, idx - 1));
  };

  const currentActiveExpr = steps[activeStepIndex]?.expression || '';

  const handleInsertChar = (char: string) => {
    handleUpdateStepText(activeStepIndex, currentActiveExpr + char);
  };

  const handleBackspace = () => {
    handleUpdateStepText(activeStepIndex, currentActiveExpr.slice(0, -1));
  };

  const handleClear = () => {
    handleUpdateStepText(activeStepIndex, '');
  };

  return (
    <div className="space-y-6">
      {/* Equation Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
            Pissarra Autònoma
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBalance((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              {showBalance ? 'Amagar Balança' : 'Obrir Balança Visual'}
            </button>
            <button
              onClick={() => setShowFullSolution((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              {showFullSolution ? 'Amagar Solució' : 'Veure Solució Pas a Pas'}
            </button>
          </div>
        </div>

        <div className="text-center py-4 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-xs text-slate-500 font-medium mb-1">Resol aquesta equació:</p>
          <div className="font-mono text-2xl md:text-3xl font-bold text-slate-900 tracking-wide">
            {exercise.rawEquation}
          </div>
        </div>

        {/* Optional Visual Balance */}
        {showBalance && (
          <div className="mt-4">
            <InteractiveBalance
              initialLeftX={exercise.visualBalance?.leftX ?? 2}
              initialLeftConst={exercise.visualBalance?.leftConstant ?? 3}
              initialRightX={exercise.visualBalance?.rightX ?? 0}
              initialRightConst={exercise.visualBalance?.rightConstant ?? 9}
              equationString={exercise.rawEquation}
            />
          </div>
        )}
      </div>

      {/* Autonomous Blackboard Steps */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Les teves línies de treball:</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Escriu els passos intermedis com fas a la llibreta. Comprova cada pas quan vulguis.
          </p>
        </div>

        <div className="space-y-3">
          {steps.map((st, idx) => {
            const isActive = idx === activeStepIndex;
            return (
              <div
                key={st.id}
                onClick={() => setActiveStepIndex(idx)}
                className={`p-3.5 rounded-xl border transition-all ${
                  isActive
                    ? 'border-indigo-400 bg-indigo-50/20 ring-1 ring-indigo-300'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-400 w-6">
                    #{idx + 1}
                  </span>
                  <input
                    type="text"
                    value={st.expression}
                    onChange={(e) => handleUpdateStepText(idx, e.target.value)}
                    onFocus={() => setActiveStepIndex(idx)}
                    placeholder={idx === 0 ? 'ex: 2x = 11 + 3' : 'següent pas...'}
                    className="flex-1 font-mono text-base px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-slate-900"
                  />
                  <button
                    onClick={() => handleVerifyStep(idx)}
                    disabled={!st.expression.trim()}
                    className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 rounded-lg transition-colors cursor-pointer"
                  >
                    Comprovar línia
                  </button>
                  {steps.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveStep(idx);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                      title="Eliminar línia"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Line feedback */}
                {st.feedbackText && (
                  <div
                    className={`mt-2.5 p-3 rounded-lg text-xs flex items-start gap-2 ${
                      st.status === 'valid'
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                        : 'bg-rose-50 text-rose-900 border border-rose-200'
                    }`}
                  >
                    {st.status === 'valid' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      {st.feedbackTitle && <strong className="font-bold block">{st.feedbackTitle}</strong>}
                      <p className="mt-0.5 leading-relaxed">{st.feedbackText}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!isSolved && (
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleAddStep}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Afegir una altra línia de càlcul
            </button>

            <span className="text-xs text-slate-400">
              Línia activa: #{activeStepIndex + 1}
            </span>
          </div>
        )}

        {/* On-screen Math Keyboard */}
        {!isSolved && (
          <div className="pt-3 border-t border-slate-100">
            <MathKeyboard
              onInsert={handleInsertChar}
              onBackspace={handleBackspace}
              onClear={handleClear}
              onSubmit={() => handleVerifyStep(activeStepIndex)}
              submitLabel={`Comprova la línia #${activeStepIndex + 1}`}
            />
          </div>
        )}
      </div>

      {/* Full Solution Sheet (if requested) */}
      {showFullSolution && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-5 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            Guia de resolució completa pas a pas:
          </h4>
          <ol className="list-decimal list-inside text-xs text-slate-800 space-y-1.5 leading-relaxed">
            {exercise.explanationSummary.map((item, i) => (
              <li key={`sol-line-${i}`} className="pl-1">
                {item}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Completion Banner */}
      {isSolved && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full text-emerald-600 mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-emerald-950">
              Felicitats! Has resolt l'equació de forma autònoma!
            </h3>
            <p className="text-xs text-emerald-800 mt-1">
              Solució verificada: <strong className="font-mono text-sm">x = {exercise.solution}</strong>
            </p>
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={onNextExercise}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Següent repte
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
