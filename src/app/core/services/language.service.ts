import { Injectable, computed, effect, signal } from '@angular/core';
import { Lang, LANGUAGES, TranslationKey, translations } from '../i18n/translations';

const STORAGE_KEY = 'sapumal-patron-lang';

/**
 * Owns the active UI language. The choice is a signal so the whole UI
 * re-renders instantly when it changes, and it is persisted to localStorage.
 * English is the default and the fallback for any missing translation key.
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  readonly lang = signal<Lang>(this.initial());

  /** All selectable languages (for the switcher). */
  readonly languages = LANGUAGES;

  /** The currently active dictionary. */
  readonly dictionary = computed(() => translations[this.lang()]);

  constructor() {
    // Reflect the language on <html lang="…"> and persist it.
    effect(() => {
      const code = this.lang();
      document.documentElement.setAttribute('lang', code);
      try {
        localStorage.setItem(STORAGE_KEY, code);
      } catch {
        /* storage may be unavailable; ignore */
      }
    });
  }

  set(code: Lang): void {
    this.lang.set(code);
  }

  /** Translate a key for the active language, falling back to English then the key. */
  translate(key: TranslationKey): string {
    const active = translations[this.lang()] as Record<string, string>;
    const fallback = translations.en as Record<string, string>;
    return active[key] ?? fallback[key] ?? key;
  }

  private initial(): Lang {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
      if (saved && LANGUAGES.some((l) => l.code === saved)) return saved;
    } catch {
      /* ignore */
    }
    return 'en';
  }
}
