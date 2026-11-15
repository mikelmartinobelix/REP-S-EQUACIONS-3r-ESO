/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  doc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { StudentProfile, StudentGroup, FirebaseClientConfig, StudentSession } from '../types/student';

const FIREBASE_CONFIG_STORAGE_KEY = 'algebra_3reso_firebase_config';
const LOCAL_STUDENTS_STORAGE_KEY = 'algebra_3reso_local_students';

export const DEFAULT_FIREBASE_CONFIG: FirebaseClientConfig = {
  apiKey: 'AIzaSyAEPOi5e2NLUBjSjzInXnZHaS3T7gpeQys',
  authDomain: 'r-eso-repas-equacions.firebaseapp.com',
  projectId: 'r-eso-repas-equacions',
  storageBucket: 'r-eso-repas-equacions.firebasestorage.app',
  messagingSenderId: '1032818830661',
  appId: '1:1032818830661:web:ab107b24fe6d046b8da22c',
};

class FirebaseService {
  private app: FirebaseApp | null = null;
  private db: Firestore | null = null;
  private isConnected: boolean = false;

  constructor() {
    this.initFromStorage();
  }

  private initFromStorage() {
    try {
      const savedConfig = localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
      if (savedConfig) {
        const config: FirebaseClientConfig = JSON.parse(savedConfig);
        this.initializeWithConfig(config);
      } else {
        // Connect automatically to the user's preconfigured Firebase project
        this.initializeWithConfig(DEFAULT_FIREBASE_CONFIG);
      }
    } catch (e) {
      console.warn('Error carregant configuració de Firebase, usant la predeterminada:', e);
      this.initializeWithConfig(DEFAULT_FIREBASE_CONFIG);
    }
  }

  public initializeWithConfig(config: FirebaseClientConfig): boolean {
    try {
      if (!config.apiKey || !config.projectId) {
        return false;
      }

      // Check if already initialized
      const existingApps = getApps();
      if (existingApps.length > 0) {
        this.app = existingApps[0];
      } else {
        this.app = initializeApp({
          apiKey: config.apiKey,
          authDomain: config.authDomain || `${config.projectId}.firebaseapp.com`,
          projectId: config.projectId,
          storageBucket: config.storageBucket || `${config.projectId}.appspot.com`,
          messagingSenderId: config.messagingSenderId,
          appId: config.appId || '1:123456789:web:dummy',
        });
      }

      this.db = getFirestore(this.app);
      this.isConnected = true;
      localStorage.setItem(FIREBASE_CONFIG_STORAGE_KEY, JSON.stringify(config));
      return true;
    } catch (err) {
      console.error('Error inicialitzant Firebase:', err);
      this.isConnected = false;
      return false;
    }
  }

  public getStoredConfig(): FirebaseClientConfig | null {
    try {
      const saved = localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  public async testConnection(config: FirebaseClientConfig): Promise<{ success: boolean; message: string }> {
    try {
      const testApp = initializeApp(
        {
          apiKey: config.apiKey,
          authDomain: config.authDomain || `${config.projectId}.firebaseapp.com`,
          projectId: config.projectId,
          storageBucket: config.storageBucket,
          appId: config.appId || '1:123456:web:test',
        },
        'test-connection-' + Date.now()
      );
      const testDb = getFirestore(testApp);

      // Try reading from collection
      await getDocs(collection(testDb, 'alumnat_3reso'));
      return { success: true, message: 'Connexió amb Firestore establerta correctament!' };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return { success: false, message: `No s'ha pogut connectar amb Firestore: ${errorMsg}` };
    }
  }

  public getIsConnected(): boolean {
    return this.isConnected && this.db !== null;
  }

  // --- Student operations ---

  public getLocalStudents(): StudentProfile[] {
    try {
      const saved = localStorage.getItem(LOCAL_STUDENTS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  private saveLocalStudents(students: StudentProfile[]) {
    try {
      localStorage.setItem(LOCAL_STUDENTS_STORAGE_KEY, JSON.stringify(students));
    } catch (e) {
      console.warn('Error guardant alumnes en local:', e);
    }
  }

  public async syncStudentProfile(profile: StudentProfile): Promise<void> {
    // 1. Always save in local storage
    const locals = this.getLocalStudents();
    const existingIdx = locals.findIndex((s) => s.id === profile.id);
    if (existingIdx >= 0) {
      locals[existingIdx] = profile;
    } else {
      locals.push(profile);
    }
    this.saveLocalStudents(locals);

    // 2. If connected to Firebase, save in Firestore collection 'alumnat_3reso'
    if (this.db) {
      try {
        const studentRef = doc(this.db, 'alumnat_3reso', profile.id);
        await setDoc(
          studentRef,
          {
            ...profile,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('No s\'ha pogut sincronitzar amb Firestore al núvol, guardat en local:', err);
      }
    }
  }

  public async getStudents(groupFilter?: StudentGroup | 'all'): Promise<StudentProfile[]> {
    // If Firebase is connected, try to fetch from Firestore first
    if (this.db) {
      try {
        const colRef = collection(this.db, 'alumnat_3reso');
        let q = query(colRef);
        if (groupFilter && groupFilter !== 'all') {
          q = query(colRef, where('group', '==', groupFilter));
        }

        const snapshot = await getDocs(q);
        const remoteStudents: StudentProfile[] = [];
        snapshot.forEach((docSnap) => {
          remoteStudents.push(docSnap.data() as StudentProfile);
        });

        if (remoteStudents.length > 0) {
          // Merge with local
          const localMap = new Map(this.getLocalStudents().map((s) => [s.id, s]));
          remoteStudents.forEach((r) => localMap.set(r.id, r));
          const merged = Array.from(localMap.values());
          this.saveLocalStudents(merged);
          return merged.filter((s) => !groupFilter || groupFilter === 'all' || s.group === groupFilter);
        }
      } catch (err) {
        console.warn('Error llegint de Firestore, fent servir dades locals:', err);
      }
    }

    // Fallback to local
    const locals = this.getLocalStudents();
    if (!groupFilter || groupFilter === 'all') {
      return locals;
    }
    return locals.filter((s) => s.group === groupFilter);
  }

  public exportCSV(students: StudentProfile[]): string {
    const headers = [
      'Nom Alumne/a',
      'Grup',
      'Exercicis Resolts',
      'Encerts a la primera',
      'Percentatge d\'encert',
      'Ratxa màxima',
      'Temps dedicat (min)',
      'Errors totals',
      'Última activitat',
    ];

    const rows = students.map((s) => {
      const accuracy = s.totalSolved > 0 ? Math.round((s.correctFirstTry / s.totalSolved) * 100) : 0;
      const groupLabel = s.group === 'repas' ? 'Repàs' : `Grup ${s.group}`;
      const totalSeconds = (s.sessions || []).reduce((acc, ses) => acc + (ses.timeSpentSeconds || 0), 0);
      const totalMinutes = (totalSeconds / 60).toFixed(1);
      const totalErrors = (s.sessions || []).reduce((acc, ses) => acc + (ses.mistakesCount || 0), 0);
      return [
        `"${s.name.replace(/"/g, '""')}"`,
        `"${groupLabel}"`,
        s.totalSolved,
        s.correctFirstTry,
        `"${accuracy}%"`,
        s.bestStreak,
        totalMinutes,
        totalErrors,
        `"${new Date(s.lastActive).toLocaleString('ca-ES')}"`,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }
}

export const firebaseService = new FirebaseService();
