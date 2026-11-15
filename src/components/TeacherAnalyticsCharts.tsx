/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { StudentProfile } from '../types/student';
import { Clock, AlertTriangle, TrendingUp, User } from 'lucide-react';

interface TeacherAnalyticsChartsProps {
  students: StudentProfile[];
  selectedStudentId: string;
  onSelectStudentId: (id: string) => void;
}

const ERROR_LABELS: Record<string, string> = {
  SIGN_TRANSPOSITION: 'Signe / Balança',
  ADD_SUBTRACT_INSTEAD_OF_DIVIDE: 'Restar en lloc de dividir',
  COEFFICIENT_SIGN_ON_DIVISION: 'Signe en divisió negativa',
  DISTRIBUTIVE_UNMULTIPLIED_CONSTANT: 'Distributiva incompleta',
  MINUS_BEFORE_PARENTHESIS: 'Menys davant parèntesi',
  DENOMINATOR_MULTIPLY_OMISSION: 'Omissió de denominador',
  LIKE_TERMS_REDUCTION: 'Reducció de termes',
  ARITHMETIC_CALCULATION: 'Càlcul aritmètic',
  COMBINING_X_AND_NUMBERS: 'Sumar x amb nombres',
  INVERTED_FRACTION: 'Fracció invertida',
  SYNTAX_OR_FORMAT: 'Plantejament / Format',
  UNKNOWN: 'Altres errors',
};

const ERROR_COLORS = [
  '#e11d48',
  '#f59e0b',
  '#6366f1',
  '#ec4899',
  '#0ea5e9',
  '#8b5cf6',
  '#14b8a6',
];

function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 60) return `${Math.round(totalSeconds)}s`;
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.round(totalSeconds % 60);
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

interface SessionChartPoint {
  name: string;
  tempsSegons: number;
  errors: number;
  level?: string;
  dateLabel?: string;
  participants?: number;
}

