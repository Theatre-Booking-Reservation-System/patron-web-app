import { Component, HostListener, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationKey } from '../../core/i18n/translations';
import { AuthService } from '../../core/services/auth.service';
import { LoyaltyService } from '../../core/services/loyalty.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { CatalogueService } from '../../core/services/catalogue.service';
import { ProductionItem } from '../../core/models/catalogue.models';

interface ShowCard {
  id: string;
  name: string;
  genreKey: TranslationKey;
  dateRange: string;
  venue: string;
  image: string;
  /** True while the production is in the members-only pre-release window. */
  earlyAccess?: boolean;
}

interface UpcomingBooking {
  bookingId: string;
  production: string;
  dateTime: string;
  seats: string;
  image: string;
}

interface HeroSlide {
  image: string;
  titleKey: TranslationKey;
  subtitleKey: TranslationKey;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, RouterLink, MatIconModule, HeaderComponent, FooterComponent, TranslatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly loyalty = inject(LoyaltyService);
  private readonly confirm = inject(ConfirmService);
  private readonly catalogue = inject(CatalogueService);

  readonly isAuthenticated = this.auth.isAuthenticated;

  /** First name for the greeting, e.g. "Sarasi Sumiyana" -> "Sarasi". */
  get firstName(): string {
    return this.auth.user()?.name?.trim().split(/\s+/)[0] ?? '';
  }

  // Placeholder upcoming bookings for the signed-in patron.
  readonly myUpcoming: UpcomingBooking[] = [
    {
      bookingId: 'BK20250524-001',
      production: 'Sanda Katha',
      dateTime: '24 May 2025, 7:00 PM',
      seats: 'C12, C13',
      image: 'assets/bg1.jpeg',
    },
    {
      bookingId: 'BK20250610-014',
      production: 'Yathra Oruwa',
      dateTime: '10 Jun 2025, 3:00 PM',
      seats: 'A5, A6',
      image: 'assets/loginBg.png',
    },
  ];

  // Hero carousel slides — images live in /public/assets.
  readonly slides: HeroSlide[] = [
    { image: 'assets/slide1.png', titleKey: 'hero.title', subtitleKey: 'hero.subtitle' },
    { image: 'assets/slide2.png', titleKey: 'hero.title2', subtitleKey: 'hero.subtitle2' },
    { image: 'assets/slide3.png', titleKey: 'hero.title3', subtitleKey: 'hero.subtitle3' },
  ];

  readonly current = signal(0);
  private timer?: ReturnType<typeof setInterval>;

  // Search bar model
  query = '';
  dateFrom = ''; // ISO yyyy-mm-dd
  dateTo = ''; // ISO yyyy-mm-dd

  // Category dropdown (matches the admin genre list)
  readonly categories: { value: string; labelKey: TranslationKey }[] = [
    { value: '', labelKey: 'home.allCategories' },
    { value: 'drama', labelKey: 'genre.drama' },
    { value: 'musical', labelKey: 'genre.musical' },
    { value: 'comedy', labelKey: 'genre.comedy' },
    { value: 'dance', labelKey: 'genre.dance' },
    { value: 'opera', labelKey: 'genre.opera' },
    { value: 'children', labelKey: 'genre.children' },
  ];
  readonly category = signal('');
  readonly catOpen = signal(false);

  get categoryLabelKey(): TranslationKey {
    return (
      this.categories.find((c) => c.value === this.category())?.labelKey ?? 'home.allCategories'
    );
  }

  toggleCategory(): void {
    this.catOpen.update((v) => !v);
  }

  selectCategory(value: string): void {
    this.category.set(value);
    this.catOpen.set(false);
  }

