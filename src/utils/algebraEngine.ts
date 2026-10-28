/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DiagnosticFeedback, EquationExercise, EquationDifficulty } from '../types/math';

/**
 * Clean and normalize mathematical expressions
 */
export function normalizeExpr(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/−/g, '-')
    .replace(/–/g, '-')
    .replace(/·/g, '*')
    .replace(/x/g, 'x')
    .replace(/\+-\s*/g, '-')
    .replace(/-\+\s*/g, '-');
}

/**
 * Parse an equation "LHS = RHS" into two normalized sides
 */
export function splitEquation(eq: string): { lhs: string; rhs: string } | null {
  const parts = eq.split('=');
  if (parts.length !== 2) return null;
  return {
    lhs: normalizeExpr(parts[0]),
    rhs: normalizeExpr(parts[1]),
  };
}

/**
 * Evaluate simple linear expression in the form ax + b for a given x
 */
export function evalLinearSide(expr: string, xVal: number): number | null {
  // Replace x with (* xVal)
  try {
    // Sanitize to only allow numbers, +, -, *, /, (, ), x, decimal points
    const clean = normalizeExpr(expr);
    if (!/^[0-9x+\-*/().]+$/.test(clean)) return null;

    // Replace 3x with 3*(xVal)
    const withMult = clean.replace(/(\d)x/g, `$1*(${xVal})`).replace(/x/g, `(${xVal})`);
    
    // Simple math evaluator without eval on arbitrary strings
    // eslint-disable-next-line no-new-func
    const result = Function(`'use strict'; return (${withMult});`)();
    return typeof result === 'number' && !isNaN(result) ? result : null;
  } catch {
    return null;
  }
}

/**
 * Diagnose a student step against the current equation state
 */
