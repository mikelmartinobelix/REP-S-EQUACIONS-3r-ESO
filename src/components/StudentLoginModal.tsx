/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StudentCourse, StudentGroup, StudentProfile } from '../types/student';
import { Users, User, ArrowRight, Lock, Eye, EyeOff, AlertCircle, GraduationCap } from 'lucide-react';

export const STUDENT_ACCESS_PASSWORD = 'Macitec3';

interface StudentLoginModalProps {
  isOpen: boolean;
  currentStudent: StudentProfile | null;
  hasAccessVerified?: boolean;
  isFullPageGate?: boolean;
  onSaveStudent: (name: string, course: StudentCourse, group: StudentGroup) => void;
  onClose: () => void;
  canCloseWithoutSaving?: boolean;
}

export const StudentLoginModal: React.FC<StudentLoginModalProps> = ({
  isOpen,
  currentStudent,
  hasAccessVerified = false,
  isFullPageGate = false,
  onSaveStudent,
  onClose,
  canCloseWithoutSaving = false,
}) => {
  const [name, setName] = useState(currentStudent?.name || '');
  const [course, setCourse] = useState<StudentCourse>(currentStudent?.course || '3r ESO');
  const [group, setGroup] = useState<StudentGroup>(
    currentStudent?.group === 'B' || currentStudent?.group === 'C' ? currentStudent.group : 'A'
  );
  const [password, setPassword] = useState(hasAccessVerified ? STUDENT_ACCESS_PASSWORD : '');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(currentStudent?.name || '');
      setCourse(currentStudent?.course || '3r ESO');
      setGroup(
        currentStudent?.group === 'B' || currentStudent?.group === 'C' ? currentStudent.group : 'A'
      );
      setPassword(hasAccessVerified ? STUDENT_ACCESS_PASSWORD : '');
      setPasswordError(false);
    }
  }, [isOpen, currentStudent, hasAccessVerified]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (!hasAccessVerified && password.trim() !== STUDENT_ACCESS_PASSWORD) {
      setPasswordError(true);
      return;
    }

    onSaveStudent(name.trim(), course, group);
  };

  const courses: { id: StudentCourse; label: string }[] = [
    { id: '1r ESO', label: '1r ESO' },
    { id: '2n ESO', label: '2n ESO' },
    { id: '3r ESO', label: '3r ESO' },
    { id: '4t ESO', label: '4t ESO' },
  ];

  const classes: { id: StudentGroup; label: string }[] = [
    { id: 'A', label: 'Classe A' },
    { id: 'B', label: 'Classe B' },
    { id: 'C', label: 'Classe C' },
  ];

  const cardContent = (
    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
      {/* Banner */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 text-white text-center">
        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md text-white flex items-center justify-center mx-auto mb-3 font-serif text-2xl font-bold border border-white/20">
          x
        </div>
        <h2 className="text-xl font-bold">Àlgebra Pas a Pas · ESO</h2>
        <p className="text-indigo-100 text-xs mt-1">
          {hasAccessVerified
            ? 'Actualitza el teu nom, curs o classe'
            : 'Introdueix la contrasenya, el teu nom, curs i classe per accedir'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {!hasAccessVerified && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-600" />
              Contrasenya d'accés
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(false);
                }}
                placeholder="Introdueix la contrasenya..."
                autoFocus
                className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border focus:outline-none focus:ring-2 text-slate-900 text-sm bg-slate-50 placeholder:text-slate-400 ${
                  passwordError
                    ? 'border-rose-400 focus:ring-rose-500'
                    : 'border-slate-300 focus:ring-indigo-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                aria-label={showPassword ? 'Amagar contrasenya' : 'Mostrar contrasenya'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordError && (
              <p className="text-xs text-rose-600 font-medium flex items-center gap-1 pt-0.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Contrasenya incorrecta. Demana-la al teu professor/a.
              </p>
            )}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-indigo-600" />
            Nom i cognoms de l'alumne/a
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Laia Garcia o Pau Soler"
            autoFocus={hasAccessVerified}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 text-sm bg-slate-50 placeholder:text-slate-400"
          />
        </div>

        {/* Course Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
            Tria el teu curs:
          </label>
          <div className="grid grid-cols-4 gap-2">
            {courses.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCourse(c.id)}
                className={`py-2.5 px-2 text-center rounded-xl border transition-all cursor-pointer ${
                  course === c.id
                    ? 'border-indigo-600 bg-indigo-50/80 ring-1 ring-indigo-500 text-indigo-900 font-bold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-medium'
                } text-xs`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Class Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            Tria la teva classe:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {classes.map((cls) => (
              <button
                key={cls.id}
                type="button"
                onClick={() => setGroup(cls.id)}
                className={`py-2.5 px-3 text-center rounded-xl border transition-all cursor-pointer ${
                  group === cls.id
                    ? 'border-indigo-600 bg-indigo-50/80 ring-1 ring-indigo-500 text-indigo-900 font-bold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-medium'
                } text-xs`}
              >
                {cls.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 flex items-center gap-2">
          {canCloseWithoutSaving && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              Cancel·lar
            </button>
          )}
          <button
            type="submit"
            disabled={!name.trim() || (!hasAccessVerified && !password.trim())}
            className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Entrar a practicar
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );

  if (isFullPageGate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50/40 to-slate-200 flex flex-col items-center justify-center p-4">
        {cardContent}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      {cardContent}
    </div>
  );
};
