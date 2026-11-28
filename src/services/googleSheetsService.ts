/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StudentProfile } from '../types/student';

const GOOGLE_SCRIPT_URL_STORAGE_KEY = 'algebra_3reso_gsheet_url_v2';

export const DEFAULT_GOOGLE_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycby4EHYpW6kCFP3Ac2iNV87gn4DiIqVhCGo8HZ0n3Zls_0rENoUQqmCnv_oaI6N6JhIT0g/exec';

export interface GoogleSheetEventPayload {
  eventType: 'login' | 'exercise';
  level?: string;
  exerciseId?: string;
  isFirstTry?: boolean;
  timeSpentSeconds?: number;
  mistakesCount?: number;
  errorTypes?: string[];
}

class GoogleSheetsService {
  private scriptUrl: string = DEFAULT_GOOGLE_SCRIPT_URL;

  constructor() {
    this.loadStoredUrl();
  }

  private loadStoredUrl() {
    try {
      const saved = localStorage.getItem(GOOGLE_SCRIPT_URL_STORAGE_KEY);
      if (saved && saved.trim().startsWith('https://script.google.com/')) {
        this.scriptUrl = saved.trim();
      } else {
        this.scriptUrl = DEFAULT_GOOGLE_SCRIPT_URL;
      }
    } catch {
      this.scriptUrl = DEFAULT_GOOGLE_SCRIPT_URL;
    }
  }

  public getScriptUrl(): string {
    return this.scriptUrl;
  }

  public setScriptUrl(url: string): boolean {
    const trimmed = url.trim();
    if (!trimmed.startsWith('https://script.google.com/')) {
      return false;
    }
    this.scriptUrl = trimmed;
    try {
      localStorage.setItem(GOOGLE_SCRIPT_URL_STORAGE_KEY, trimmed);
    } catch {
      // ignore storage errors
    }
    return true;
  }

  public isConfigured(): boolean {
    return Boolean(this.scriptUrl && this.scriptUrl.startsWith('https://script.google.com/'));
  }

  public async sendEvent(
    profile: StudentProfile,
    event: GoogleSheetEventPayload
  ): Promise<void> {
    if (!this.isConfigured()) return;

    const totalTimeSeconds = (profile.sessions || []).reduce(
      (acc, s) => acc + (s.timeSpentSeconds || 0),
      0
    );
    const totalErrors = (profile.sessions || []).reduce(
      (acc, s) => acc + (s.mistakesCount || 0),
      0
    );

    const payload = {
      studentId: profile.id,
      name: profile.name,
      course: profile.course || '3r ESO',
      group: profile.group,
      totalSolved: profile.totalSolved,
      correctFirstTry: profile.correctFirstTry,
      bestStreak: profile.bestStreak,
      totalTimeSeconds,
      totalErrors,
      eventType: event.eventType,
      level: event.level || '-',
      exerciseId: event.exerciseId || '-',
      isFirstTry: Boolean(event.isFirstTry),
      timeSpentSeconds: event.timeSpentSeconds ?? 0,
      mistakesCount: event.mistakesCount ?? 0,
      errorTypes: event.errorTypes || [],
    };

    try {
      await fetch(this.scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
        keepalive: true,
      });
    } catch (err) {
      console.warn('Error enviant dades a Google Sheets:', err);
    }
  }

  public async testConnection(urlToTest?: string): Promise<{ success: boolean; message: string }> {
    const targetUrl = (urlToTest || this.scriptUrl).trim();
    if (!targetUrl.startsWith('https://script.google.com/')) {
      return {
        success: false,
        message: 'La URL ha de començar per https://script.google.com/',
      };
    }

    try {
      const response = await fetch(targetUrl, { method: 'GET', redirect: 'follow' });
      if (response.ok) {
        const data = await response.json().catch(() => null);
        return {
          success: true,
          message: data?.message || 'Connexió correcta amb Google Sheets!',
        };
      }
      return {
        success: false,
        message: `El servidor ha respost amb estat ${response.status}. Comprova que l'Apps Script estigui desplegat per a "Tothom".`,
      };
    } catch {
      return {
        success: false,
        message: 'No s\'ha pogut comprovar directament pel bloqueig CORS del navegador, però l\'enviament en segon pla (POST) funciona si el desplegament és públic ("Tothom").',
      };
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