  ngOnInit(): void {
    this.startAutoPlay();
    this.loadProductions();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  next(): void {
    this.current.update((i) => (i + 1) % this.slides.length);
    this.restart();
  }

  prev(): void {
    this.current.update((i) => (i - 1 + this.slides.length) % this.slides.length);
    this.restart();
  }

  goTo(i: number): void {
    this.current.set(i);
    this.restart();
  }

  private startAutoPlay(): void {
    this.timer = setInterval(() => {
      this.current.update((i) => (i + 1) % this.slides.length);
    }, 6000);
  }

  private stopAutoPlay(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private restart(): void {
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  /** Open the native calendar reliably (supported in modern browsers). */
  openDatePicker(input: HTMLInputElement): void {
    try {
      input.showPicker?.();
    } catch {
      input.focus();
    }
  }

  onSearch(event: Event): void {
    event.preventDefault();
    const queryParams: Record<string, string> = {};
    if (this.query.trim()) queryParams['q'] = this.query.trim();
    if (this.dateFrom) queryParams['from'] = this.dateFrom;
    if (this.dateTo) queryParams['to'] = this.dateTo;
    if (this.category()) queryParams['category'] = this.category();
    this.router.navigate(['/productions'], { queryParams });
  }

  // Close the category menu when clicking outside of it.
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.search__category')) {
      this.catOpen.set(false);
    }
  }

  // Productions loaded from the catalogue service (/productions/search).
  readonly nowShowing = signal<ShowCard[]>([]);
  readonly upcoming = signal<ShowCard[]>([]);
  readonly loadingShows = signal(false);
  readonly showsError = signal(false);

  /** Load all productions and split into now-showing vs upcoming. */
  private loadProductions(): void {
    this.loadingShows.set(true);
    this.showsError.set(false);
    // size large enough to surface the full catalogue; newest release first.
    this.catalogue.searchProductions({ page: 0, size: 100, sort: 'releaseDate,desc' }).subscribe({
      next: (res) => {
        const items = res.content ?? [];
        const today = new Date().toISOString().split('T')[0];
        // Home shows at most 4 in each section.
        this.nowShowing.set(
          items
            .filter((p) => !p.releaseDate || p.releaseDate <= today)
            .slice(0, 4)
            .map((p) => this.toCard(p, false)),
        );
        this.upcoming.set(
          items
            .filter((p) => p.releaseDate && p.releaseDate > today)
            .slice(0, 4)
            .map((p) => this.toCard(p, true)),
        );
        this.loadingShows.set(false);
      },
      error: () => {
        this.loadingShows.set(false);
        this.showsError.set(true);
      },
    });
  }

  /** Map an API production to a home ShowCard for the current UI language. */
  private toCard(p: ProductionItem, earlyAccess: boolean): ShowCard {
    return {
      id: p.productionId,
      name: this.titleFor(p),
      genreKey: this.genreKey(p.genre),
      dateRange: this.dateRange(p.releaseDate, p.endDate),
      venue: 'Main Theatre, Sapumal Theatre',
      image: p.posterImageUrl || 'assets/curtain.png',
      earlyAccess: earlyAccess || undefined,
    };
  }

  /** Production title. */
  private titleFor(p: ProductionItem): string {
    return p.title || '';
  }

  /** Map the backend genre string to a translation key, else show it raw. */
  private genreKey(genre: string | undefined): TranslationKey {
    const g = (genre ?? '').trim().toLowerCase();
    const known = ['drama', 'musical', 'comedy', 'dance', 'opera', 'children', 'historical', 'cultural'];
    return (known.includes(g) ? `genre.${g}` : 'genre.drama') as TranslationKey;
  }

  /** Format "01 Sep – 15 Sep 2025" from ISO release/end dates. */
  private dateRange(from: string | undefined, to: string | undefined): string {
    const fmt = (iso?: string) =>
      iso
        ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : '';
    const a = fmt(from);
    const b = fmt(to);
    if (a && b) return `${a} – ${b}`;
    return a || b || '';
  }

  readonly isLoyaltyMember = this.loyalty.isMember;

  /**
   * Cards always navigate to the details page (everyone can view details).
   * The booking gate itself lives on the details page's "Book" action.
   * Here we only surface the "members book early" hint on the card.
   */
  membersOnly(card: ShowCard): boolean {
    return !!card.earlyAccess && !this.isLoyaltyMember();
  }
}
