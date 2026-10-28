/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserStats, EquationDifficulty } from '../types/math';
import { Flame, Award, CheckCircle, RotateCcw, TrendingUp } from 'lucide-react';

interface StudentProgressCardProps {
  stats: UserStats;
  currentLevel: EquationDifficulty;
  onSelectLevel: (lvl: EquationDifficulty) => void;
  onResetStats: () => void;
}

export const StudentProgressCard: React.FC<StudentProgressCardProps> = ({
  stats,
  currentLevel,
  onSelectLevel,
  onResetStats,
}) => {
  const levels: { id: EquationDifficulty; label: string; desc: string }[] = [
    { id: 'nivell-1', label: 'Nivell 1', desc: 'Equacions bàsiques (ax + b = c)' },
    { id: 'nivell-2', label: 'Nivell 2', desc: 'Parèntesis i distributiva' },
    { id: 'nivell-3', label: 'Nivell 3', desc: 'Signes negatius davant de parèntesi' },
    { id: 'nivell-4', label: 'Nivell 4', desc: 'Denominadors senzills' },
    { id: 'problemes', label: 'Problemes', desc: 'Problemes d\'equacions de la vida real' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
          <div className="flex items-center justify-center gap-1 text-slate-500 text-xs mb-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Resolts
          </div>
          <div className="font-mono text-2xl font-bold text-slate-900">
            {stats.totalSolved}
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
          <div className="flex items-center justify-center gap-1 text-slate-500 text-xs mb-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            Ratxa actual
          </div>
          <div className="font-mono text-2xl font-bold text-amber-600">
            {stats.streak} 🔥
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
          <div className="flex items-center justify-center gap-1 text-slate-500 text-xs mb-1">
            <Award className="w-3.5 h-3.5 text-indigo-500" />
            Millor ratxa
          </div>
          <div className="font-mono text-2xl font-bold text-indigo-700">
            {stats.bestStreak}
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
          <div className="flex items-center justify-center gap-1 text-slate-500 text-xs mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-sky-500" />
            A la primera
          </div>
          <div className="font-mono text-2xl font-bold text-slate-900">
            {stats.totalSolved > 0
              ? `${Math.round((stats.correctFirstTry / stats.totalSolved) * 100)}%`
              : '0%'}
          </div>
        </div>
      </div>

      {/* Levels list */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Nivells i Progrés Adaptatiu
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {levels.map((lvl) => {
            const isCurrent = currentLevel === lvl.id;
            const mastery = stats.levelMastery[lvl.id] || 0;

            return (
              <button
                key={lvl.id}
                onClick={() => onSelectLevel(lvl.id)}
                className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'border-indigo-500 bg-indigo-50/40 ring-1 ring-indigo-400'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-slate-900">
                    {lvl.label}
                  </span>
                  <span className="text-[11px] font-mono text-indigo-600 font-bold">
                    {mastery}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1">{lvl.desc}</p>
                {/* Mastery progress bar */}
                <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${mastery}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset stats button */}
      <div className="pt-1 flex justify-end">
        <button
          onClick={onResetStats}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reiniciar el meu progrés
        </button>
      </div>
    </div>
  );
};