export function diagnoseEquationStep(
  currentEq: string,
  userStep: string,
  correctSolution: number,
  expectedStep: string
): DiagnosticFeedback {
  const normUser = normalizeExpr(userStep);
  const normExpected = normalizeExpr(expectedStep);

  // Direct match with expected
  if (normUser === normExpected) {
    return {
      isCorrect: true,
      title: 'Excel·lent pas!',
      explanation: 'Has aplicat el pas de forma totalment correcta.',
      pedagogicalTip: 'Continua així fins a tenir la x completament aïllada.',
    };
  }

  // Check if user input is an equation or just a value
  const userSides = splitEquation(userStep);
  const expectedSides = splitEquation(expectedStep);

  if (!userSides && !userStep.includes('=')) {
    // Check if user entered just the numerical answer (e.g. "5" instead of "x = 5")
    const numVal = parseFloat(normUser.replace('x', ''));
    if (!isNaN(numVal) && Math.abs(numVal - correctSolution) < 0.0001) {
      return {
        isCorrect: true,
        title: 'Solució correcta!',
        explanation: `Efectivament, la solució és x = ${correctSolution}.`,
        pedagogicalTip: 'A classe de matemàtiques és recomanable escriure "x = ' + correctSolution + '" per expressar el resultat clarament.',
        suggestedCorrection: `x = ${correctSolution}`,
      };
    }
  }

  // Check for common error: combining x with numbers (e.g. 3x + 5 -> 8x)
  if (/(\d+)x/.test(normUser)) {
    const origSides = splitEquation(currentEq);
    if (origSides) {
      if ((origSides.lhs.includes('+') || origSides.lhs.includes('-')) && !origSides.lhs.includes('(')) {
        // e.g. 2x + 3 -> 5x
        if (normUser.includes('5x') && (origSides.lhs === '2x+3' || origSides.lhs === '3x+2')) {
          return {
            isCorrect: false,
            errorType: 'COMBINING_X_AND_NUMBERS',
            title: 'Compte amb sumar x amb nombres sols!',
            explanation: 'No podem sumar un terme amb incògnita (com 2x) amb un nombre sense incògnita (com +3). Són quantitats diferents: és com sumar 2 pomes i 3 euros.',
            pedagogicalTip: 'Agrupa sempre les "x" amb les "x", i els nombres sense "x" a l\'altre costat de la igualtat.',
            suggestedCorrection: expectedStep,
          };
        }
      }
    }
  }

  // Check for balance error: adding instead of subtracting to both sides (e.g. 3x + 5 = 20 -> 3x = 20 + 5)
  if (currentEq.includes('+') && userStep.includes('+')) {
    const currSides = splitEquation(currentEq);
    if (currSides && currSides.lhs.includes('+')) {
      const matchPlus = currSides.lhs.match(/([+-]?\d*x?)\+(\d+)/);
      if (matchPlus) {
        const constant = matchPlus[2];
        if (normUser.includes(`+${constant}`)) {
          return {
            isCorrect: false,
            errorType: 'SIGN_TRANSPOSITION',
            title: 'Desequilibri a la balança: cal restar a cada membre!',
            explanation: `Per eliminar el +${constant} del plat esquerre, has de RESTAR ${constant} a cada membre de l'equació. A la dreta ha de quedar 20 - ${constant}, no 20 + ${constant}.`,
            pedagogicalTip: `Metàfora de la balança: restem ${constant} a tots dos membres perquè continuï en equilibri: (plat esquerre - ${constant}) = (plat dret - ${constant}).`,
            suggestedCorrection: expectedStep,
          };
        }
      }
    }
  }

  // Check for balance error: subtracting instead of adding to both sides (e.g. 3x - 5 = 10 -> 3x = 10 - 5)
  if (currentEq.includes('-') && userStep.includes('-')) {
    const currSides = splitEquation(currentEq);
    if (currSides && currSides.lhs.includes('-')) {
      const matchMinus = currSides.lhs.match(/([+-]?\d*x?)-(\d+)/);
      if (matchMinus) {
        const constant = matchMinus[2];
        if (normUser.includes(`-${constant}`)) {
          return {
            isCorrect: false,
            errorType: 'SIGN_TRANSPOSITION',
            title: 'Equilibri de la balança: cal sumar a cada membre!',
            explanation: `Per contrarestar el -${constant} del membre esquerre, has de SUMAR ${constant} a cada membre de l'equació: a la dreta hem de sumar +${constant}.`,
            pedagogicalTip: `Metàfora de la balança: sumem ${constant} a tots dos costats: (... - ${constant} + ${constant}) = (... + ${constant}).`,
            suggestedCorrection: expectedStep,
          };
        }
      }
    }
  }

  // Check for subtracting coefficient instead of dividing (e.g. 3x = 15 -> x = 15 - 3)
  if (normUser.includes('-') && currentEq.includes('x=')) {
    // 3x = 15 -> x = 15 - 3
    const match = currentEq.match(/(\d+)x=(\d+)/);
    if (match) {
      const coef = match[1];
      const val = match[2];
      if (normUser.includes(`${val}-${coef}`) || normUser === `x=${Number(val) - Number(coef)}`) {
        return {
          isCorrect: false,
          errorType: 'ADD_SUBTRACT_INSTEAD_OF_DIVIDE',
          title: 'A la balança: dividim cada membre entre el coeficient!',
          explanation: `El nombre ${coef} multiplica la x (${coef} · x). Per saber quant val una sola x, dividim cada membre de l'equació entre ${coef}, mai restant!`,
          pedagogicalTip: `Dividim ambdós plats entre ${coef}: (${coef}x / ${coef}) = (${val} / ${coef}) -> x = ${Number(val) / Number(coef)}.`,
          suggestedCorrection: `x = ${val} / ${coef}`,
        };
      }
    }
  }

  // Check for negative coefficient division sign error (e.g. -2x = 8 -> x = 4)
  if (currentEq.includes('-') && currentEq.includes('x=')) {
    const matchNeg = currentEq.match(/-(\d+)x=(\d+)/);
    if (matchNeg) {
      const coef = Number(matchNeg[1]);
      const val = Number(matchNeg[2]);
      const wrongPositive = val / coef;
      if (normUser === `x=${wrongPositive}` || normUser === `${wrongPositive}`) {
        return {
          isCorrect: false,
          errorType: 'COEFFICIENT_SIGN_ON_DIVISION',
          title: 'Cura amb el signe al dividir per un nombre negatiu!',
          explanation: `Estem dividint un nombre positiu (+${val}) entre un nombre negatiu (-${coef}). Recorda: positiu entre negatiu és NEGATIU (+ / - = -).`,
          pedagogicalTip: `x = ${val} / (-${coef}) = -${wrongPositive}`,
          suggestedCorrection: `x = -${wrongPositive}`,
        };
      }
    }
  }

  // Check for distributive property slip: a(x + b) -> ax + b (forgot to multiply b)
  if (currentEq.includes('(')) {
    const distMatch = currentEq.match(/(\d+)\(x([+-])(\d+)\)/);
    if (distMatch) {
      const a = Number(distMatch[1]);
      const sign = distMatch[2];
      const b = Number(distMatch[3]);
      // If student wrote "ax +/- b" instead of "ax +/- (a*b)"
      if (normUser.includes(`${a}x${sign}${b}`)) {
        return {
          isCorrect: false,
          errorType: 'DISTRIBUTIVE_UNMULTIPLIED_CONSTANT',
          title: 'Propietat distributiva incompleta',
          explanation: `El nombre ${a} de fora del parèntesi ha de multiplicar TOTS els termes de dins: tant la x com el ${b}. Hauria de ser: ${a} · x ${sign} (${a} · ${b}) = ${a}x ${sign} ${a * b}.`,
          pedagogicalTip: 'Dibuixa dues fletxes des del factor de fora cap a cadascun dels elements del parèntesi.',
          suggestedCorrection: expectedStep,
        };
      }
    }
  }

  // Check for minus sign before parenthesis: -(x - b) -> -x - b
  if (currentEq.includes('-(') || currentEq.includes('-(x-')) {
    if (normUser.includes('-x-') && currentEq.includes('-(x-')) {
      return {
        isCorrect: false,
        errorType: 'MINUS_BEFORE_PARENTHESIS',
        title: 'Signe menys davant de parèntesi!',
        explanation: 'Un signe menys (-) davant d\'un parèntesi canvia el signe de TOTS els termes de l\'interior: -(x - a) es converteix en -x + a.',
        pedagogicalTip: 'Menys per menys dóna MÉS: -(-a) = +a.',
        suggestedCorrection: expectedStep,
      };
    }
  }

  // Mathematical equivalence test: does the user's expression still preserve the true solution?
  if (userSides) {
    const lhsVal = evalLinearSide(userSides.lhs, correctSolution);
    const rhsVal = evalLinearSide(userSides.rhs, correctSolution);

    if (lhsVal !== null && rhsVal !== null && Math.abs(lhsVal - rhsVal) < 0.0001) {
      // The student wrote a mathematically valid equivalent equation, even if formatted differently!
      return {
        isCorrect: true,
        title: 'Molt bé! Pas matemàticament correcte',
        explanation: 'Aquesta igualtat és correcta i manté la solució de l\'equació.',
        pedagogicalTip: 'Pots continuar simplificant per aïllar la incògnita.',
      };
    }
  }

  // Check if arithmetic calculation is just off
  return {
    isCorrect: false,
    errorType: 'ARITHMETIC_CALCULATION',
    title: 'Aquest pas no sembla correcte',
    explanation: 'Revisa les operacions d\'aquest pas. Assegura\'t d\'agrupar els termes correctament o comprova els càlculs numèrics.',
    pedagogicalTip: 'Consell: Recorda fer el mateix a l\'esquerra i a la dreta del símbol "=". Pas esperat: ' + expectedStep,
    suggestedCorrection: expectedStep,
  };
}

