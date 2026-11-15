/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, BookOpen, Scale, Sparkles, AlertTriangle } from 'lucide-react';
import { MathExpression } from './MathExpression';

interface CheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheatSheetModal: React.FC<CheatSheetModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 p-4 sm:p-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Quadern de Trucs d'Àlgebra</h2>
              <p className="text-xs text-slate-500">Regles clau per aprovar matemàtiques a 3r d'ESO</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-6 text-sm text-slate-700">
          {/* Tip 1 */}
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
              <Scale className="w-4 h-4 text-indigo-600" />
              1. La Regla d'Or de la Balança
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Una equació és com una balança de dos plats en equilibri perfecte. Tot el que facis a un costat (sumar, restar, multiplicar o dividir), <strong>ho has de fer exactament igual a l'altre costat</strong> perquè continuï en equilibri.
            </p>
          </div>

          {/* Tip 2 */}
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
              <Scale className="w-4 h-4 text-emerald-600" />
              2. Com operem a cada membre de l'equació (La Balança)
            </h3>
            <p className="text-xs text-slate-600">
              No "passem" coses màgicament: fem la <strong>mateixa operació a cada membre</strong> per desfer el que molesta al costat de la incògnita:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-semibold text-slate-900 block mb-1">Per contrarestar una suma o resta:</span>
                <p>• Si tenim <strong className="font-mono text-indigo-700">+7</strong>: <strong>restem 7 a cada membre</strong>.</p>
                <p className="font-mono text-slate-600 text-[11px] mt-0.5">x + 7 - 7 = 15 - 7 → x = 8</p>
                <p className="mt-1.5">• Si tenim <strong className="font-mono text-indigo-700">-3</strong>: <strong>sumem 3 a cada membre</strong>.</p>
                <p className="font-mono text-slate-600 text-[11px] mt-0.5">2x - 3 + 3 = 11 + 3 → 2x = 14</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-semibold text-slate-900 block mb-1">Per contrarestar multiplicació o divisió:</span>
                <p>• Si el coeficient <strong>multiplica</strong> (3x = 15): <strong>dividim cada membre entre 3</strong>.</p>
                <div className="text-slate-700 mt-1">
                  <MathExpression expression="3x / 3 = 15 / 3 → x = 5" size="xs" />
                </div>
                <p className="mt-2 flex flex-wrap items-center gap-1">
                  <span>• Si està <strong>dividint</strong> (</span>
                  <MathExpression expression="x / 2 = 4" size="xs" className="font-semibold" />
                  <span>): <strong>multipliquem cada membre per 2</strong>.</span>
                </p>
                <div className="text-slate-700 mt-1">
                  <MathExpression expression="(x / 2) · 2 = 4 · 2 → x = 8" size="xs" />
                </div>
              </div>
            </div>
          </div>

          {/* Tip 3 */}
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              3. Els dos errors més típics que et costen punts
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl">
                <span className="font-semibold text-rose-950 block">A) Oblidar multiplicar el segon terme del parèntesi:</span>
                <p className="text-rose-900 mt-0.5">
                  ❌ <span className="font-mono">3(x - 4) = 3x - 4</span> (Incorrecte!)<br />
                  ✅ <span className="font-mono font-bold">3(x - 4) = 3x - 12</span> (El 3 multiplica tant la x com el 4!).
                </p>
              </div>

              <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl">
                <span className="font-semibold text-rose-950 block">B) Signe menys davant de parèntesi:</span>
                <p className="text-rose-900 mt-0.5">
                  ❌ <span className="font-mono">-(2x - 5) = -2x - 5</span> (Incorrecte!)<br />
                  ✅ <span className="font-mono font-bold">-(2x - 5) = -2x + 5</span> (Menys per menys és MÉS!).
                </p>
              </div>
            </div>
          </div>

          {/* Tip 4 */}
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-amber-500" />
              4. Com resoldre qualsevol problema d'enunciat
            </h3>
            <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1.5 leading-relaxed bg-amber-50/50 p-3.5 rounded-xl border border-amber-200">
              <li><strong>Llegeix dues vegades:</strong> subratlla què et demanen calcular.</li>
              <li><strong>Posa nom a la incògnita:</strong> escriu sempre "x = el que busco" (edat, preu, etc.).</li>
              <li><strong>Escriu les relacions:</strong> el doble és <code className="font-mono font-bold">2x</code>, consecutiu és <code className="font-mono font-bold">x + 1</code>, fa 3 anys és <code className="font-mono font-bold">x - 3</code>.</li>
              <li><strong>Iguala i resol:</strong> resol l'equació aïllant la x.</li>
              <li><strong>Comprova i redacta la resposta:</strong> té sentit? Recorda posar la unitat (€, anys, metres).</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer"
          >
            Tancar el quadern
          </button>
        </div>
      </div>
    </div>
  );
};
