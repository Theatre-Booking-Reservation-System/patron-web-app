import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';
import { TranslationKey } from '../../core/i18n/translations';

/**
 * Usage: {{ 'nav.home' | translate }}
 *
 * Impure so it re-evaluates when the active language changes, giving instant
 * switching across the whole UI. Lookups are simple object reads, so the cost
 * is negligible.
 */
@Pipe({
  name: 'translate',
  standalone: true,
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  private readonly language = inject(LanguageService);

  transform(key: TranslationKey | string): string {
    return this.language.translate(key as TranslationKey);
  }
}
