/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { EquationExercise, DiagnosticFeedback, ErrorType } from '../types/math';
import { diagnoseEquationStep } from '../utils/algebraEngine';
import { MathKeyboard } from './MathKeyboard';
import { MathExpression } from './MathExpression';
import { soundEffects } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import { CheckCircle2, AlertCircle, HelpCircle, ArrowRight, Lightbulb, Sparkles, Keyboard, Scale } from 'lucide-react';
import { InteractiveBalance } from './InteractiveBalance';

export interface CompletionMeta {
  timeSpentSeconds: number;
  mistakesCount: number;
  errorTypes: ErrorType[];
}

interface StepByStepSolverProps {
  exercise: EquationExercise;
  onCompleted: (isFirstTry: boolean, meta?: CompletionMeta) => void;
  onNextExercise: () => void;
}

export const StepByStepSolver: React.FC<StepByStepSolverProps> = ({
  exercise,
  onCompleted,
  onNextExercise,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<DiagnosticFeedback | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [showBalanceScale, setShowBalanceScale] = useState(false);
  const [hadMistakeInCurrentExercise, setHadMistakeInCurrentExercise] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [completedStepsHistory, setCompletedStepsHistory] = useState<
    { instruction: string; result: string; explanation: string }[]
  >([]);
  const [errorTypes, setErrorTypes] = useState<ErrorType[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // Reset when exercise changes
    setCurrentStepIndex(0);
    setUserInput('');
    setFeedback(null);
    setShowHint(false);
    setHadMistakeInCurrentExercise(false);
    setIsFinished(false);
    setCompletedStepsHistory([]);
    setErrorTypes([]);
    startTimeRef.current = Date.now();
  }, [exercise.id]);

  const currentStep = exercise.steps[currentStepIndex];
  const totalSteps = exercise.steps.length;

  const handleCheckStep = () => {
    if (!userInput.trim() || !currentStep) return;

    // Determine current equation context
    const currentEqContext =
      completedStepsHistory.length > 0
        ? completedStepsHistory[completedStepsHistory.length - 1].result
        : exercise.rawEquation;

    const diag = diagnoseEquationStep(
      currentEqContext,
      userInput,
      exercise.solution,
      currentStep.expectedExpression
    );

    setFeedback(diag);

    if (diag.isCorrect) {
      soundEffects.playSuccess();
      const updatedHistory = [
        ...completedStepsHistory,
        {
          instruction: currentStep.instruction,
          result: diag.suggestedCorrection || userInput,
          explanation: diag.explanation,
        },
      ];
      setCompletedStepsHistory(updatedHistory);

      if (currentStepIndex + 1 >= totalSteps) {
        setIsFinished(true);
        soundEffects.playCelebration();
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
        const elapsedSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
        onCompleted(!hadMistakeInCurrentExercise, {
          timeSpentSeconds: elapsedSeconds,
          mistakesCount: errorTypes.length,
          errorTypes,
        });
      } else {
        setTimeout(() => {
          setCurrentStepIndex((prev) => prev + 1);
          setUserInput('');
          setFeedback(null);
          setShowHint(false);
          if (inputRef.current) inputRef.current.focus();
        }, 800);
      }
    } else {
      soundEffects.playGentleRetry();
      setHadMistakeInCurrentExercise(true);
      setErrorTypes((prev) => [...prev, diag.errorType || 'UNKNOWN']);
    }
  };

  const handleInsertChar = (char: string) => {
    setUserInput((prev) => prev + char);
  };

  const handleBackspace = () => {
    setUserInput((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setUserInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCheckStep();
    }
  };

  return (
    <div className="space-y-6">
      {/* Exercise Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
              Guia Pas a Pas
            </span>
            <span className="text-xs text-slate-500">
              Pas {Math.min(currentStepIndex + 1, totalSteps)} de {totalSteps}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBalanceScale((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-xs text-indigo-700 hover:text-indigo-900 border border-indigo-200 bg-indigo-50 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5" />
              {showBalanceScale ? 'Amagar balança' : 'Balança visual'}
            </button>

            <button
              onClick={() => setShowKeyboard((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 bg-slate-50 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
            >
              <Keyboard className="w-3.5 h-3.5" />
              {showKeyboard ? 'Amagar teclat' : 'Mostrar teclat'}
            </button>
          </div>
        </div>

        {/* Big formatted equation */}
        <div className="text-center py-4 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-xs text-slate-500 font-medium mb-1">Equació inicial:</p>
          <div className="font-bold text-slate-900 tracking-wide">
            <MathExpression expression={exercise.rawEquation} size="lg" />
          </div>
        </div>

        {/* Optional Visual Balance Toggle */}
        {showBalanceScale && (
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

        {/* Progress step dots */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {exercise.steps.map((_, idx) => (
            <div
              key={`dot-${idx}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx < currentStepIndex || isFinished
                  ? 'w-8 bg-emerald-500'
                  : idx === currentStepIndex
                  ? 'w-8 bg-indigo-600'
                  : 'w-2 bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* History of Completed Steps */}
      {completedStepsHistory.length > 0 && (
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 space-y-2">
          <h4 className="text-xs font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Passos completats amb la balança:
          </h4>
          <div className="divide-y divide-emerald-100/60">
            {completedStepsHistory.map((step, idx) => (
              <div key={`hist-${idx}`} className="py-2 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-600">{step.instruction}</p>
                  <p className="text-xs text-emerald-700 font-medium mt-0.5">{step.explanation}</p>
                </div>
                <span className="font-bold text-slate-900 bg-white px-2.5 py-1.5 rounded border border-emerald-200 shadow-2xs shrink-0">
                  <MathExpression expression={step.result} size="sm" />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Step Input or Victory Screen */}
      {!isFinished && currentStep ? (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-md mb-2 border border-indigo-100">
              <Scale className="w-3.5 h-3.5 text-indigo-600" />
              Metàfora de la balança: operem a cada membre de l'equació
            </div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-bold">
                {currentStepIndex + 1}
              </span>
              {currentStep.instruction}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Escriu com queda l'equació aplicant l'operació als dos membres de la balança i prem comprovar.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={currentStep.expectedExpression}
              className="flex-1 font-mono text-base px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 text-slate-900 placeholder:text-slate-400"
              autoFocus
            />
            <button
              onClick={handleCheckStep}
              disabled={!userInput.trim()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium text-sm rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Comprova el pas
            </button>
          </div>

          {/* Live vertical fraction preview when typing '/' */}
          {userInput.includes('/') && (
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
              <span className="font-medium shrink-0">Vista amb fraccions:</span>
              <MathExpression expression={userInput} size="sm" className="font-bold text-slate-900" />
            </div>
          )}

          {/* Feedback Card if error or success */}
          {feedback && (
            <div
              className={`p-4 rounded-xl border transition-all ${
                feedback.isCorrect
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-start gap-3">
                {feedback.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm">{feedback.title}</h4>
                  <p className="text-xs leading-relaxed">{feedback.explanation}</p>
                  {feedback.pedagogicalTip && (
                    <p className="text-xs font-medium text-slate-700 bg-white/70 p-2 rounded-md border border-slate-200/50 mt-2">
                      💡 {feedback.pedagogicalTip}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Hint button & toggle */}
          <div className="pt-1 flex items-center justify-between text-xs">
            <button
              onClick={() => setShowHint((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              {showHint ? 'Amagar pista' : 'Necessites una pista?'}
            </button>

            {showHint && (
              <span className="inline-flex items-center gap-1.5 text-indigo-700 font-medium bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                <span>Pista: hauries d'arribar a</span>
                <MathExpression expression={currentStep.expectedExpression} size="xs" className="font-bold" />
              </span>
            )}
          </div>

          {/* On-screen Math Keyboard */}
          {showKeyboard && (
            <div className="pt-2 border-t border-slate-100">
              <MathKeyboard
                onInsert={handleInsertChar}
                onBackspace={handleBackspace}
                onClear={handleClear}
                onSubmit={handleCheckStep}
                submitLabel="Comprova aquest pas"
              />
            </div>
          )}
        </div>
      ) : (
        /* Victory Screen */
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full text-emerald-600 mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-emerald-950">Molt bona feina! Equació resolta!</h3>
            <p className="text-xs text-emerald-800 mt-1">
              Has arribat a la solució pas a pas de forma clara i ordenada.
            </p>
          </div>

          <div className="inline-block bg-white px-5 py-3 rounded-xl border border-emerald-200 shadow-xs">
            <p className="text-xs text-slate-500 font-medium">Solució final:</p>
            <p className="font-mono text-2xl font-bold text-emerald-700 mt-0.5">
              x = {exercise.solution}
            </p>
          </div>

          <div className="text-left bg-white/80 p-4 rounded-xl border border-emerald-100 space-y-1.5 max-w-md mx-auto">
            <p className="text-xs font-semibold text-slate-800 flex items-center gap-1">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Comprovació de la solució:
            </p>
            <p className="text-xs text-slate-600 leading-relaxed flex flex-wrap items-center gap-1">
              <span>Si substituïm x = {exercise.solution} a l'equació original (</span>
              <MathExpression expression={exercise.rawEquation} size="xs" className="font-semibold text-slate-800" />
              <span>), es compleix exactament la igualtat a banda i banda. Així pots estar segur/a que el teu resultat és 100% correcte!</span>
            </p>
          </div>

          <div className="pt-2 flex justify-center">
            <button
              onClick={onNextExercise}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Següent exercici
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
