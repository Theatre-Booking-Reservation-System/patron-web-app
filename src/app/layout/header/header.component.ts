import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { LanguageService } from '../../core/services/language.service';
import { ThemeService } from '../../core/services/theme.service';
import { Lang } from '../../core/i18n/translations';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule, TranslatePipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private readonly language = inject(LanguageService);
  private readonly themeService = inject(ThemeService);

  readonly languages = this.language.languages;
  readonly activeLang = this.language.lang;
  readonly theme = this.themeService.theme;

  readonly langOpen = signal(false);
  readonly menuOpen = signal(false);

  get activeShort(): string {
    return this.languages.find((l) => l.code === this.activeLang())?.short ?? 'EN';
  }

  toggleLang(): void {
    this.langOpen.update((v) => !v);
  }

  selectLang(code: Lang): void {
    this.language.set(code);
    this.langOpen.set(false);
  }

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  // Close the language dropdown when clicking outside of it.
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.header__lang')) {
      this.langOpen.set(false);
    }
  }
}
