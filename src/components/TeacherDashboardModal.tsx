/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StudentProfile, StudentGroup, FirebaseClientConfig } from '../types/student';
import { firebaseService, DEFAULT_FIREBASE_CONFIG } from '../services/firebaseService';
import {
  X,
  Lock,
  Download,
  Users,
  CheckCircle,
  TrendingUp,
  Cloud,
  Database,
  RefreshCw,
  Search,
  Key,
  Flame,
  AlertCircle,
  Check,
  ShieldAlert,
} from 'lucide-react';

interface TeacherDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeacherDashboardModal: React.FC<TeacherDashboardModalProps> = ({ isOpen, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<StudentGroup | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Tab: 'overview' | 'firebase'
  const [activeTab, setActiveTab] = useState<'overview' | 'firebase'>('overview');

  // Firebase config state - pre-filled with the user's project
  const [apiKey, setApiKey] = useState(DEFAULT_FIREBASE_CONFIG.apiKey);
  const [projectId, setProjectId] = useState(DEFAULT_FIREBASE_CONFIG.projectId);
  const [appId, setAppId] = useState(DEFAULT_FIREBASE_CONFIG.appId || '');
  const [authDomain, setAuthDomain] = useState(DEFAULT_FIREBASE_CONFIG.authDomain || '');
  const [firebaseStatusMessage, setFirebaseStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isTestingFirebase, setIsTestingFirebase] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadStudents();
      const stored = firebaseService.getStoredConfig();
      if (stored) {
        setApiKey(stored.apiKey || DEFAULT_FIREBASE_CONFIG.apiKey);
        setProjectId(stored.projectId || DEFAULT_FIREBASE_CONFIG.projectId);
        setAppId(stored.appId || DEFAULT_FIREBASE_CONFIG.appId || '');
        setAuthDomain(stored.authDomain || DEFAULT_FIREBASE_CONFIG.authDomain || '');
      }
    }
  }, [isOpen, selectedGroup]);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const data = await firebaseService.getStudents(selectedGroup);
      setStudents(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default PIN: 1234
    if (pinInput === '1234' || pinInput === 'fundacio') {
      setIsAuthenticated(true);
      setPinError(false);
      loadStudents();
    } else {
      setPinError(true);
    }
  };

  const handleExportCSV = () => {
    const csv = firebaseService.exportCSV(filteredStudents);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `participacio_algebra_3reso_${selectedGroup}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveFirebaseConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || !projectId.trim()) {
      setFirebaseStatusMessage({ type: 'error', text: 'Cal introduir com a mínim la Clau d\'API i el Project ID.' });
      return;
    }

    setIsTestingFirebase(true);
    setFirebaseStatusMessage(null);

    const config: FirebaseClientConfig = {
      apiKey: apiKey.trim(),
      projectId: projectId.trim(),
      appId: appId.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
    };

    const res = await firebaseService.testConnection(config);
    if (res.success) {
      firebaseService.initializeWithConfig(config);
      setFirebaseStatusMessage({ type: 'success', text: 'Connexió correcta! S\'ha enllaçat el teu projecte Firestore.' });
      loadStudents();
    } else {
      setFirebaseStatusMessage({ type: 'error', text: res.message });
    }
    setIsTestingFirebase(false);
  };

  if (!isOpen) return null;

  // Filter students by search
  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = selectedGroup === 'all' || s.group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const totalExercisesDone = filteredStudents.reduce((acc, s) => acc + s.totalSolved, 0);
  const totalCorrectFirst = filteredStudents.reduce((acc, s) => acc + s.correctFirstTry, 0);
  const averageAccuracy = totalExercisesDone > 0 ? Math.round((totalCorrectFirst / totalExercisesDone) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Header */}
        <div className="bg-slate-900 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-400/30">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">Panell de Seguiment del Docent</h2>
              <p className="text-xs text-slate-400">Control de participació d'alumnat per grups (A, B, C i Repàs)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PIN protection screen if not authenticated */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 text-center max-w-sm mx-auto my-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Accés exclusiu per al professorat</h3>
              <p className="text-xs text-slate-500 mt-1">
                Introdueix el codi PIN de seguretat per consultar les dades dels alumnes.
              </p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-3">
              <input
                type="password"
                maxLength={8}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="PIN (per defecte: 1234)"
                className="w-full text-center font-mono tracking-widest text-lg px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              {pinError && (
                <p className="text-xs text-rose-600 font-medium">
                  Codi PIN incorrecte. El PIN per defecte és 1234.
                </p>
              )}
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Entrar al Panell
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs & connection indicator */}
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'overview'
                      ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dades de Participació
                </button>
                <button
                  onClick={() => setActiveTab('firebase')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'firebase'
                      ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Database className="w-3.5 h-3.5 text-indigo-600" />
                  Connexió Firebase
                </button>
              </div>

              {/* Status pill */}
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full ${
                    firebaseService.getIsConnected()
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      firebaseService.getIsConnected() ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                  {firebaseService.getIsConnected() ? 'Firestore Actiu' : 'Emmagatzematge Local Actiu'}
                </span>
                <button
                  onClick={loadStudents}
                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  title="Actualitzar dades"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {activeTab === 'overview' ? (
                <>
                  {/* Group Filter Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        { id: 'all', label: 'Tots els grups' },
                        { id: 'A', label: 'Grup 3r A' },
                        { id: 'B', label: 'Grup 3r B' },
                        { id: 'C', label: 'Grup 3r C' },
                        { id: 'repas', label: 'Grup de Repàs' },
                      ].map((grp) => (
                        <button
                          key={grp.id}
                          onClick={() => setSelectedGroup(grp.id as StudentGroup | 'all')}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                            selectedGroup === grp.id
                              ? 'bg-indigo-600 text-white shadow-2xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {grp.label}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleExportCSV}
                      disabled={filteredStudents.length === 0}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Descarregar informe CSV
                    </button>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="text-slate-500 text-xs font-medium flex items-center gap-1.5 mb-1">
                        <Users className="w-3.5 h-3.5 text-indigo-600" />
                        Alumnes registrats
                      </div>
                      <div className="font-mono text-2xl font-bold text-slate-900">
                        {filteredStudents.length}
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="text-slate-500 text-xs font-medium flex items-center gap-1.5 mb-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        Exercicis resolts
                      </div>
                      <div className="font-mono text-2xl font-bold text-slate-900">
                        {totalExercisesDone}
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="text-slate-500 text-xs font-medium flex items-center gap-1.5 mb-1">
                        <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
                        Precisió mitjana
                      </div>
                      <div className="font-mono text-2xl font-bold text-slate-900">
                        {averageAccuracy}%
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="text-slate-500 text-xs font-medium flex items-center gap-1.5 mb-1">
                        <Flame className="w-3.5 h-3.5 text-amber-500" />
                        Mitjana / alumne
                      </div>
                      <div className="font-mono text-2xl font-bold text-slate-900">
                        {filteredStudents.length > 0
                          ? Math.round(totalExercisesDone / filteredStudents.length)
                          : 0}
                      </div>
                    </div>
                  </div>

                  {/* Search bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cerca per nom d'alumne/a..."
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-800"
                    />
                  </div>

                  {/* Students Table */}
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-700">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="py-2.5 px-4 font-semibold">Alumne/a</th>
                            <th className="py-2.5 px-3 font-semibold">Grup</th>
                            <th className="py-2.5 px-3 font-semibold text-center">Resolts</th>
                            <th className="py-2.5 px-3 font-semibold text-center">A la 1a</th>
                            <th className="py-2.5 px-3 font-semibold text-center">Precisió</th>
                            <th className="py-2.5 px-3 font-semibold text-center">Ratxa màx.</th>
                            <th className="py-2.5 px-4 font-semibold text-right">Darrer accés</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredStudents.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-8 text-center text-slate-400">
                                {students.length === 0
                                  ? 'Encara no hi ha dades de participació. Quan els alumnes entrin a practicar, apareixeran aquí en temps real.'
                                  : 'No s\'ha trobat cap alumne/a amb aquests filtres.'}
                              </td>
                            </tr>
                          ) : (
                            filteredStudents.map((st) => {
                              const acc =
                                st.totalSolved > 0
                                  ? Math.round((st.correctFirstTry / st.totalSolved) * 100)
                                  : 0;
                              return (
                                <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                                  <td className="py-3 px-4 font-bold text-slate-900">{st.name}</td>
                                  <td className="py-3 px-3">
                                    <span
                                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                                        st.group === 'repas'
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-indigo-100 text-indigo-800'
                                      }`}
                                    >
                                      {st.group === 'repas' ? 'Repàs' : `3r ${st.group}`}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3 text-center font-mono font-semibold">
                                    {st.totalSolved}
                                  </td>
                                  <td className="py-3 px-3 text-center font-mono text-emerald-700">
                                    {st.correctFirstTry}
                                  </td>
                                  <td className="py-3 px-3 text-center font-mono font-medium">
                                    {acc}%
                                  </td>
                                  <td className="py-3 px-3 text-center font-mono text-amber-600 font-bold">
                                    {st.bestStreak} 🔥
                                  </td>
                                  <td className="py-3 px-4 text-right text-slate-500 text-[11px]">
                                    {new Date(st.lastActive).toLocaleDateString('ca-ES', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                /* Tab: Firebase Connection Guide & Form */
                <div className="space-y-6 max-w-2xl">
                  <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-4 text-xs text-indigo-950 space-y-2">
                    <h3 className="font-bold flex items-center gap-1.5 text-sm text-indigo-900">
                      <Cloud className="w-4 h-4 text-indigo-600" />
                      Com connectar el teu projecte Firebase (Firestore) creat amb un altre compte
                    </h3>
                    <p className="leading-relaxed">
                      <strong>No cal pujar l'app a GitHub!</strong> Només cal enganxar les 2 o 3 claus públiques del teu projecte Firebase. L'aplicació sincronitzarà automàticament les dades de participació de cada alumne a la col·lecció <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-indigo-700">alumnat_3reso</code>.
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-700 pt-1">
                      <li>Entra a <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="underline font-medium text-indigo-700">console.firebase.google.com</a> amb el compte on has creat la base de dades.</li>
                      <li>Ves a <strong>Configuració del projecte (Project Settings ⚙️)</strong>.</li>
                      <li>A la pestanya <strong>General</strong>, baixa fins a <strong>Les teves aplicacions</strong> i afegeix o selecciona una aplicació <strong>Web (&lt;/&gt;)</strong>.</li>
                      <li>Copia el <strong>Project ID</strong> i la <strong>Clau d'API (apiKey)</strong> i enganxa'ls aquí sota:</li>
                    </ol>
                  </div>

                  <form onSubmit={handleSaveFirebaseConfig} className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Credencials del teu projecte Firebase
                    </h4>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Project ID *</label>
                      <input
                        type="text"
                        required
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        placeholder="Ex: algebra-3reso-llor"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                      />
                      <p className="text-[10px] text-slate-400">L'identificador del teu projecte (ex: nom-del-projecte-12345).</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Web API Key (apiKey) *</label>
                      <input
                        type="text"
                        required
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Ex: AIzaSyD..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">App ID (opcional)</label>
                        <input
                          type="text"
                          value={appId}
                          onChange={(e) => setAppId(e.target.value)}
                          placeholder="Ex: 1:123456789:web:abcdef"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Auth Domain (opcional)</label>
                        <input
                          type="text"
                          value={authDomain}
                          onChange={(e) => setAuthDomain(e.target.value)}
                          placeholder="Ex: projecte.firebaseapp.com"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                        />
                      </div>
                    </div>

                    {firebaseStatusMessage && (
                      <div
                        className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                          firebaseStatusMessage.type === 'success'
                            ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                            : 'bg-rose-50 text-rose-900 border border-rose-200'
                        }`}
                      >
                        {firebaseStatusMessage.type === 'success' ? (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                        <span>{firebaseStatusMessage.text}</span>
                      </div>
                    )}

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={isTestingFirebase}
                        className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        {isTestingFirebase ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Comprovant connexió...
                          </>
                        ) : (
                          <>
                            <Database className="w-3.5 h-3.5" />
                            Guardar i connectar amb Firestore
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Firestore Security Rules Reminder */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
                    <h5 className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-500" />
                      Regles de seguretat de Firestore (important a la consola de Firebase)
                    </h5>
                    <p className="text-slate-600 leading-relaxed">
                      A la consola de Firebase (pestanya <strong>Firestore Database &gt; Reglas / Rules</strong>), assegura't que la col·lecció <code className="font-mono font-bold text-indigo-700">alumnat_3reso</code> permet lectura i escriptura:
                    </p>
                    <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /alumnat_3reso/{studentId} {
      allow read, write: if true;
    }
  }
}`}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
