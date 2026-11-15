/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  EquationDifficulty,
  EquationExercise,
  UserStats,
  WordProblem,
  SpotTheErrorExercise,
} from './types/math';
import { StudentProfile, StudentGroup } from './types/student';
import {
  CURRICULUM_EQUATIONS,
  generateRandomEquation,
} from './utils/algebraEngine';
import { WORD_PROBLEMS } from './data/problemsBank';
import { SPOT_THE_ERROR_EXERCISES } from './data/spotTheErrorBank';
import { Navbar } from './components/Navbar';
import { StepByStepSolver, CompletionMeta } from './components/StepByStepSolver';
import { AutonomousPractice } from './components/AutonomousPractice';
import { WordProblemsPractice } from './components/WordProblemsPractice';
import { SpotTheErrorPractice } from './components/SpotTheErrorPractice';
import { InteractiveBalance } from './components/InteractiveBalance';
import { StudentProgressCard } from './components/StudentProgressCard';
import { CheatSheetModal } from './components/CheatSheetModal';
import { StudentLoginModal } from './components/StudentLoginModal';
import { TeacherDashboardModal } from './components/TeacherDashboardModal';
import { firebaseService } from './services/firebaseService';
import { soundEffects } from './utils/soundEffects';
import { Sparkles, RefreshCw, Layers } from 'lucide-react';

const STATS_STORAGE_KEY = 'algebra_3reso_stats_v1';
const CURRENT_STUDENT_STORAGE_KEY = 'algebra_3reso_current_student';

const DEFAULT_STATS: UserStats = {
  totalSolved: 0,
  correctFirstTry: 0,
  streak: 0,
  bestStreak: 0,
  levelMastery: {
    'nivell-1': 10,
    'nivell-2': 0,
    'nivell-3': 0,
    'nivell-4': 0,
    problemes: 0,
  },
  completedExerciseIds: [],
  commonErrorsCount: {
    SIGN_TRANSPOSITION: 0,
    ADD_SUBTRACT_INSTEAD_OF_DIVIDE: 0,
    COEFFICIENT_SIGN_ON_DIVISION: 0,
    DISTRIBUTIVE_UNMULTIPLIED_CONSTANT: 0,
    MINUS_BEFORE_PARENTHESIS: 0,
    DENOMINATOR_MULTIPLY_OMISSION: 0,
    LIKE_TERMS_REDUCTION: 0,
    ARITHMETIC_CALCULATION: 0,
    COMBINING_X_AND_NUMBERS: 0,
    INVERTED_FRACTION: 0,
    SYNTAX_OR_FORMAT: 0,
    UNKNOWN: 0,
  },
  soundEnabled: true,
};

