import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../../layout/header/header.component';
import { FooterComponent } from '../../../layout/footer/footer.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { BookingStateService } from '../../../core/services/booking-state.service';
import { LoyaltyService } from '../../../core/services/loyalty.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { CatalogueService } from '../../../core/services/catalogue.service';
import { Production, ProductionLang } from '../../../core/models/booking.models';
import { ApiLanguage, ProductionResponse } from '../../../core/models/catalogue.models';
import { TranslationKey } from '../../../core/i18n/translations';

type Tab = 'about' | 'cast';

@Component({
  selector: 'app-production-details',
  standalone: true,
  imports: [RouterLink, MatIconModule, HeaderComponent, FooterComponent, TranslatePipe],
  templateUrl: './production-details.component.html',
  styleUrl: './production-details.component.scss',
})
export class ProductionDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly booking = inject(BookingStateService);
  private readonly loyalty = inject(LoyaltyService);
  private readonly auth = inject(AuthService);
  private readonly confirm = inject(ConfirmService);
  private readonly catalogue = inject(CatalogueService);

  readonly production = signal<Production | undefined>(undefined);
  readonly loading = signal(false);
  readonly error = signal(false);
  readonly isMember = this.loyalty.isMember;
  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly enrolling = signal(false);
  readonly tab = signal<Tab>('about');

  // Loyalty conditions shown in the enrol banner.
  readonly loyaltyConditions: TranslationKey[] = [
    'loyalty.cond1',
    'loyalty.cond2',
    'loyalty.cond3',
  ];

  // Cast/crew credits (role + name), from the production's castCrew.
  readonly cast = signal<{ role: string; name: string }[]>([]);

  // Scheduled performances (date + time) for the show-dates card.
  readonly showDates = signal<{ date: string; time: string }[]>([]);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    if (id) {
      this.loadProduction(id);
      this.loadPerformances(id);
    }
  }

  private loadPerformances(id: string): void {
    this.catalogue.getPerformancesByProductionId(id).subscribe({
      next: (res) => {
        const rows = (res.performances ?? [])
          .filter((pf) => pf.date)
          .sort((a, b) => (a.date! < b.date! ? -1 : 1))
          .map((pf) => ({
            date: new Date(pf.date!).toLocaleDateString('en-GB', {
              weekday: 'short',
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
            time: this.clockLabel(pf.time, pf.sessionType),
          }));
        this.showDates.set(rows);
      },
    });
  }

  /** Format a performance time like "7:00 PM · Evening". */
  private clockLabel(time: string | undefined, session: string | undefined): string {
    let label = '';
    if (time) {
      const [h, m] = time.split(':').map((n) => parseInt(n, 10));
      if (!Number.isNaN(h)) {
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hr12 = ((h + 11) % 12) + 1;
        label = `${hr12}:${`${m || 0}`.padStart(2, '0')} ${ampm}`;
      }
    }
    if (session) {
      const s = session === 'MATINEE' ? 'Matinee' : session === 'EVENING' ? 'Evening' : session;
      label = label ? `${label} · ${s}` : s;
    }
    return label;
  }

  private loadProduction(id: string): void {
    this.loading.set(true);
    this.error.set(false);
    this.catalogue.getProductionById(id).subscribe({
      next: (res) => {
        if (!res.productionId) {
          this.error.set(true);
          this.loading.set(false);
          return;
        }
        this.production.set(this.toProduction(res));
        this.cast.set(
          (res.castCrew ?? [])
            .filter((c) => c.key || c.value)
            .map((c) => ({ role: c.key ?? '', name: c.value ?? '' })),
        );
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }

  /** Map an API production to the internal Production used across the booking flow. */
  private toProduction(p: ProductionResponse): Production {
    const today = new Date().toISOString().split('T')[0];

    return {
      id: p.productionId,
      name: p.title || '',
      genreKey: this.genreKey(p.genre),
      language: this.langFrom(p.language),
      dateRange: this.dateRange(p.releaseDate, p.endDate),
      basePrice: p.baseTicketCost ?? 0,
      durationLabel: this.durationLabel(p.duration),
      ageLabel: p.ageRestriction ? `Suitable for ${p.ageRestriction}` : '',
      venue: 'Main Theatre, Sapumal Theatre',
      rating: 0,
      reviews: 0,
      synopsis: p.description || '',
      image: p.posterImageUrl || 'assets/curtain.png',
      earlyAccess: !!p.releaseDate && p.releaseDate > today,
    };
  }

  private langFrom(lang: ApiLanguage | undefined): ProductionLang {
    return lang === 'SINHALA' ? 'si' : lang === 'TAMIL' ? 'ta' : 'en';
  }

  /** "Approx. 2h 20m" — treats a bare number as minutes. */
  private durationLabel(duration: string | undefined): string {
    if (!duration) return '';
    const d = duration.trim();
    if (/^\d+$/.test(d)) {
      const mins = parseInt(d, 10);
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      const parts = [h ? `${h}h` : '', m ? `${m}m` : ''].filter(Boolean).join(' ');
      return `Approx. ${parts || `${mins}m`}`;
    }
    return `Approx. ${d}`;
  }

  private genreKey(genre: string | undefined): TranslationKey {
    const g = (genre ?? '').trim().toLowerCase();
    const known = ['drama', 'musical', 'comedy', 'dance', 'opera', 'children', 'historical', 'cultural'];
    return (known.includes(g) ? `genre.${g}` : 'genre.drama') as TranslationKey;
  }

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

  setTab(t: Tab): void {
    this.tab.set(t);
  }

  /**
   * Enrol in the loyalty programme. If the user isn't signed in, send them to
   * login and return to this page afterwards via returnUrl.
   */
  enrollLoyalty(): void {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }
    this.enrolling.set(true);
    this.loyalty.enroll().subscribe({
      next: () => this.enrolling.set(false),
      error: () => this.enrolling.set(false),
    });
  }

  bookTickets(): void {
    const p = this.production();
    if (!p) return;

    // Early-access productions can only be booked by loyalty members before release.
    if (p.earlyAccess && !this.loyalty.isMember()) {
      this.confirm.open({
        icon: 'workspace_premium',
        title: 'earlyModal.title',
        message: 'earlyModal.text',
        confirmText: 'earlyModal.enroll',
        cancelText: 'earlyModal.cancel',
        onConfirm: () => {
          this.loyalty.enroll().subscribe({
            next: () => this.proceed(p),
          });
        },
      });
      return;
    }

    this.proceed(p);
  }

  private proceed(p: Production): void {
    this.booking.setProduction(p);
    this.router.navigate(['/book', p.id, 'performance']);
  }
}
