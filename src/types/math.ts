/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EquationDifficulty = 'nivell-1' | 'nivell-2' | 'nivell-3' | 'nivell-4' | 'problemes';

export interface LevelInfo {
  id: EquationDifficulty;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  iconName: string;
  unlockedByDefault: boolean;
}

export type ErrorType =
  | 'SIGN_TRANSPOSITION'
  | 'ADD_SUBTRACT_INSTEAD_OF_DIVIDE'
  | 'COEFFICIENT_SIGN_ON_DIVISION'
  | 'DISTRIBUTIVE_UNMULTIPLIED_CONSTANT'
  | 'MINUS_BEFORE_PARENTHESIS'
  | 'DENOMINATOR_MULTIPLY_OMISSION'
  | 'LIKE_TERMS_REDUCTION'
  | 'ARITHMETIC_CALCULATION'
  | 'COMBINING_X_AND_NUMBERS'
  | 'INVERTED_FRACTION'
  | 'SYNTAX_OR_FORMAT'
  | 'UNKNOWN';

export interface DiagnosticFeedback {
  isCorrect: boolean;
  errorType?: ErrorType;
  title: string;
  explanation: string;
  pedagogicalTip: string;
  suggestedCorrection?: string;
  exampleSimilar?: string;
}

export interface EquationStep {
  stepNumber: number;
  label: string;
  instruction: string;
  expression: string;
  tip?: string;
}

export interface EquationExercise {
  id: string;
  level: EquationDifficulty;
  rawEquation: string; // e.g. "3x + 5 = 20"
  solution: number; // e.g. 5
  solutionFraction?: { num: number; den: number };
  steps: {
    instruction: string;
    expectedExpression: string; // accepted variations handled by engine
    acceptedForms: string[];
    explanation: string;
  }[];
  explanationSummary: string[];
  visualBalance?: {
    leftX: number;
    leftConstant: number;
    rightX: number;
    rightConstant: number;
  };
}

export interface WordProblem {
  id: string;
  category: 'edats' | 'botigues' | 'nombres' | 'geometria' | 'esports';
  title: string;
  context: string;
  statement: string;
  variableQuestion: string;
  variableOptions: { label: string; isCorrect: boolean }[];
  variableDefinition: string; // e.g. "x = edat del Marc"
  dataExpressions: {
    label: string;
    expression: string;
  }[];
  equationQuestion: string;
  equationOptions: { equation: string; isCorrect: boolean; explanationIfWrong: string }[];
  correctEquation: string;
  solutionX: number;
  finalAnswerUnit: string;
  finalAnswerText: string;
  stepByStepSolution: string[];
}

export interface SpotTheErrorExercise {
  id: string;
  title: string;
  studentName: string;
  equation: string;
  lines: {
    text: string;
    isError: boolean;
    errorName?: string;
    errorExplanation?: string;
    correctVersion?: string;
  }[];
  hint: string;
  takeaway: string;
}

export interface UserStats {
  totalSolved: number;
  correctFirstTry: number;
  streak: number;
  bestStreak: number;
  levelMastery: Record<EquationDifficulty, number>; // 0 to 100%
  completedExerciseIds: string[];
  commonErrorsCount: Record<ErrorType, number>;
  soundEnabled: boolean;
}
