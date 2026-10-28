/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WordProblem } from '../types/math';

export const WORD_PROBLEMS: WordProblem[] = [
  {
    id: 'prob-1',
    category: 'botigues',
    title: 'La compra de material escolar',
    context: 'Comença el curs a l\'institut i cal renovar el material escolar a la papereria.',
    statement:
      'La Laia va a la papereria del barri a comprar 3 llibretes idèntiques i una carpeta de dibuix que costa 4 €. Si a la caixa ha pagat un total de 19 €, quin és el preu d\'una llibreta?',
    variableQuestion: 'Què representa la incògnita "x" en aquest problema?',
    variableOptions: [
      { label: 'El preu d\'una llibreta (€)', isCorrect: true },
      { label: 'El total de diners que ha pagat la Laia', isCorrect: false },
      { label: 'El nombre de carpetes comprades', isCorrect: false },
    ],
    variableDefinition: 'x = Preu d\'una llibreta (€)',
    dataExpressions: [
      { label: 'Cost de les 3 llibretes', expression: '3x' },
      { label: 'Cost de la carpeta', expression: '4 €' },
      { label: 'Total gastat', expression: '19 €' },
    ],
    equationQuestion: 'Quina equació tradueix correctament la situació?',
    equationOptions: [
      {
        equation: '3x + 4 = 19',
        isCorrect: true,
        explanationIfWrong: '',
      },
      {
        equation: '3 + 4x = 19',
        isCorrect: false,
        explanationIfWrong: 'Compte! Són 3 llibretes de preu x cadascuna (3x), i només una carpeta de 4 €.',
      },
      {
        equation: '3x - 4 = 19',
        isCorrect: false,
        explanationIfWrong: 'Per calcular la despesa total sumem el preu de les llibretes i la carpeta, no restem.',
      },
    ],
    correctEquation: '3x + 4 = 19',
    solutionX: 5,
    finalAnswerUnit: '€',
    finalAnswerText: 'Cada llibreta costa 5 €.',
    stepByStepSolution: [
      '1. Definim la incògnita: x = preu d\'una llibreta.',
      '2. Plantegem: 3 llibretes (3x) més la carpeta (4 €) sumen 19 € -> 3x + 4 = 19.',
      '3. A la balança, restem 4 a cada membre de l\'equació: 3x = 19 - 4 -> 3x = 15.',
      '4. Dividim cada membre entre 3: x = 15 / 3 = 5 €.',
      '5. Comprovació: 3 · 5 € + 4 € = 15 + 4 = 19 €. Té tot el sentit!',
    ],
  },
  {
    id: 'prob-2',
    category: 'edats',
    title: 'Les edats d\'en Biel i la seva mare',
    context: 'Problema clàssic d\'edats relacionades en el present i en el futur.',
    statement:
      'La mare d\'en Biel té exactament 26 anys més que ell. Si entre tots dos sumen 54 anys, quina edat té en Biel?',
    variableQuestion: 'Com definim millor la incògnita per simplificar el càlcul?',
    variableOptions: [
      { label: 'x = edat actual d\'en Biel', isCorrect: true },
      { label: 'x = suma de les dues edats', isCorrect: false },
      { label: 'x = diferència d\'edat (26)', isCorrect: false },
    ],
    variableDefinition: 'x = Edat d\'en Biel (anys)',
    dataExpressions: [
      { label: 'Edat d\'en Biel', expression: 'x' },
      { label: 'Edat de la mare (26 anys més)', expression: 'x + 26' },
      { label: 'Suma de les edats', expression: '54 anys' },
    ],
    equationQuestion: 'Tria l\'equació que representa la suma d\'edats:',
    equationOptions: [
      {
        equation: 'x + (x + 26) = 54',
        isCorrect: true,
        explanationIfWrong: '',
      },
      {
        equation: '26x = 54',
        isCorrect: false,
        explanationIfWrong: 'La mare no té 26 vegades l\'edat d\'en Biel, sinó 26 anys MÉS (x + 26).',
      },
      {
        equation: 'x + 26 = 54',
        isCorrect: false,
        explanationIfWrong: 'Has oblidat sumar l\'edat del Biel (x) a l\'edat de la mare (x + 26).',
      },
    ],
    correctEquation: '2x + 26 = 54',
    solutionX: 14,
    finalAnswerUnit: 'anys',
    finalAnswerText: 'En Biel té 14 anys (i la seva mare 40 anys).',
    stepByStepSolution: [
      '1. Biel = x anys; Mare = x + 26 anys.',
      '2. Equació: x + (x + 26) = 54.',
      '3. Reduïm les x al membre esquerre: 2x + 26 = 54.',
      '4. Restem 26 a cada membre de l\'equació: 2x = 54 - 26 -> 2x = 28.',
      '5. Dividim cada membre entre 2: x = 28 / 2 = 14 anys.',
      '6. Comprovació: Biel = 14 anys, Mare = 14 + 26 = 40 anys. 14 + 40 = 54 anys.',
    ],
  },
  {
    id: 'prob-3',
    category: 'nombres',
    title: 'Tres nombres consecutius misteriosos',
    context: 'Els nombres consecutius són aquells que es porten exactament 1 unitat (com 7, 8, 9).',
    statement:
      'La suma de tres nombres enters consecutius és igual a 48. Quin és el primer d\'aquests tres nombres?',
    variableQuestion: 'Si el primer nombre és x, com escrivim els dos següents?',
    variableOptions: [
      { label: 'El segon és (x + 1) i el tercer és (x + 2)', isCorrect: true },
      { label: 'El segon és 2x i el tercer és 3x', isCorrect: false },
      { label: 'Tots tres nombres s\'escriuen x', isCorrect: false },
    ],
    variableDefinition: 'x = Primer nombre enter',
    dataExpressions: [
      { label: 'Primer nombre', expression: 'x' },
      { label: 'Segon nombre consecutiu', expression: 'x + 1' },
      { label: 'Tercer nombre consecutiu', expression: 'x + 2' },
      { label: 'Suma dels tres nombres', expression: '48' },
    ],
    equationQuestion: 'Com plantegem la suma dels tres nombres?',
    equationOptions: [
      {
        equation: 'x + (x + 1) + (x + 2) = 48',
        isCorrect: true,
        explanationIfWrong: '',
      },
      {
        equation: '3x = 48',
        isCorrect: false,
        explanationIfWrong: 'Aquesta seria l\'equació si els tres nombres fossin iguals, però són consecutius!',
      },
      {
        equation: 'x + 1 + 2 = 48',
        isCorrect: false,
        explanationIfWrong: 'Has oblidat que cadascun dels tres nombres té una x.',
      },
    ],
    correctEquation: '3x + 3 = 48',
    solutionX: 15,
    finalAnswerUnit: '',
    finalAnswerText: 'El primer nombre és el 15 (els tres són 15, 16 i 17).',
    stepByStepSolution: [
      '1. Els tres nombres consecutius són: x, x + 1, x + 2.',
      '2. Sumem-los: x + x + 1 + x + 2 = 48 -> 3x + 3 = 48.',
      '3. Restem 3 a cada membre de l\'equació: 3x = 48 - 3 -> 3x = 45.',
      '4. Dividim cada membre entre 3: x = 45 / 3 = 15.',
      '5. Comprovació: 15 + 16 + 17 = 48. Perfecte!',
    ],
  },
  {
    id: 'prob-4',
    category: 'geometria',
    title: 'El perímetre del pati de l\'institut',
    context: 'Càlcul geomètric de dimensions a partir del perímetre d\'un rectangle.',
    statement:
      'El camp de futbol sala del pati té forma rectangular. La seva llargada fa 10 metres més que la seva amplada. Si la tanca que l\'envolta fa un perímetre total de 60 metres, quant fa d\'amplada?',
    variableQuestion: 'Què assignem a la incògnita x?',
    variableOptions: [
      { label: 'x = l\'amplada del camp (en metres)', isCorrect: true },
      { label: 'x = el perímetre de 60 metres', isCorrect: false },
      { label: 'x = la llargada del camp', isCorrect: false },
    ],
    variableDefinition: 'x = Amplada del camp (metres)',
    dataExpressions: [
      { label: 'Amplada (té 2 costats iguals)', expression: 'x' },
      { label: 'Llargada (10 metres més)', expression: 'x + 10' },
      { label: 'Fórmula perímetre rectangle', expression: '2·amplada + 2·llargada' },
    ],
    equationQuestion: 'Quina és l\'equació del perímetre total?',
    equationOptions: [
      {
        equation: '2x + 2(x + 10) = 60',
        isCorrect: true,
        explanationIfWrong: '',
      },
      {
        equation: 'x + (x + 10) = 60',
        isCorrect: false,
        explanationIfWrong: 'Això seria només la suma d\'un costat i una llargada (semiperímetre), el rectangle té 4 costats!',
      },
      {
        equation: '2x + 10 = 60',
        isCorrect: false,
        explanationIfWrong: 'Has d\'aplicar el 2 a tota la llargada: 2 · (x + 10) = 2x + 20.',
      },
    ],
    correctEquation: '4x + 20 = 60',
    solutionX: 10,
    finalAnswerUnit: 'metres',
    finalAnswerText: 'L\'amplada fa 10 metres (i la llargada fa 20 metres).',
    stepByStepSolution: [
      '1. Amplada = x m; Llargada = x + 10 m.',
      '2. Perímetre: 2·x + 2·(x + 10) = 60.',
      '3. Desfem parèntesi: 2x + 2x + 20 = 60 -> 4x + 20 = 60.',
      '4. Restem 20 a cada membre de l\'equació: 4x = 60 - 20 -> 4x = 40.',
      '5. Dividim cada membre entre 4: x = 40 / 4 = 10 metres.',
      '6. Comprovació: Amplada 10 m, llargada 20 m. Perímetre = 10 + 20 + 10 + 20 = 60 m.',
    ],
  },
  {
    id: 'prob-5',
    category: 'esports',
    title: 'El partit de bàsquet de la lliga escolar',
    context: 'Puntuació d\'un partit disputat entre dos equips.',
    statement:
      'En un partit de bàsquet escolar, el CB Manresa va anotar 14 punts més que el CB Girona. Entre tots dos equips van sumar un total de 122 punts. Quants punts va anotar el CB Girona?',
    variableQuestion: 'Quina és la incògnita x?',
    variableOptions: [
      { label: 'x = punts anotats pel CB Girona', isCorrect: true },
      { label: 'x = la diferència de punts (14)', isCorrect: false },
      { label: 'x = el total de punts del partit (122)', isCorrect: false },
    ],
    variableDefinition: 'x = Punts anotats pel CB Girona',
    dataExpressions: [
      { label: 'Punts CB Girona', expression: 'x' },
      { label: 'Punts CB Manresa (14 més)', expression: 'x + 14' },
      { label: 'Total de punts del partit', expression: '122' },
    ],
    equationQuestion: 'Quina equació iguala el total de punts?',
    equationOptions: [
      {
        equation: 'x + (x + 14) = 122',
        isCorrect: true,
        explanationIfWrong: '',
      },
      {
        equation: 'x + 14 = 122',
        isCorrect: false,
        explanationIfWrong: 'Falta sumar els punts de l\'altre equip (x).',
      },
      {
        equation: '2x - 14 = 122',
        isCorrect: false,
        explanationIfWrong: 'Si Manresa té 14 punts MÉS, sumem +14, no pas restem.',
      },
    ],
    correctEquation: '2x + 14 = 122',
    solutionX: 54,
    finalAnswerUnit: 'punts',
    finalAnswerText: 'El CB Girona va anotar 54 punts (i el CB Manresa 68 punts).',
    stepByStepSolution: [
      '1. Girona = x punts; Manresa = x + 14 punts.',
      '2. Equació: x + (x + 14) = 122 -> 2x + 14 = 122.',
      '3. Restem 14 a cada membre de l\'equació: 2x = 122 - 14 -> 2x = 108.',
      '4. Dividim cada membre entre 2: x = 108 / 2 = 54 punts.',
      '5. Comprovació: Girona = 54, Manresa = 54 + 14 = 68. 54 + 68 = 122 punts.',
    ],
  },
];
