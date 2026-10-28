/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SpotTheErrorExercise } from '../types/math';

export const SPOT_THE_ERROR_EXERCISES: SpotTheErrorExercise[] = [
  {
    id: 'spot-1',
    title: 'Desequilibri a la balança (restar a cada membre)',
    studentName: 'Pol',
    equation: '4x + 6 = 26',
    lines: [
      { text: 'Pas 1: 4x = 26 + 6', isError: true, errorName: 'No ha restat 6 a cada membre', errorExplanation: 'El Pol volia eliminar el +6 de l\'esquerra. Seguint la regla de la balança, havia de RESTAR 6 a cada membre de l\'equació (4x + 6 - 6 = 26 - 6). En canvi, ha sumat 6 a la dreta!', correctVersion: '4x = 26 - 6' },
      { text: 'Pas 2: 4x = 32', isError: false },
      { text: 'Pas 3: x = 32 / 4', isError: false },
      { text: 'Pas 4: x = 8', isError: false },
    ],
    hint: 'Fixa\'t molt bé en el Pas 1: per eliminar un +6 a la balança, què cal fer a cada membre de l\'equació?',
    takeaway: 'Regla de la balança: per treure un número que suma a un plat, restem aquesta mateixa quantitat a tots dos membres de l\'equació.',
  },
  {
    id: 'spot-2',
    title: 'La trampa de la propietat distributiva',
    studentName: 'Ona',
    equation: '3(x - 4) = 15',
    lines: [
      { text: 'Pas 1: 3x - 4 = 15', isError: true, errorName: 'Distributiva incompleta', errorExplanation: 'L\'Ona només ha multiplicat el 3 per la x, però ha oblidat multiplicar-lo pel -4! Hauria de ser 3·x - 3·4 = 3x - 12.', correctVersion: '3x - 12 = 15' },
      { text: 'Pas 2: 3x = 15 + 4', isError: false },
      { text: 'Pas 3: 3x = 19', isError: false },
      { text: 'Pas 4: x = 19 / 3', isError: false },
    ],
    hint: 'Recorda la propietat distributiva: el número que està enganxat al parèntesi multiplica a TOTS els termes de dins.',
    takeaway: 'Dibuixa dues fletxetes des del número de fora cap a cada terme del parèntesi per no deixar-te\'n cap.',
  },
  {
    id: 'spot-3',
    title: 'El perillós signe menys davant de parèntesi',
    studentName: 'Marc',
    equation: '10 - (2x - 5) = 21',
    lines: [
      { text: 'Pas 1: 10 - 2x - 5 = 21', isError: true, errorName: 'Signe del parèntesi no invertit', errorExplanation: 'El signe menys davant del parèntesi canvia el signe de TOTS els termes de dins: -(2x - 5) es converteix en -2x + 5 (perquè menys per menys és més).', correctVersion: '10 - 2x + 5 = 21' },
      { text: 'Pas 2: 5 - 2x = 21', isError: false },
      { text: 'Pas 3: -2x = 21 - 5', isError: false },
      { text: 'Pas 4: -2x = 16 => x = -8', isError: false },
    ],
    hint: 'Què li passa al -5 de dins del parèntesi quan té un altre signe menys al davant?',
    takeaway: 'Menys per menys dóna més! -(a - b) = -a + b.',
  },
  {
    id: 'spot-4',
    title: 'Dividir o restar a cada membre de la balança?',
    studentName: 'Júlia',
    equation: '5x = 20',
    lines: [
      { text: 'Pas 1: x = 20 - 5', isError: true, errorName: 'Restar en lloc de dividir a cada membre', errorExplanation: 'El 5 està MULTIPLICANT la x (5 caixes de x pesen 20). Per saber quant pesa una sola caixa a la balança, hem de DIVIDIR cada membre de l\'equació entre 5: 5x/5 = 20/5 -> x = 4.', correctVersion: 'x = 20 / 5' },
      { text: 'Pas 2: x = 15', isError: false },
    ],
    hint: 'El número 5 està multiplicant la x. Com desfem una multiplicació a cada membre de la balança?',
    takeaway: 'Per aïllar la incògnita d\'un coeficient que la multiplica, dividim cada membre de l\'equació entre aquest coeficient.',
  },
  {
    id: 'spot-5',
    title: 'Cura amb el signe al dividir per un negatiu',
    studentName: 'Pau',
    equation: '-3x = 18',
    lines: [
      { text: 'Pas 1: x = 18 / 3', isError: true, errorName: 'Pèrdua del signe negatiu al coeficient', errorExplanation: 'El coeficient que multiplica la x és -3. Quan passa dividint, s\'emporta el seu signe negatiu: x = 18 / (-3) = -6. El Pau s\'ha deixat el signe menys!', correctVersion: 'x = 18 / (-3)' },
      { text: 'Pas 2: x = 6', isError: false },
    ],
    hint: 'Fixa\'t en el signe del nombre que acompanya la x al principi.',
    takeaway: 'En passar el coeficient dividint, manté el seu signe negatiu. I positiu entre negatiu dóna negatiu.',
  },
];
