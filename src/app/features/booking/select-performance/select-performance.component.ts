import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../../layout/header/header.component';
import { FooterComponent } from '../../../layout/footer/footer.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { BookingStateService } from '../../../core/services/booking-state.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoyaltyService } from '../../../core/services/loyalty.service';
import { CatalogueService } from '../../../core/services/catalogue.service';
import { isPoya } from '../../../core/booking/catalogue.data';
import { Performance } from '../../../core/models/booking.models';
import { PerformanceItem } from '../../../core/models/catalogue.models';
import { TranslationKey } from '../../../core/i18n/translations';

interface DayCell {
  day: number;
  iso: string;
  hasShows: boolean;
  poya: boolean;
}

@Component({
  selector: 'app-select-performance',
  standalone: true,
  imports: [RouterLink, MatIconModule, HeaderComponent, FooterComponent, TranslatePipe],
  templateUrl: './select-performance.component.html',
  styleUrl: './select-performance.component.scss',
})
export class SelectPerformanceComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly loyalty = inject(LoyaltyService);
  private readonly catalogue = inject(CatalogueService);
  readonly booking = inject(BookingStateService);

  // Loyalty card state (only shown when signed in).
  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly isMember = this.loyalty.isMember;
  readonly loyaltyConditions: TranslationKey[] = [
    'loyalty.cond1',
    'loyalty.cond2',
    'loyalty.cond3',
  ];

  readonly weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Performances loaded from the catalogue service.
  private readonly allPerfs = signal<Performance[]>([]);
  readonly loading = signal(false);
  readonly error = signal(false);

  // The month currently shown by the calendar (defaults to the first show month).
  readonly viewYear = signal<number>(new Date().getFullYear());
  readonly viewMonth0 = signal<number>(new Date().getMonth());

  readonly selectedDate = signal<string | null>(null);
  readonly selectedPerf = signal<Performance | null>(null);

  readonly monthLabel = computed(() =>
    new Date(this.viewYear(), this.viewMonth0(), 1).toLocaleDateString('en-GB', {
      month: 'long',
      year: 'numeric',
    }),
  );

  constructor() {
    const prod = this.booking.draft().production;
    if (prod) this.loadPerformances(prod.id);
  }

  private loadPerformances(productionId: string): void {
    this.loading.set(true);
    this.error.set(false);
    this.catalogue.getPerformancesByProductionId(productionId).subscribe({
      next: (res) => {
        const perfs = (res.performances ?? [])
          .filter((pf) => pf.date && (pf.status === undefined || pf.status === 1))
          .map((pf) => this.toPerformance(pf, productionId))
          .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.time.localeCompare(b.time)));
        this.allPerfs.set(perfs);

        // Jump the calendar to the first month that actually has a show.
        if (perfs.length) {
          const first = new Date(perfs[0].date);
          this.viewYear.set(first.getFullYear());
          this.viewMonth0.set(first.getMonth());
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }

  private toPerformance(pf: PerformanceItem, productionId: string): Performance {
    const isMatinee = pf.sessionType === 'MATINEE';
    return {
      id: pf.performanceId,
      productionId,
      date: pf.date!,
      time: isMatinee ? 'matinee' : 'evening',
      clockLabel: this.clockLabel(pf.time, isMatinee),
      availability: 'available',
    };
  }

  /** "7:00 PM" from an HH:mm(:ss) time, falling back to a session default. */
  private clockLabel(time: string | undefined, isMatinee: boolean): string {
    if (time) {
      const [hStr, mStr] = time.split(':');
      const h = parseInt(hStr, 10);
      const m = parseInt(mStr ?? '0', 10);
      if (!Number.isNaN(h)) {
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hr12 = ((h + 11) % 12) + 1;
        return `${hr12}:${`${Number.isNaN(m) ? 0 : m}`.padStart(2, '0')} ${ampm}`;
      }
    }
    return isMatinee ? '3:00 PM' : '7:00 PM';
  }

  readonly calendar = computed<DayCell[]>(() => {
    const year = this.viewYear();
    const month0 = this.viewMonth0();
    const first = new Date(year, month0, 1);
    const daysInMonth = new Date(year, month0 + 1, 0).getDate();
    const startOffset = (first.getDay() + 6) % 7; // Monday-first
    const showDates = new Set(this.allPerfs().map((p) => p.date));

    const cells: DayCell[] = [];
    for (let i = 0; i < startOffset; i++) {
      cells.push({ day: 0, iso: `pad-${i}`, hasShows: false, poya: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${year}-${`${month0 + 1}`.padStart(2, '0')}-${`${d}`.padStart(2, '0')}`;
      cells.push({ day: d, iso, hasShows: showDates.has(iso), poya: isPoya(iso) });
    }
    return cells;
  });

  readonly showsForSelected = computed<Performance[]>(() => {
    const date = this.selectedDate();
    return date ? this.allPerfs().filter((p) => p.date === date) : [];
  });

  prevMonth(): void {
    const m = this.viewMonth0();
    if (m === 0) {
      this.viewMonth0.set(11);
      this.viewYear.update((y) => y - 1);
    } else {
      this.viewMonth0.set(m - 1);
    }
  }

  nextMonth(): void {
    const m = this.viewMonth0();
    if (m === 11) {
      this.viewMonth0.set(0);
      this.viewYear.update((y) => y + 1);
    } else {
      this.viewMonth0.set(m + 1);
    }
  }

  selectDate(cell: DayCell): void {
    if (!cell.hasShows) return;
    this.selectedDate.set(cell.iso);
    this.selectedPerf.set(null);
  }

  selectPerf(p: Performance): void {
    this.selectedPerf.set(p);
  }

  readonly enrolling = signal(false);

  /**
   * Enrol in the loyalty programme. If not signed in, redirect to login and
   * return to this page afterwards via returnUrl.
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

  continue(): void {
    const perf = this.selectedPerf();
    const prod = this.booking.draft().production;
    if (!perf || !prod) return;
    this.booking.setPerformance(perf);
    this.router.navigate(['/book', prod.id, 'seats']);
  }
}
