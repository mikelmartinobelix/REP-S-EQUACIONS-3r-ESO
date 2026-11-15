/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { SpotTheErrorExercise, ErrorType } from '../types/math';
import { MathExpression } from './MathExpression';
import { soundEffects } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import { CheckCircle2, AlertCircle, HelpCircle, ArrowRight, Lightbulb, Search } from 'lucide-react';
import { CompletionMeta } from './StepByStepSolver';

interface SpotTheErrorPracticeProps {
  exercise: SpotTheErrorExercise;
  onCompleted: (isFirstTry: boolean, meta?: CompletionMeta) => void;
  onNextExercise: () => void;
}

export const SpotTheErrorPractice: React.FC<SpotTheErrorPracticeProps> = ({
  exercise,
  onCompleted,
  onNextExercise,
}) => {
  const [selectedLineIndex, setSelectedLineIndex] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [hadMistake, setHadMistake] = useState(false);
  const [errorTypes, setErrorTypes] = useState<ErrorType[]>([]);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    setSelectedLineIndex(null);
    setShowHint(false);
    setHadMistake(false);
    setErrorTypes([]);
    startTimeRef.current = Date.now();
  }, [exercise.id]);

  const handleSelectLine = (index: number) => {
    setSelectedLineIndex(index);

    const line = exercise.lines[index];
    if (line.isError) {
      soundEffects.playCelebration();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      const elapsedSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
      onCompleted(!hadMistake, {
        timeSpentSeconds: elapsedSeconds,
        mistakesCount: errorTypes.length,
        errorTypes,
      });
    } else {
      soundEffects.playGentleRetry();
      setHadMistake(true);
      setErrorTypes((prev) => [...prev, 'UNKNOWN']);
    }
  };

  const selectedLine = selectedLineIndex !== null ? exercise.lines[selectedLineIndex] : null;
  const isFound = selectedLine?.isError === true;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" />
            El Caçador d'Errors
          </span>
          <span className="text-xs text-slate-500">
            Exercici resolt per l'alumne/a <strong>{exercise.studentName}</strong>
          </span>
        </div>

        <h2 className="text-base font-bold text-slate-900">{exercise.title}</h2>
        <p className="text-xs text-slate-600">
          En/na {exercise.studentName} ha intentat resoldre aquesta equació, però ha comès un error típic d'àlgebra. Fes clic sobre la línia exacta on s'ha equivocat:
        </p>

        {/* Big original equation display */}
        <div className="text-center py-3 bg-slate-50 rounded-xl border border-slate-100 font-bold text-slate-900">
          <MathExpression expression={exercise.equation} size="lg" />
        </div>
      </div>

      {/* Lines of resolution */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="space-y-2">
          {exercise.lines.map((line, idx) => {
            const isSelected = selectedLineIndex === idx;
            let lineClass = 'border-slate-200 bg-white hover:border-slate-300';

            if (isSelected) {
              if (line.isError) {
                lineClass = 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-400';
              } else {
                lineClass = 'border-amber-400 bg-amber-50/50';
              }
            }

            return (
              <button
                key={`line-${idx}`}
                onClick={() => handleSelectLine(idx)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${lineClass}`}
              >
                <span className="font-mono text-base font-semibold text-slate-800 flex items-center gap-2">
                  {(() => {
                    const match = line.text.match(/^(Pas \d+:\s*)(.+)$/);
                    if (match) {
                      return (
                        <>
                          <span className="text-slate-500 font-sans text-xs font-semibold uppercase tracking-wide">
                            {match[1].trim()}
                          </span>
                          <MathExpression expression={match[2]} size="md" />
                        </>
                      );
                    }
                    return <MathExpression expression={line.text} size="md" />;
                  })()}
                </span>

                {isSelected && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded">
                    {line.isError ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        L'error és aquí!
                      </span>
                    ) : (
                      <span className="text-amber-700 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        Aquest pas és correcte
                      </span>
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Hint toggle */}
        <div className="pt-2 flex items-center justify-between text-xs">
          <button
            onClick={() => setShowHint((prev) => !prev)}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            {showHint ? 'Amagar pista' : 'Necessites una pista?'}
          </button>

          {showHint && (
            <span className="text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100">
              💡 {exercise.hint}
            </span>
          )}
        </div>
      </div>

      {/* Explanation Banner when found */}
      {isFound && selectedLine && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-emerald-950">
                Molt ben caçat! Error trobat: {selectedLine.errorName}
              </h3>
              <p className="text-xs text-emerald-900 leading-relaxed">
                {selectedLine.errorExplanation}
              </p>
            </div>
          </div>

          {selectedLine.correctVersion && (
            <div className="p-3 bg-white rounded-lg border border-emerald-200/80 text-xs">
              <span className="font-medium text-slate-600 block">Com hauria d'haver estat la línia correcta:</span>
              <div className="font-bold text-indigo-700 mt-1">
                <MathExpression expression={selectedLine.correctVersion} size="md" />
              </div>
            </div>
          )}

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Lliçó per recordar:</strong> {exercise.takeaway}
            </div>
          </div>

          <div className="pt-2 flex justify-center">
            <button
              onClick={onNextExercise}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Següent caça d'errors
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
