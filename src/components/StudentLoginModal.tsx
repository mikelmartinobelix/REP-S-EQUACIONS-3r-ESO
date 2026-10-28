/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StudentGroup, StudentProfile } from '../types/student';
import { Users, User, ArrowRight, Sparkles } from 'lucide-react';

interface StudentLoginModalProps {
  isOpen: boolean;
  currentStudent: StudentProfile | null;
  onSaveStudent: (name: string, group: StudentGroup) => void;
  onClose: () => void;
  canCloseWithoutSaving?: boolean;
}

export const StudentLoginModal: React.FC<StudentLoginModalProps> = ({
  isOpen,
  currentStudent,
  onSaveStudent,
  onClose,
  canCloseWithoutSaving = false,
}) => {
  const [name, setName] = useState(currentStudent?.name || '');
  const [group, setGroup] = useState<StudentGroup>(currentStudent?.group || 'A');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSaveStudent(name.trim(), group);
  };

  const groups: { id: StudentGroup; label: string; desc: string }[] = [
    { id: 'A', label: 'Grup 3r A', desc: 'Matemàtiques 3r d\'ESO A' },
    { id: 'B', label: 'Grup 3r B', desc: 'Matemàtiques 3r d\'ESO B' },
    { id: 'C', label: 'Grup 3r C', desc: 'Matemàtiques 3r d\'ESO C' },
    { id: 'repas', label: 'Grup de Repàs', desc: 'Reforç i suport de matemàtiques' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 text-white text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md text-white flex items-center justify-center mx-auto mb-3 font-serif text-2xl font-bold border border-white/20">
            x
          </div>
          <h2 className="text-xl font-bold">Benvingut/da a Àlgebra Pas a Pas!</h2>
          <p className="text-indigo-100 text-xs mt-1">
            Introdueix el teu nom i tria el teu grup per començar a practicar
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              Com et dius?
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Laia Garcia o Pau Soler"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 text-sm bg-slate-50 placeholder:text-slate-400"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              Tria el teu grup de classe:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {groups.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGroup(g.id)}
                  className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                    group === g.id
                      ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-500'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span className={`block text-xs font-bold ${group === g.id ? 'text-indigo-900' : 'text-slate-800'}`}>
                    {g.label}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5 line-clamp-1">
                    {g.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            {canCloseWithoutSaving && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
              >
                Cancel·lar
              </button>
            )}
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Començar a practicar
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