/**
 * Built-in graduated curriculum equations for 3r d'ESO
 */
export const CURRICULUM_EQUATIONS: Record<EquationDifficulty, EquationExercise[]> = {
  'nivell-1': [
    {
      id: 'n1-1',
      level: 'nivell-1',
      rawEquation: 'x + 7 = 15',
      solution: 8,
      steps: [
        {
          instruction: 'Per aïllar la x i mantenir la balança en equilibri, restem 7 a cada membre de l\'equació:',
          expectedExpression: 'x = 15 - 7',
          acceptedForms: ['x=15-7', 'x+7-7=15-7', 'x=8'],
          explanation: 'Restem 7 a tots dos costats de la igualtat: al plat esquerre s\'anul·la el +7 i al dret queda 15 - 7.',
        },
        {
          instruction: 'Calcula l\'operació 15 - 7 per trobar el valor de la x:',
          expectedExpression: 'x = 8',
          acceptedForms: ['x=8', '8'],
          explanation: '15 - 7 = 8. La balança ha quedat equilibrada amb 1x a l\'esquerra i 8 a la dreta!',
        },
      ],
      explanationSummary: [
        'Tenim x + 7 = 15.',
        'Metàfora de la balança: per treure el +7 de l\'esquerra, restem 7 a cada membre de l\'equació: x + 7 - 7 = 15 - 7.',
        'Simplifiquem: x = 15 - 7 = 8.',
        'Comprovació: 8 + 7 = 15. La balança està en equilibri perfecte!',
      ],
      visualBalance: { leftX: 1, leftConstant: 7, rightX: 0, rightConstant: 15 },
    },
    {
      id: 'n1-2',
      level: 'nivell-1',
      rawEquation: '2x - 3 = 11',
      solution: 7,
      steps: [
        {
          instruction: 'Per contrarestar el -3 i mantenir l\'equilibri, sumem 3 a cada membre de l\'equació:',
          expectedExpression: '2x = 11 + 3',
          acceptedForms: ['2x=11+3', '2x-3+3=11+3', '2x=14'],
          explanation: 'Sumem 3 a cada membre: a l\'esquerra -3 + 3 = 0, i a la dreta queda 11 + 3.',
        },
        {
          instruction: 'Calcula la suma del membre dret (11 + 3):',
          expectedExpression: '2x = 14',
          acceptedForms: ['2x=14', 'x=14/2'],
          explanation: '11 + 3 = 14. Ara tenim 2x = 14 a la balança.',
        },
        {
          instruction: 'Com que 2 caixes [x] pesen 14, dividim cada membre entre 2 per trobar quant val 1x:',
          expectedExpression: 'x = 14 / 2',
          acceptedForms: ['x=14/2', '2x/2=14/2', 'x=7', '7'],
          explanation: 'Dividim ambdós membres entre 2: 2x / 2 = x i 14 / 2 = 7.',
        },
        {
          instruction: 'Calcula el resultat final:',
          expectedExpression: 'x = 7',
          acceptedForms: ['x=7', '7'],
          explanation: '14 / 2 = 7. Solució obtinguda!',
        },
      ],
      explanationSummary: [
        'Sumem 3 a cada membre de l\'equació: 2x = 11 + 3.',
        'Reduïm: 2x = 14.',
        'Dividim cada membre entre 2: x = 14 / 2.',
        'Resultat: x = 7. Comprovació: 2·(7) - 3 = 14 - 3 = 11.',
      ],
      visualBalance: { leftX: 2, leftConstant: -3, rightX: 0, rightConstant: 11 },
    },
    {
      id: 'n1-3',
      level: 'nivell-1',
      rawEquation: '5x - 8 = 2x + 7',
      solution: 5,
      steps: [
        {
          instruction: 'Restem 2x i sumem 8 a cada membre de l\'equació per agrupar les x a l\'esquerra i els nombres a la dreta:',
          expectedExpression: '5x - 2x = 7 + 8',
          acceptedForms: ['5x-2x=7+8', '3x=15', '5x-2x=8+7'],
          explanation: 'Operem a cada membre de la balança: treiem 2x a tots dos costats i afegim 8 a tots dos costats.',
        },
        {
          instruction: 'Redueix els termes semblants a cada membre de l\'equació:',
          expectedExpression: '3x = 15',
          acceptedForms: ['3x=15', 'x=15/3'],
          explanation: '5x - 2x = 3x al membre esquerre, i 7 + 8 = 15 al membre dret.',
        },
        {
          instruction: 'Dividim cada membre de l\'equació entre 3 per aïllar la x:',
          expectedExpression: 'x = 5',
          acceptedForms: ['x=5', '5', 'x=15/3'],
          explanation: 'x = 15 / 3 = 5. Molt bona feina amb la balança!',
        },
      ],
      explanationSummary: [
        'Equilibrem la balança: restem 2x a cada membre i sumem 8 a cada membre.',
        '5x - 2x = 7 + 8.',
        'Reducció de termes a cada membre: 3x = 15.',
        'Dividim cada membre entre 3: x = 15 / 3 = 5.',
      ],
      visualBalance: { leftX: 5, leftConstant: -8, rightX: 2, rightConstant: 7 },
    },
    {
      id: 'n1-4',
      level: 'nivell-1',
      rawEquation: '4 - 3x = 19',
      solution: -5,
      steps: [
        {
          instruction: 'Per eliminar el 4 de l\'esquerra, restem 4 a cada membre de l\'equació:',
          expectedExpression: '-3x = 19 - 4',
          acceptedForms: ['-3x=19-4', '-3x=15'],
          explanation: 'Restem 4 a cada membre: a l\'esquerra queda -3x i a la dreta 19 - 4.',
        },
        {
          instruction: 'Calcula 19 - 4 al membre dret:',
          expectedExpression: '-3x = 15',
          acceptedForms: ['-3x=15', 'x=15/(-3)'],
          explanation: 'Obtenim -3x = 15.',
        },
        {
          instruction: 'Dividim cada membre de l\'equació entre -3 per trobar x (atenció als signes!):',
          expectedExpression: 'x = -5',
          acceptedForms: ['x=-5', '-5', 'x=15/(-3)', 'x=-15/3'],
          explanation: '15 / (-3) = -5. Positiu entre negatiu dóna negatiu (+ / - = -).',
        },
      ],
      explanationSummary: [
        'Restem 4 a cada membre de l\'equació: -3x = 19 - 4.',
        'Reduïm: -3x = 15.',
        'Dividim cada membre entre -3: x = 15 / (-3) = -5.',
      ],
      visualBalance: { leftX: -3, leftConstant: 4, rightX: 0, rightConstant: 19 },
    },
  ],

  'nivell-2': [
    {
      id: 'n2-1',
      level: 'nivell-2',
      rawEquation: '3(x + 4) = 21',
      solution: 3,
      steps: [
        {
          instruction: 'Aplica la propietat distributiva al membre esquerre: multiplica el 3 per x i per +4:',
          expectedExpression: '3x + 12 = 21',
          acceptedForms: ['3x+12=21'],
          explanation: '3 · x = 3x, i 3 · 4 = 12. Així traiem el parèntesi!',
        },
        {
          instruction: 'Per contrarestar el +12, restem 12 a cada membre de l\'equació:',
          expectedExpression: '3x = 21 - 12',
          acceptedForms: ['3x=21-12', '3x=9'],
          explanation: 'Restem 12 a tots dos costats de la balança: 3x = 21 - 12.',
        },
        {
          instruction: 'Calcula 21 - 12 al membre dret:',
          expectedExpression: '3x = 9',
          acceptedForms: ['3x=9', 'x=9/3'],
          explanation: '21 - 12 = 9.',
        },
        {
          instruction: 'Dividim cada membre de l\'equació entre 3 per aïllar la x:',
          expectedExpression: 'x = 3',
          acceptedForms: ['x=3', '3', 'x=9/3'],
          explanation: 'x = 9 / 3 = 3. Solució!',
        },
      ],
      explanationSummary: [
        'Desfem el parèntesi: 3·x + 3·4 = 3x + 12 = 21.',
        'Restem 12 a cada membre de l\'equació: 3x = 21 - 12 = 9.',
        'Dividim cada membre entre 3: x = 9 / 3 = 3.',
        'Comprovació: 3 · (3 + 4) = 3 · 7 = 21.',
      ],
    },
    {
      id: 'n2-2',
      level: 'nivell-2',
      rawEquation: '2(3x - 1) = 4x + 6',
      solution: 4,
      steps: [
        {
          instruction: 'Treu el parèntesi multiplicant 2 · 3x i 2 · (-1):',
          expectedExpression: '6x - 2 = 4x + 6',
          acceptedForms: ['6x-2=4x+6'],
          explanation: '2 · 3x = 6x i 2 · (-1) = -2. L\'equació queda 6x - 2 = 4x + 6.',
        },
        {
          instruction: 'Restem 4x a cada membre i sumem 2 a cada membre per equilibrar la balança:',
          expectedExpression: '6x - 4x = 6 + 2',
          acceptedForms: ['6x-4x=6+2', '2x=8'],
          explanation: 'Operem a cada membre: 6x - 4x = 6 + 2.',
        },
        {
          instruction: 'Redueix termes semblants a cada membre:',
          expectedExpression: '2x = 8',
          acceptedForms: ['2x=8', 'x=8/2'],
          explanation: '6x - 4x = 2x al membre esquerre, i 6 + 2 = 8 al dret.',
        },
        {
          instruction: 'Dividim cada membre de l\'equació entre 2:',
          expectedExpression: 'x = 4',
          acceptedForms: ['x=4', '4', 'x=8/2'],
          explanation: 'x = 8 / 2 = 4. Excel·lent equilibri!',
        },
      ],
      explanationSummary: [
        'Distributiva: 2(3x - 1) = 6x - 2.',
        'Operem a cada membre: 6x - 4x = 6 + 2.',
        'Reducció: 2x = 8.',
        'Dividim cada membre entre 2: x = 4.',
      ],
    },
  ],

  'nivell-3': [
    {
      id: 'n3-1',
      level: 'nivell-3',
      rawEquation: '5 - (2x - 3) = 14',
      solution: -3,
      steps: [
        {
          instruction: 'Treu el parèntesi amb atenció al signe MENYS del davant (canvia tots els signes interiors):',
          expectedExpression: '5 - 2x + 3 = 14',
          acceptedForms: ['5-2x+3=14', '8-2x=14', '-2x+8=14'],
          explanation: 'El signe menys davant canvia els signes de dins: -(2x - 3) passa a ser -2x + 3.',
        },
        {
          instruction: 'Suma els nombres del membre esquerre (5 + 3 = 8):',
          expectedExpression: '8 - 2x = 14',
          acceptedForms: ['8-2x=14', '-2x+8=14', '-2x=14-8'],
          explanation: '5 + 3 = 8, per tant 8 - 2x = 14.',
        },
        {
          instruction: 'Per contrarestar el 8, restem 8 a cada membre de l\'equació:',
          expectedExpression: '-2x = 14 - 8',
          acceptedForms: ['-2x=14-8', '-2x=6'],
          explanation: 'Restem 8 a cada membre de la balança: -2x = 14 - 8.',
        },
        {
          instruction: 'Dividim cada membre de l\'equació entre -2 per trobar x:',
          expectedExpression: 'x = -3',
          acceptedForms: ['x=-3', '-3', 'x=6/(-2)'],
          explanation: '6 / (-2) = -3. Recorda que positiu entre negatiu dóna negatiu!',
        },
      ],
      explanationSummary: [
        'Regla dels signes: 5 - 2x + 3 = 14.',
        'Agrupem al membre esquerre: 8 - 2x = 14.',
        'Restem 8 a cada membre de l\'equació: -2x = 6.',
        'Dividim cada membre entre -2: x = -3.',
      ],
    },
    {
      id: 'n3-2',
      level: 'nivell-3',
      rawEquation: '3(x - 2) - 2(x + 1) = 4',
      solution: 12,
      steps: [
        {
          instruction: 'Aplica la propietat distributiva als dos parèntesis:',
          expectedExpression: '3x - 6 - 2x - 2 = 4',
          acceptedForms: ['3x-6-2x-2=4', 'x-8=4'],
          explanation: '3(x - 2) = 3x - 6, i -2(x + 1) = -2x - 2.',
        },
        {
          instruction: 'Redueix les x (3x - 2x) i els nombres (-6 - 2) al membre esquerre:',
          expectedExpression: 'x - 8 = 4',
          acceptedForms: ['x-8=4', 'x=4+8'],
          explanation: '3x - 2x = x, i -6 - 2 = -8.',
        },
        {
          instruction: 'Per contrarestar el -8, sumem 8 a cada membre de l\'equació:',
          expectedExpression: 'x = 12',
          acceptedForms: ['x=12', '12', 'x=4+8'],
          explanation: 'Sumem 8 a tots dos membres de la balança: x = 4 + 8 = 12. Ho has aconseguit!',
        },
      ],
      explanationSummary: [
        'Distribuïm els dos factors: 3x - 6 - 2x - 2 = 4.',
        'Reduïm termes al membre esquerre: x - 8 = 4.',
        'Sumem 8 a cada membre de l\'equació: x = 12.',
      ],
    },
  ],

  'nivell-4': [
    {
      id: 'n4-1',
      level: 'nivell-4',
      rawEquation: 'x / 2 + 3 = 7',
      solution: 8,
      steps: [
        {
          instruction: 'Per contrarestar el +3, primer restem 3 a cada membre de l\'equació:',
          expectedExpression: 'x / 2 = 7 - 3',
          acceptedForms: ['x/2=7-3', 'x/2=4'],
          explanation: 'Restem 3 a cada membre: x / 2 = 7 - 3 = 4.',
        },
        {
          instruction: 'Calcula 7 - 3 al membre dret:',
          expectedExpression: 'x / 2 = 4',
          acceptedForms: ['x/2=4', 'x=4*2'],
          explanation: 'x / 2 = 4.',
        },
        {
          instruction: 'Com que el 2 divideix la x, multipliquem cada membre de l\'equació per 2 per contrarestar la divisió:',
          expectedExpression: 'x = 4 * 2',
          acceptedForms: ['x=4*2', 'x=8', '8'],
          explanation: 'Multipliquem ambdós membres per 2: (x/2) · 2 = x, i 4 · 2 = 8.',
        },
        {
          instruction: 'Calcula el valor final de x:',
          expectedExpression: 'x = 8',
          acceptedForms: ['x=8', '8'],
          explanation: 'Solució: x = 8. Comprovació: 8 / 2 + 3 = 4 + 3 = 7.',
        },
      ],
      explanationSummary: [
        'Restem 3 a cada membre de l\'equació: x / 2 = 4.',
        'Multipliquem cada membre de l\'equació per 2: x = 4 · 2 = 8.',
      ],
    },
    {
      id: 'n4-2',
      level: 'nivell-4',
      rawEquation: '(x + 4) / 3 = 5',
      solution: 11,
      steps: [
        {
          instruction: 'Com que el 3 divideix tot el membre esquerre, multipliquem cada membre de l\'equació per 3 per equilibrar la balança:',
          expectedExpression: 'x + 4 = 5 * 3',
          acceptedForms: ['x+4=5*3', 'x+4=15'],
          explanation: 'Multipliquem ambdós membres de l\'equació per 3 per eliminar el denominador.',
        },
        {
          instruction: 'Calcula 5 · 3 al membre dret:',
          expectedExpression: 'x + 4 = 15',
          acceptedForms: ['x+4=15', 'x=15-4'],
          explanation: '5 · 3 = 15.',
        },
        {
          instruction: 'Per contrarestar el +4, restem 4 a cada membre de l\'equació:',
          expectedExpression: 'x = 11',
          acceptedForms: ['x=11', '11', 'x=15-4'],
          explanation: 'Restem 4 a cada membre: x = 15 - 4 = 11. Excel·lent!',
        },
      ],
      explanationSummary: [
        'Multipliquem cada membre de l\'equació per 3: x + 4 = 15.',
        'Restem 4 a cada membre de l\'equació: x = 15 - 4 = 11.',
      ],
    },
  ],

  problemes: [],
};