export default function App() {
  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem(STATS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_STATS;
  });

  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_STUDENT_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [isStudentLoginOpen, setIsStudentLoginOpen] = useState(false);
  const [isTeacherDashboardOpen, setIsTeacherDashboardOpen] = useState(false);
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);

  const [currentTab, setCurrentTab] = useState<
    'guided' | 'autonomous' | 'problems' | 'spot-error' | 'balance'
  >('guided');
  const [currentLevel, setCurrentLevel] = useState<EquationDifficulty>('nivell-1');

  // Exercise pointers
  const [equationIndex, setEquationIndex] = useState(0);
  const [currentEquation, setCurrentEquation] = useState<EquationExercise>(
    CURRICULUM_EQUATIONS['nivell-1'][0]
  );

  const [problemIndex, setProblemIndex] = useState(0);
  const [currentProblem, setCurrentProblem] = useState<WordProblem>(WORD_PROBLEMS[0]);

  const [spotIndex, setSpotIndex] = useState(0);
  const [currentSpot, setCurrentSpot] = useState<SpotTheErrorExercise>(
    SPOT_THE_ERROR_EXERCISES[0]
  );

  // Recommendation message if student is progressing
  const [recommendation, setRecommendation] = useState<string | null>(null);

  // Check if first-time student prompt needed
  useEffect(() => {
    if (!currentStudent) {
      setIsStudentLoginOpen(true);
    }
  }, []);

  // Sync stats to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch {}
    soundEffects.enabled = stats.soundEnabled;
  }, [stats]);

  // Update current equation when level changes
  useEffect(() => {
    if (currentLevel !== 'problemes') {
      const pool = CURRICULUM_EQUATIONS[currentLevel];
      if (pool && pool.length > 0) {
        setCurrentEquation(pool[0]);
        setEquationIndex(0);
      }
    }
  }, [currentLevel]);

  const handleSaveStudent = (name: string, group: StudentGroup) => {
    const studentId = currentStudent?.id || `student-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const nowStr = new Date().toISOString();

    const profile: StudentProfile = {
      id: studentId,
      name,
      group,
      createdAt: currentStudent?.createdAt || nowStr,
      lastActive: nowStr,
      totalSolved: currentStudent?.totalSolved || stats.totalSolved,
      correctFirstTry: currentStudent?.correctFirstTry || stats.correctFirstTry,
      streak: stats.streak,
      bestStreak: Math.max(stats.bestStreak, currentStudent?.bestStreak || 0),
      levelMastery: stats.levelMastery,
      commonMistakes: stats.commonErrorsCount,
      sessions: currentStudent?.sessions || [],
    };

    setCurrentStudent(profile);
    localStorage.setItem(CURRENT_STUDENT_STORAGE_KEY, JSON.stringify(profile));
    firebaseService.syncStudentProfile(profile);
    setIsStudentLoginOpen(false);
  };

  const handleNextEquation = () => {
    if (currentLevel === 'problemes') return;
    const pool = CURRICULUM_EQUATIONS[currentLevel];
    const nextIdx = equationIndex + 1;
    if (nextIdx < pool.length) {
      setEquationIndex(nextIdx);
      setCurrentEquation(pool[nextIdx]);
    } else {
      // Generate endless randomized variations with balance metaphor
      const randEq = generateRandomEquation(currentLevel);
      setCurrentEquation(randEq);
      setEquationIndex((prev) => prev + 1);
    }
  };

  const handleNextProblem = () => {
    const nextIdx = (problemIndex + 1) % WORD_PROBLEMS.length;
    setProblemIndex(nextIdx);
    setCurrentProblem(WORD_PROBLEMS[nextIdx]);
  };

  const handleNextSpotExercise = () => {
    const nextIdx = (spotIndex + 1) % SPOT_THE_ERROR_EXERCISES.length;
    setSpotIndex(nextIdx);
    setCurrentSpot(SPOT_THE_ERROR_EXERCISES[nextIdx]);
  };

  const handleRecordCompletion = (
    isFirstTry: boolean,
    levelKey: EquationDifficulty,
    meta?: CompletionMeta,
    explicitExerciseId?: string
  ) => {
    const newStreak = stats.streak + 1;
    const newBest = Math.max(newStreak, stats.bestStreak);
    const prevMastery = stats.levelMastery[levelKey] || 0;
    const masteryGain = isFirstTry ? 15 : 8;
    const newMastery = Math.min(100, prevMastery + masteryGain);

    const recordedErrors = meta?.errorTypes || [];
    const updatedErrorsCount = { ...stats.commonErrorsCount };
    recordedErrors.forEach((errKey) => {
      updatedErrorsCount[errKey] = (updatedErrorsCount[errKey] || 0) + 1;
    });

    const updatedStats: UserStats = {
      ...stats,
      totalSolved: stats.totalSolved + 1,
      correctFirstTry: stats.correctFirstTry + (isFirstTry ? 1 : 0),
      streak: newStreak,
      bestStreak: newBest,
      levelMastery: {
        ...stats.levelMastery,
        [levelKey]: newMastery,
      },
      commonErrorsCount: updatedErrorsCount,
    };
    setStats(updatedStats);

    // Sync student profile and Firebase tracking
    if (currentStudent) {
      const nowStr = new Date().toISOString();
      const updatedStudentMistakes = { ...(currentStudent.commonMistakes || {}) };
      recordedErrors.forEach((errKey) => {
        updatedStudentMistakes[errKey] = (updatedStudentMistakes[errKey] || 0) + 1;
      });

      const updatedStudent: StudentProfile = {
        ...currentStudent,
        lastActive: nowStr,
        totalSolved: updatedStats.totalSolved,
        correctFirstTry: updatedStats.correctFirstTry,
        streak: newStreak,
        bestStreak: newBest,
        levelMastery: updatedStats.levelMastery,
        commonMistakes: updatedStudentMistakes,
        sessions: [
          ...(currentStudent.sessions || []),
          {
            exerciseId: explicitExerciseId || currentEquation.id,
            level: levelKey,
            timestamp: nowStr,
            isFirstTry,
            mistakesCount: meta?.mistakesCount ?? (isFirstTry ? 0 : 1),
            timeSpentSeconds: meta?.timeSpentSeconds,
            errorTypes: recordedErrors,
          },
        ],
      };
      setCurrentStudent(updatedStudent);
      localStorage.setItem(CURRENT_STUDENT_STORAGE_KEY, JSON.stringify(updatedStudent));
      firebaseService.syncStudentProfile(updatedStudent);
    }

    // Check for level up recommendation
    if (stats.streak >= 2 && currentLevel === 'nivell-1') {
      setRecommendation(
        'Fantàstic! Ja domines les equacions bàsiques amb la balança. Vols provar el Nivell 2 amb parèntesis?'
      );
    } else if (stats.streak >= 4 && currentLevel === 'nivell-2') {
      setRecommendation(
        'Molt bona ratxa! Estàs preparat/da per als problemes de la vida real o el nivell 3.'
      );
    }
  };

  const handleToggleSound = () => {
    setStats((prev) => {
      const nextSound = !prev.soundEnabled;
      soundEffects.enabled = nextSound;
      return { ...prev, soundEnabled: nextSound };
    });
  };

  const handleResetStats = () => {
    if (window.confirm('Vols reiniciar les teves estadístiques i començar de nou?')) {
      setStats(DEFAULT_STATS);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-800 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setRecommendation(null);
        }}
        currentLevel={currentLevel}
        onSelectLevel={setCurrentLevel}
        soundEnabled={stats.soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenCheatSheet={() => setIsCheatSheetOpen(true)}
        onOpenTeacherDashboard={() => setIsTeacherDashboardOpen(true)}
        studentName={currentStudent?.name}
        studentGroup={currentStudent?.group}
        onChangeStudent={() => setIsStudentLoginOpen(true)}
        streak={stats.streak}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Adaptive encouragement banner if applicable */}
        {recommendation && (
          <div className="bg-gradient-to-r from-indigo-50 to-emerald-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
              <p className="text-xs sm:text-sm font-medium text-slate-800">
                {recommendation}
              </p>
            </div>
            <button
              onClick={() => {
                if (currentLevel === 'nivell-1') setCurrentLevel('nivell-2');
                else if (currentLevel === 'nivell-2') setCurrentTab('problems');
                setRecommendation(null);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shrink-0 transition-colors cursor-pointer"
            >
              Provar repte superior
            </button>
          </div>
        )}

        {/* Level selector tabs (when in Guided or Autonomous mode) */}
        {(currentTab === 'guided' || currentTab === 'autonomous') && (
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Layers className="w-4 h-4 text-indigo-600" />
              Nivell de dificultat:
            </div>

            <div className="flex flex-wrap items-center gap-1">
              {[
                { id: 'nivell-1', label: '1. Bàsiques' },
                { id: 'nivell-2', label: '2. Parèntesis' },
                { id: 'nivell-3', label: '3. Signes negatius' },
                { id: 'nivell-4', label: '4. Denominadors' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => setCurrentLevel(lvl.id as EquationDifficulty)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    currentLevel === lvl.id
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleNextEquation}
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors ml-auto sm:ml-0 cursor-pointer"
              title="Canviar d'exercici"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Canviar equació
            </button>
          </div>
        )}

        {/* Tab 1: Guia Pas a Pas */}
        {currentTab === 'guided' && (
          <StepByStepSolver
            exercise={currentEquation}
            onCompleted={(isFirstTry, meta) =>
              handleRecordCompletion(isFirstTry, currentLevel, meta, currentEquation.id)
            }
            onNextExercise={handleNextEquation}
          />
        )}

        {/* Tab 2: Pissarra Autònoma */}
        {currentTab === 'autonomous' && (
          <AutonomousPractice
            exercise={currentEquation}
            onCompleted={(isFirstTry, meta) =>
              handleRecordCompletion(isFirstTry, currentLevel, meta, currentEquation.id)
            }
            onNextExercise={handleNextEquation}
          />
        )}

        {/* Tab 3: Problemes d'Equacions */}
        {currentTab === 'problems' && (
          <WordProblemsPractice
            problem={currentProblem}
            onCompleted={(isFirstTry, meta) =>
              handleRecordCompletion(isFirstTry, 'problemes', meta, currentProblem.id)
            }
            onNextProblem={handleNextProblem}
          />
        )}

        {/* Tab 4: El Caçador d'Errors */}
        {currentTab === 'spot-error' && (
          <SpotTheErrorPractice
            exercise={currentSpot}
            onCompleted={(isFirstTry, meta) =>
              handleRecordCompletion(isFirstTry, 'nivell-2', meta, currentSpot.id)
            }
            onNextExercise={handleNextSpotExercise}
          />
        )}

        {/* Tab 5: La Balança Interactiva */}
        {currentTab === 'balance' && (
          <div className="space-y-4">
            <InteractiveBalance
              initialLeftX={3}
              initialLeftConst={4}
              initialRightX={1}
              initialRightConst={10}
              equationString="3x + 4 = x + 10"
            />
            <div className="bg-white border border-slate-200 rounded-xl p-5 text-xs text-slate-600 space-y-2">
              <h4 className="font-bold text-slate-800 text-sm">
                Per què fem servir la balança a 3r d'ESO?
              </h4>
              <p className="leading-relaxed">
                Quan diem "el +4 passa a l'altre costat com -4", el que estem fent en realitat és <strong>restar 4 a ambdós plats de la balança</strong> perquè no es desequilibri.
              </p>
              <p className="leading-relaxed">
                Experimenta amb els botons de dalt per veure com l'equació es va simplificant fins que al plat esquerre només queda una sola caixa [x], revelant directament el seu valor.
              </p>
            </div>
          </div>
        )}

        {/* Progress & Mastery Card */}
        <StudentProgressCard
          stats={stats}
          currentLevel={currentLevel}
          onSelectLevel={(lvl) => {
            if (lvl === 'problemes') {
              setCurrentTab('problems');
            } else {
              setCurrentLevel(lvl);
              if (currentTab !== 'guided' && currentTab !== 'autonomous') {
                setCurrentTab('guided');
              }
            }
          }}
          onResetStats={handleResetStats}
        />
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>Àlgebra Pas a Pas · Matemàtiques 3r d'ESO (Catalunya)</span>
          <button
            onClick={() => setIsTeacherDashboardOpen(true)}
            className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1 cursor-pointer"
          >
            Accés Panell Docent
          </button>
        </div>
      </footer>

      {/* Modals */}
      <CheatSheetModal
        isOpen={isCheatSheetOpen}
        onClose={() => setIsCheatSheetOpen(false)}
      />

      <StudentLoginModal
        isOpen={isStudentLoginOpen}
        currentStudent={currentStudent}
        onSaveStudent={handleSaveStudent}
        onClose={() => setIsStudentLoginOpen(false)}
        canCloseWithoutSaving={currentStudent !== null}
      />

      <TeacherDashboardModal
        isOpen={isTeacherDashboardOpen}
        onClose={() => setIsTeacherDashboardOpen(false)}
      />
    </div>
  );
}
