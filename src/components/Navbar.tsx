import React, { useState } from 'react';
import { Volume2, VolumeX, BookOpen, User, Share2, Check } from 'lucide-react';
import { EquationDifficulty } from '../types/math';
import { StudentCourse, StudentGroup } from '../types/student';

interface NavbarProps {
  currentTab: 'guided' | 'autonomous' | 'problems' | 'spot-error' | 'balance';
  onSelectTab: (tab: 'guided' | 'autonomous' | 'problems' | 'spot-error' | 'balance') => void;
  currentLevel: EquationDifficulty;
  onSelectLevel: (lvl: EquationDifficulty) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenCheatSheet: () => void;
  studentName?: string;
  studentCourse?: StudentCourse;
  studentGroup?: StudentGroup;
  onChangeStudent: () => void;
  streak: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentLevel,
  onSelectLevel,
  soundEnabled,
  onToggleSound,
  onOpenCheatSheet,
  studentName,
  studentCourse,
  studentGroup,
  onChangeStudent,
  streak,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const courseText = studentCourse || '3r ESO';
  const groupLabel = studentGroup === 'repas' ? `${courseText} · Repàs` : `${courseText} · ${studentGroup || 'A'}`;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-5xl mx-auto px-4 py-3">
        {/* Top brand line */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-serif text-lg font-bold shadow-xs">
              x
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-base leading-tight">
                Àlgebra Pas a Pas
              </h1>
              <p className="text-[11px] text-slate-500">
                Matemàtiques ESO · Catalunya
              </p>
            </div>
          </div>

          {/* Quick utility controls */}
          <div className="flex items-center gap-2">
            {/* Student badge */}
            {studentName ? (
              <button
                onClick={onChangeStudent}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                title="Canviar d'alumne/a o grup"
              >
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-semibold text-slate-900">{studentName}</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.2 rounded">
                  {groupLabel}
                </span>
              </button>
            ) : (
              <button
                onClick={onChangeStudent}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Identifica't</span>
              </button>
            )}

            {streak > 0 && (
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <span>🔥</span> {streak}
              </span>
            )}

            <button
              onClick={onOpenCheatSheet}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Obrir quadern de trucs i regles d'àlgebra"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Trucs</span>
            </button>

            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  const shareUrl = window.location.href.split('?')[0].split('#')[0];
                  navigator.clipboard.writeText(shareUrl);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2500);
                }
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
              title="Copiar enllaç per compartir l'aplicació amb l'alumnat"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Copiat!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Compartir</span>
                </>
              )}
            </button>

            <button
              onClick={onToggleSound}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title={soundEnabled ? 'Silenciar efectes de so' : 'Activar efectes de so'}
              aria-label="So"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-3 flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-xs font-medium border-t border-slate-100 pt-2">
          <button
            onClick={() => onSelectTab('guided')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              currentTab === 'guided'
                ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Guia Pas a Pas
          </button>

          <button
            onClick={() => onSelectTab('autonomous')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              currentTab === 'autonomous'
                ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Pissarra Autònoma
          </button>

          <button
            onClick={() => onSelectTab('problems')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              currentTab === 'problems'
                ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Problemes d'Equacions
          </button>

          <button
            onClick={() => onSelectTab('spot-error')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              currentTab === 'spot-error'
                ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            El Caçador d'Errors
          </button>

          <button
            onClick={() => onSelectTab('balance')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              currentTab === 'balance'
                ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            La Balança Visual
          </button>
        </div>
      </div>
    </header>
  );
};