/**
 * Generate randomized simple equations for infinite practice using the balance metaphor
 */
export function generateRandomEquation(level: EquationDifficulty): EquationExercise {
  const seed = Date.now();
  if (level === 'nivell-1') {
    // a*x + b = c  (with clean integers)
    const a = Math.floor(Math.random() * 4) + 2; // 2..5
    const sol = Math.floor(Math.random() * 9) + 2; // 2..10
    const b = (Math.floor(Math.random() * 7) + 1) * (Math.random() > 0.4 ? 1 : -1);
    const c = a * sol + b;
    const sign = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
    const rawEquation = `${a}x ${sign} = ${c}`;
    const actionVerb = b >= 0 ? `restem ${b}` : `sumem ${Math.abs(b)}`;

    return {
      id: `rand-n1-${seed}`,
      level: 'nivell-1',
      rawEquation,
      solution: sol,
      steps: [
        {
          instruction: `A la balança: per eliminar el ${sign} del membre esquerre, ${actionVerb} a cada membre de l'equació:`,
          expectedExpression: `${a}x = ${c} ${b >= 0 ? '-' : '+'} ${Math.abs(b)}`,
          acceptedForms: [`${a}x=${c - b}`, `${a}x=${c}${b >= 0 ? '-' : '+'}${Math.abs(b)}`],
          explanation: `Apliquem ${actionVerb} a tots dos costats de la balança per mantenir l'equilibri.`,
        },
        {
          instruction: `Calcula l'operació al membre dret (${c} ${b >= 0 ? '-' : '+'} ${Math.abs(b)}):`,
          expectedExpression: `${a}x = ${c - b}`,
          acceptedForms: [`${a}x=${c - b}`],
          explanation: `Ara tenim ${a}x = ${c - b} a la balança.`,
        },
        {
          instruction: `Dividim cada membre de l'equació entre ${a} per saber quant val 1x:`,
          expectedExpression: `x = ${sol}`,
          acceptedForms: [`x=${sol}`, `${sol}`],
          explanation: `x = ${c - b} / ${a} = ${sol}.`,
        },
      ],
      explanationSummary: [
        `Equació: ${rawEquation}`,
        `Metàfora de la balança: ${actionVerb} a cada membre: ${a}x = ${c - b}`,
        `Dividim cada membre entre ${a}: x = ${sol}`,
      ],
      visualBalance: { leftX: a, leftConstant: b, rightX: 0, rightConstant: c },
    };
  } else if (level === 'nivell-2') {
    // a(x + b) = c
    const a = Math.floor(Math.random() * 3) + 2; // 2..4
    const sol = Math.floor(Math.random() * 6) + 2; // 2..7
    const b = (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
    const c = a * (sol + b);
    const sign = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
    const expandedConst = a * b;
    const expandedSign = expandedConst >= 0 ? `+ ${expandedConst}` : `- ${Math.abs(expandedConst)}`;
    const actionVerb = expandedConst >= 0 ? `restem ${expandedConst}` : `sumem ${Math.abs(expandedConst)}`;

    return {
      id: `rand-n2-${seed}`,
      level: 'nivell-2',
      rawEquation: `${a}(x ${sign}) = ${c}`,
      solution: sol,
      steps: [
        {
          instruction: `Aplica la propietat distributiva al membre esquerre multiplicant ${a} per x i per (${sign}):`,
          expectedExpression: `${a}x ${expandedSign} = ${c}`,
          acceptedForms: [`${a}x${expandedSign.replace(/\s+/g, '')}=${c}`],
          explanation: `${a} · x = ${a}x, i ${a} · (${sign}) = ${expandedSign}.`,
        },
        {
          instruction: `Per equilibrar la balança, ${actionVerb} a cada membre de l'equació:`,
          expectedExpression: `${a}x = ${c - expandedConst}`,
          acceptedForms: [`${a}x=${c - expandedConst}`],
          explanation: `${actionVerb} a tots dos membres de l'equació: ${a}x = ${c - expandedConst}.`,
        },
        {
          instruction: `Dividim cada membre de l'equació entre ${a}:`,
          expectedExpression: `x = ${sol}`,
          acceptedForms: [`x=${sol}`, `${sol}`],
          explanation: `x = ${c - expandedConst} / ${a} = ${sol}. Excel·lent!`,
        },
      ],
      explanationSummary: [
        `Distribuïm: ${a}x ${expandedSign} = ${c}`,
        `Metàfora de la balança: ${actionVerb} a cada membre: ${a}x = ${c - expandedConst}`,
        `Dividim cada membre entre ${a}: x = ${sol}`,
      ],
    };
  }

  // Fallback to pre-built equation
  const pool = CURRICULUM_EQUATIONS[level];
  return pool[Math.floor(Math.random() * pool.length)];
}
