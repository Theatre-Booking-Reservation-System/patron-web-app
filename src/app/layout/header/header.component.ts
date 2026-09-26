import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { LanguageService } from '../../core/services/language.service';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { LoyaltyService } from '../../core/services/loyalty.service';
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
  private readonly auth = inject(AuthService);
  private readonly loyalty = inject(LoyaltyService);
  private readonly router = inject(Router);

  readonly languages = this.language.languages;
  readonly activeLang = this.language.lang;
  readonly theme = this.themeService.theme;

  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly user = this.auth.user;

  readonly langOpen = signal(false);
  readonly menuOpen = signal(false);
  readonly userOpen = signal(false);

  get activeShort(): string {
    return this.languages.find((l) => l.code === this.activeLang())?.short ?? 'EN';
  }

  /** Initials for the avatar, e.g. "Sarasi Sumiyana" -> "SS". */
  get initials(): string {
    const name = this.user()?.name?.trim();
    if (!name) return 'U';
    const parts = name.split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
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

  toggleUser(): void {
    this.userOpen.update((v) => !v);
  }

  logout(): void {
    this.userOpen.set(false);
    // Clear the full session: auth token/user and cached loyalty membership.
    this.auth.logout();
    this.loyalty.cancel();
    // Return to a public page (never leave the user on a guarded route).
    this.router.navigateByUrl('/');
  }

  // Close dropdowns when clicking outside of them.
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.header__lang')) {
      this.langOpen.set(false);
    }
    if (!target.closest('.header__user')) {
      this.userOpen.set(false);
    }
  }
}
