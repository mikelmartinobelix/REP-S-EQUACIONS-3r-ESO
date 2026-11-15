/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { WordProblem, ErrorType } from '../types/math';
import { soundEffects } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import { CheckCircle2, AlertCircle, ArrowRight, Lightbulb, Check } from 'lucide-react';
import { CompletionMeta } from './StepByStepSolver';

interface WordProblemsPracticeProps {
  problem: WordProblem;
  onCompleted: (isFirstTry: boolean, meta?: CompletionMeta) => void;
  onNextProblem: () => void;
}

export const WordProblemsPractice: React.FC<WordProblemsPracticeProps> = ({
  problem,
  onCompleted,
  onNextProblem,
}) => {
  // 4 steps in the word problem solver:
  // 1: Tria la incògnita
  // 2: Organitza les dades
  // 3: Planteja l'equació
  // 4: Resol i interpreta
  const [phase, setPhase] = useState<1 | 2 | 3 | 4>(1);
  const [selectedVarIndex, setSelectedVarIndex] = useState<number | null>(null);
  const [varFeedback, setVarFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  const [selectedEqIndex, setSelectedEqIndex] = useState<number | null>(null);
  const [eqFeedback, setEqFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  const [userXVal, setUserXVal] = useState<string>('');
  const [solutionFeedback, setSolutionFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [hadAnyError, setHadAnyError] = useState(false);
  const [errorTypes, setErrorTypes] = useState<ErrorType[]>([]);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    setPhase(1);
    setSelectedVarIndex(null);
    setVarFeedback(null);
    setSelectedEqIndex(null);
    setEqFeedback(null);
    setUserXVal('');
    setSolutionFeedback(null);
    setIsFinished(false);
    setHadAnyError(false);
    setErrorTypes([]);
    startTimeRef.current = Date.now();
  }, [problem.id]);

  const handleSelectVariable = (idx: number) => {
    setSelectedVarIndex(idx);
    const opt = problem.variableOptions[idx];
    if (opt.isCorrect) {
      soundEffects.playSuccess();
      setVarFeedback({
        isCorrect: true,
        text: 'Molt bé! Aquesta és la millor incògnita per resoldre el problema amb facilitat.',
      });
      setTimeout(() => {
        setPhase(2);
      }, 700);
    } else {
      soundEffects.playGentleRetry();
      setHadAnyError(true);
      setErrorTypes((prev) => [...prev, 'UNKNOWN']);
      setVarFeedback({
        isCorrect: false,
        text: 'Aquesta no és la incògnita principal. Pensa: Què és exactament el que ens pregunta el problema?',
      });
    }
  };

  const handleSelectEquation = (idx: number) => {
    setSelectedEqIndex(idx);
    const opt = problem.equationOptions[idx];
    if (opt.isCorrect) {
      soundEffects.playSuccess();
      setEqFeedback({
        isCorrect: true,
        text: 'Molt ben plantejat! L\'equació reflecteix fidelment la relació de l\'enunciat.',
      });
      setTimeout(() => {
        setPhase(4);
      }, 800);
    } else {
      soundEffects.playGentleRetry();
      setHadAnyError(true);
      setErrorTypes((prev) => [...prev, 'SYNTAX_OR_FORMAT']);
      setEqFeedback({
        isCorrect: false,
        text: opt.explanationIfWrong || 'Aquesta equació no és correcta per a aquest enunciat.',
      });
    }
  };

  const handleCheckSolution = () => {
    const val = parseFloat(userXVal.trim());
    if (isNaN(val)) return;

    if (Math.abs(val - problem.solutionX) < 0.001) {
      soundEffects.playCelebration();
      setSolutionFeedback({
        isCorrect: true,
        text: `Correcte! x = ${problem.solutionX}.`,
      });
      setIsFinished(true);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
      const elapsedSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
      onCompleted(!hadAnyError, {
        timeSpentSeconds: elapsedSeconds,
        mistakesCount: errorTypes.length,
        errorTypes,
      });
    } else {
      soundEffects.playGentleRetry();
      setHadAnyError(true);
      setErrorTypes((prev) => [...prev, 'ARITHMETIC_CALCULATION']);
      setSolutionFeedback({
        isCorrect: false,
        text: `Aquest valor de x no compleix l'equació ${problem.correctEquation}. Revisa els passos de resolució o comprova substituint.`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Problem Statement Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
            Problema d'Equació · 3r d'ESO
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Fase {phase} de 4
          </span>
        </div>

        <h2 className="text-lg font-bold text-slate-900">{problem.title}</h2>

        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-slate-800 text-sm leading-relaxed font-serif">
          "{problem.statement}"
        </div>

        {/* Phase Navigation Tabs */}
        <div className="grid grid-cols-4 gap-1.5 pt-2">
          {[
            { num: 1, label: '1. Incògnita' },
            { num: 2, label: '2. Dades' },
            { num: 3, label: '3. Plantejament' },
            { num: 4, label: '4. Resolució' },
          ].map((step) => (
            <div
              key={step.num}
              className={`py-1.5 px-1 text-center text-xs font-medium rounded-lg transition-colors ${
                phase === step.num
                  ? 'bg-indigo-600 text-white'
                  : phase > step.num
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {step.label}
            </div>
          ))}
        </div>
      </div>

      {/* PHASE 1: Triar la incògnita */}
      {phase === 1 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              {problem.variableQuestion}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              En tot problema, el primer pas és definir clarament què representa la lletra "x".
            </p>
          </div>

          <div className="space-y-2">
            {problem.variableOptions.map((opt, idx) => (
              <button
                key={`var-opt-${idx}`}
                onClick={() => handleSelectVariable(idx)}
                className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all cursor-pointer ${
                  selectedVarIndex === idx
                    ? opt.isCorrect
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-medium'
                      : 'border-rose-400 bg-rose-50 text-rose-950 font-medium'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{opt.label}</span>
                  {selectedVarIndex === idx && (
                    opt.isCorrect ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                    )
                  )}
                </div>
              </button>
            ))}
          </div>

          {varFeedback && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                varFeedback.isCorrect
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border border-rose-200'
              }`}
            >
              {varFeedback.isCorrect ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{varFeedback.text}</span>
            </div>
          )}
        </div>
      )}

      {/* PHASE 2: Expressar les dades */}
      {phase === 2 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                2
              </span>
              Traducció de l'enunciat a llenguatge algebraic
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Amb la incògnita ja definida ({problem.variableDefinition}), escrivim les dades en funció de x:
            </p>
          </div>

          <div className="divide-y divide-slate-100 bg-slate-50 rounded-xl p-3 border border-slate-100">
            {problem.dataExpressions.map((expr, i) => (
              <div key={`d-${i}`} className="py-2.5 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">{expr.label}:</span>
                <span className="font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                  {expr.expression}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-900">
            💡 <strong>Truc de 3r d'ESO:</strong> Fixa't com passem de paraules ("26 anys més", "el triple", etc.) a operacions (+26, 3x). Ara unim aquestes dades per formar la igualtat!
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setPhase(3)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer"
            >
              Continuar al plantejament
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* PHASE 3: Plantejar l'equació */}
      {phase === 3 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                3
              </span>
              {problem.equationQuestion}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Selecciona l'equació correcta que iguala les dades del problema:
            </p>
          </div>

          <div className="space-y-2">
            {problem.equationOptions.map((opt, idx) => (
              <button
                key={`eq-opt-${idx}`}
                onClick={() => handleSelectEquation(idx)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                  selectedEqIndex === idx
                    ? opt.isCorrect
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-medium'
                      : 'border-rose-400 bg-rose-50 text-rose-950 font-medium'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-base font-bold text-slate-900">{opt.equation}</span>
                  {selectedEqIndex === idx && (
                    opt.isCorrect ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                    )
                  )}
                </div>
              </button>
            ))}
          </div>

          {eqFeedback && (
            <div
              className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                eqFeedback.isCorrect
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border border-rose-200'
              }`}
            >
              {eqFeedback.isCorrect ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{eqFeedback.text}</span>
            </div>
          )}
        </div>
      )}

      {/* PHASE 4: Resolució de l'equació i resposta */}
      {phase === 4 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                4
              </span>
              Resol l'equació i dóna la resposta
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Equació plantejada: <strong className="font-mono text-slate-800">{problem.correctEquation}</strong>
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row items-center gap-3">
            <span className="text-sm font-medium text-slate-700">Quant val x?</span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="font-mono font-bold text-base text-slate-900">x =</span>
              <input
                type="number"
                value={userXVal}
                onChange={(e) => setUserXVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCheckSolution()}
                placeholder="Ex: 5"
                className="w-24 font-mono text-base px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
              />
              {problem.finalAnswerUnit && (
                <span className="text-xs text-slate-500 font-medium">{problem.finalAnswerUnit}</span>
              )}
            </div>
            <button
              onClick={handleCheckSolution}
              disabled={!userXVal.trim()}
              className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer"
            >
              Comprova la solució
            </button>
          </div>

          {solutionFeedback && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                solutionFeedback.isCorrect
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border border-rose-200'
              }`}
            >
              {solutionFeedback.isCorrect ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{solutionFeedback.text}</span>
            </div>
          )}

          {/* Step by step complete solution */}
          {isFinished && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-semibold text-sm">
                <Lightbulb className="w-4 h-4 text-emerald-700" />
                Resposta contextualitzada final:
              </div>
              <p className="text-xs text-emerald-800 font-medium">
                "{problem.finalAnswerText}"
              </p>

              <div className="pt-2 border-t border-emerald-200/60 text-xs text-slate-700 space-y-1">
                <span className="font-semibold block text-slate-800 mb-1">
                  Resolució completa detallada:
                </span>
                {problem.stepByStepSolution.map((s, idx) => (
                  <p key={`sol-step-${idx}`} className="leading-relaxed">
                    {s}
                  </p>
                ))}
              </div>

              <div className="pt-3 flex justify-center">
                <button
                  onClick={onNextProblem}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Següent problema
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