export const TeacherAnalyticsCharts: React.FC<TeacherAnalyticsChartsProps> = ({
  students,
  selectedStudentId,
  onSelectStudentId,
}) => {
  const targetStudents = useMemo(() => {
    if (selectedStudentId === 'all') return students;
    const found = students.find((s) => s.id === selectedStudentId);
    return found ? [found] : students;
  }, [students, selectedStudentId]);

  const isSingleStudent = selectedStudentId !== 'all' && targetStudents.length === 1;
  const activeStudent = isSingleStudent ? targetStudents[0] : null;

  // Build session evolution data
  const { sessionSeries, totalSeconds, avgSeconds, totalErrors } = useMemo<{
    sessionSeries: SessionChartPoint[];
    totalSeconds: number;
    avgSeconds: number;
    totalErrors: number;
  }>(() => {
    let sumSeconds = 0;
    let sumErrors = 0;
    let sessionCount = 0;

    if (isSingleStudent && activeStudent) {
      const sorted = [...(activeStudent.sessions || [])].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      const series: SessionChartPoint[] = sorted.map((ses, idx) => {
        const secs = ses.timeSpentSeconds ?? 0;
        const errs = ses.mistakesCount ?? 0;
        sumSeconds += secs;
        sumErrors += errs;
        sessionCount += 1;
        return {
          name: `S${idx + 1}`,
          tempsSegons: secs,
          errors: errs,
          level: ses.level,
          dateLabel: new Date(ses.timestamp).toLocaleDateString('ca-ES', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
      });

      return {
        sessionSeries: series,
        totalSeconds: sumSeconds,
        avgSeconds: sessionCount > 0 ? Math.round(sumSeconds / sessionCount) : 0,
        totalErrors: sumErrors,
      };
    }

    // Aggregate across filtered students by session index (S1, S2, S3...)
    const buckets: Record<number, { timeSum: number; errSum: number; count: number }> = {};

    targetStudents.forEach((st) => {
      const sorted = [...(st.sessions || [])].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      sorted.forEach((ses, idx) => {
        const secs = ses.timeSpentSeconds ?? 0;
        const errs = ses.mistakesCount ?? 0;
        sumSeconds += secs;
        sumErrors += errs;
        sessionCount += 1;
        if (!buckets[idx]) {
          buckets[idx] = { timeSum: 0, errSum: 0, count: 0 };
        }
        buckets[idx].timeSum += secs;
        buckets[idx].errSum += errs;
        buckets[idx].count += 1;
      });
    });

    const indices = Object.keys(buckets)
      .map(Number)
      .sort((a, b) => a - b);

    const series = indices.map((idx) => {
      const b = buckets[idx];
      return {
        name: `S${idx + 1}`,
        tempsSegons: Math.round(b.timeSum / b.count),
        errors: Number((b.errSum / b.count).toFixed(1)),
        participants: b.count,
      };
    });

    return {
      sessionSeries: series,
      totalSeconds: sumSeconds,
      avgSeconds: sessionCount > 0 ? Math.round(sumSeconds / sessionCount) : 0,
      totalErrors: sumErrors,
    };
  }, [targetStudents, isSingleStudent, activeStudent]);

  // Build common errors breakdown
  const errorBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};

    targetStudents.forEach((st) => {
      if (st.commonMistakes) {
        Object.entries(st.commonMistakes).forEach(([key, val]) => {
          if (val > 0) {
            counts[key] = (counts[key] || 0) + val;
          }
        });
      }
    });

    return Object.entries(counts)
      .map(([key, count]) => ({
        key,
        label: ERROR_LABELS[key] || key,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);
  }, [targetStudents]);

  if (students.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4">
      {/* Header & Student Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            Evolució del temps i errors per sessió
          </h3>
          <p className="text-xs text-slate-500">
            Analitza la dedicació temporal i els errors més freqüents al llarg de les sessions de pràctica.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={selectedStudentId}
            onChange={(e) => onSelectStudentId(e.target.value)}
            className="text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">Tots els alumnes filtrats ({students.length})</option>
            {students.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name} ({st.group === 'repas' ? 'Repàs' : `3r ${st.group}`})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Time & Error KPIs */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white border border-slate-200 rounded-lg px-3 py-2.5">
          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            Temps total registrat
          </div>
          <div className="font-mono text-base sm:text-lg font-bold text-slate-900 mt-0.5">
            {formatDuration(totalSeconds)}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg px-3 py-2.5">
          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            Mitjana / exercici
          </div>
          <div className="font-mono text-base sm:text-lg font-bold text-slate-900 mt-0.5">
            {formatDuration(avgSeconds)}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg px-3 py-2.5">
          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            Errors en sessions
          </div>
          <div className="font-mono text-base sm:text-lg font-bold text-slate-900 mt-0.5">
            {totalErrors}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Chart 1: Evolution of time & mistakes across sessions */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-3.5">
          <h4 className="text-xs font-bold text-slate-800 mb-2">
            {isSingleStudent
              ? `Sessions de ${activeStudent?.name}: Temps (s) i Errors`
              : 'Mitjana per sessió: Temps dedicat (s) vs Errors'}
          </h4>

          {sessionSeries.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-xs text-slate-400 text-center px-4">
              Encara no hi ha sessions registrades per mostrar la gràfica d'evolució.
            </div>
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={sessionSeries} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="timeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 11, fill: '#6366f1' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    allowDecimals={false}
                    label={{
                      value: 'Segons',
                      angle: -90,
                      position: 'insideLeft',
                      offset: 18,
                      style: { fontSize: 10, fill: '#6366f1' },
                    }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11, fill: '#e11d48' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '0.75rem',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                    formatter={(value, name) => {
                      const numVal = Number(value ?? 0);
                      if (name === 'Temps dedicat (s)') {
                        return [formatDuration(numVal), 'Temps dedicat'];
                      }
                      return [numVal, 'Errors'];
                    }}
                    labelFormatter={(label, payload) => {
                      const item = payload?.[0]?.payload;
                      if (item?.dateLabel) {
                        return `Sessió ${label} · ${item.level} (${item.dateLabel})`;
                      }
                      if (item?.participants) {
                        return `Sessió ${label} (${item.participants} alumnes)`;
                      }
                      return `Sessió ${label}`;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="tempsSegons"
                    name="Temps dedicat (s)"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    fill="url(#timeGradient)"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="errors"
                    name="Errors comesos"
                    fill="#f43f5e"
                    radius={[4, 4, 0, 0]}
                    barSize={18}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Chart 2: Common Errors Breakdown */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-3.5">
          <h4 className="text-xs font-bold text-slate-800 mb-2">
            Errors comuns detectats
          </h4>

          {errorBreakdown.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-xs text-slate-400 text-center px-4">
              Cap error comú registrat en aquesta selecció.
            </div>
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={errorBreakdown}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 4, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={118}
                    tick={{ fontSize: 10, fill: '#334155' }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '0.75rem',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                    formatter={(value) => [Number(value ?? 0), 'Ocurrències']}
                  />
                  <Bar dataKey="count" name="Errors" radius={[0, 4, 4, 0]} barSize={16}>
                    {errorBreakdown.map((entry, idx) => (
                      <Cell key={entry.key} fill={ERROR_COLORS[idx % ERROR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
