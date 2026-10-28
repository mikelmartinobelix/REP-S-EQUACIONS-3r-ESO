/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type StudentGroup = 'A' | 'B' | 'C' | 'repas';

export interface StudentSession {
  exerciseId: string;
  level: string;
  timestamp: string;
  isFirstTry: boolean;
  mistakesCount: number;
}

export interface StudentProfile {
  id: string;
  name: string;
  group: StudentGroup;
  createdAt: string;
  lastActive: string;
  totalSolved: number;
  correctFirstTry: number;
  streak: number;
  bestStreak: number;
  levelMastery: Record<string, number>;
  commonMistakes: Record<string, number>;
  sessions: StudentSession[];
}

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain?: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
}
