import { Injectable, effect, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'sapumal-patron-theme';

/**
 * Owns the app colour theme. Writes a `data-theme` attribute on <html> which
 * the CSS custom properties in styles.scss react to, so the whole UI recolours
 * instantly. The choice is persisted to localStorage.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<ThemeMode>(this.initial());

  constructor() {
    // Keep the DOM + storage in sync whenever the signal changes.
    effect(() => {
      const mode = this.theme();
      document.documentElement.setAttribute('data-theme', mode);
      try {
        localStorage.setItem(STORAGE_KEY, mode);
      } catch {
        /* storage may be unavailable; ignore */
      }
    });
  }

  toggle(): void {
    this.theme.update((m) => (m === 'light' ? 'dark' : 'light'));
  }

  set(mode: ThemeMode): void {
    this.theme.set(mode);
  }

  private initial(): ThemeMode {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      /* ignore */
    }
    // Respect the OS preference on first visit, else default to light.
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }
}
