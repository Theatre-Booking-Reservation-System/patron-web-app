import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../../layout/header/header.component';
import { FooterComponent } from '../../../layout/footer/footer.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationKey } from '../../../core/i18n/translations';
import { LoyaltyService } from '../../../core/services/loyalty.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { BookingApiService } from '../../../core/services/booking-api.service';
import { CatalogueService } from '../../../core/services/catalogue.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { NotificationService } from '../../../core/services/notification.service';
import { BookingItem } from '../../../core/models/booking-api.models';
import { PerformanceResponse } from '../../../core/models/catalogue.models';

type BookingStatus = 'confirmed' | 'completed' | 'cancelled';

interface Booking {
  /** UUID used for the cancel endpoint. */
  id: string;
  /** Human-readable reference shown to the user. */
  bookingId: string;
  production: string;
  genreKey: TranslationKey;
  dateTime: string;
  /** ISO show date (yyyy-MM-dd) used for sorting. */
  sortDate: string;
  venue: string;
  seats: string;
  image: string;
  status: BookingStatus;
}

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [RouterLink, MatIconModule, HeaderComponent, FooterComponent, TranslatePipe],
  templateUrl: './my-bookings.component.html',
  styleUrl: './my-bookings.component.scss',
})
export class MyBookingsComponent {
  private readonly loyalty = inject(LoyaltyService);
  private readonly auth = inject(AuthService);
  private readonly bookingApi = inject(BookingApiService);
  private readonly catalogue = inject(CatalogueService);
  private readonly confirm = inject(ConfirmService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  readonly tab = signal<'upcoming' | 'past'>('upcoming');
  readonly loading = signal(false);
  readonly error = signal(false);

  // productionId → title / poster, from the catalogue.
  private readonly productionNameById = new Map<string, string>();
  private readonly productionImageById = new Map<string, string>();

  constructor() {
    const patronId = this.auth.user()?.userId;
    if (patronId) {
      // Load production names/posters first, then the patron's bookings.
      this.catalogue.searchProductions({ page: 0, size: 100 }).subscribe({
        next: (res) => {
          for (const p of res.content ?? []) {
            if (p.productionId) {
              this.productionNameById.set(p.productionId, p.title || '');
              if (p.posterImageUrl) this.productionImageById.set(p.productionId, p.posterImageUrl);
            }
          }
          this.loadBookings(patronId);
        },
        error: () => this.loadBookings(patronId),
      });
    }
  }

  private loadBookings(patronId: string): void {
    this.loading.set(true);
    this.error.set(false);
    this.bookingApi.getBookingsByPatronId(patronId).subscribe({
      next: (res) => {
        const items = res.bookings ?? [];
        if (!items.length) {
          this.all.set([]);
          this.loading.set(false);
          return;
        }
        // Look up each booking's performance for production + show date/time.
        forkJoin(
          items.map((b) =>
            b.performanceId
              ? this.catalogue.getPerformanceById(b.performanceId).pipe(catchError(() => of(null)))
              : of(null),
          ),
        ).subscribe((perfs) => {
          this.all.set(items.map((b, i) => this.toBooking(b, perfs[i])));
          this.loading.set(false);
        });
      },
      error: (err) => {
        this.loading.set(false);
        // A 403 means the session is no longer authorized for this user's data:
        // sign out and leave the dashboard so logged-in UI is hidden.
        if (err?.status === 403 || err?.status === 401) {
          this.forceLogout();
          return;
        }
        this.error.set(true);
      },
    });
  }

  /** Clear the session and return to a public page. */
  private forceLogout(): void {
    this.auth.logout();
    this.loyalty.cancel();
    this.router.navigateByUrl('/');
  }

  /** Map an API booking (+ its performance) to the row shape the template renders. */
  private toBooking(b: BookingItem, perf: PerformanceResponse | null): Booking {
    const seats = (b.seats ?? []).map((s) => s.seatRef).filter(Boolean).join(', ');
    const pid = perf?.productionId;
    const name = pid ? this.productionNameById.get(pid) : '';
    const image = (pid && this.productionImageById.get(pid)) || 'assets/curtain.png';
    return {
      id: b.bookingId,
      bookingId: b.bookingRef || b.bookingId,
      production: name || 'Booking',
      genreKey: 'nav.productions',
      dateTime: this.showDateTime(perf),
      sortDate: perf?.date ?? '',
      venue: 'Main Theatre, Sapumal Theatre',
      seats: seats || '—',
      image,
      status: this.rowStatus(b, perf),
    };
  }

  /**
   * Upcoming vs past is decided by the show date/time vs now:
   * cancelled → cancelled; show in the future → confirmed (upcoming);
   * show already passed → completed (past).
   */
  private rowStatus(b: BookingItem, perf: PerformanceResponse | null): BookingStatus {
    if (b.status === 'CANCELLED_PATRON' || b.status === 'CANCELLED_ADMIN' || b.status === 'EXPIRED') {
      return 'cancelled';
    }
    const showAt = this.performanceDateTime(perf);
    if (showAt && showAt.getTime() < Date.now()) return 'completed';
    return 'confirmed';
  }

  /** Combine the performance date + time into a Date, or null if unavailable. */
  private performanceDateTime(perf: PerformanceResponse | null): Date | null {
    if (!perf?.date) return null;
    const time = (perf.time && /^\d{1,2}:\d{2}/.test(perf.time) ? perf.time : '00:00').slice(0, 8);
    const dt = new Date(`${perf.date}T${time}`);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }

  /** Confirm, then cancel the booking via PUT /bookings/{id}/cancel. */
  cancelBooking(b: Booking): void {
    this.confirm.open({
      icon: 'cancel',
      title: 'mb.cancelConfirmTitle',
      message: 'mb.cancelConfirmText',
      confirmText: 'mb.cancelConfirmYes',
      cancelText: 'mb.cancelConfirmNo',
      onConfirm: () => this.doCancel(b),
    });
  }

  private doCancel(b: Booking): void {
    this.bookingApi.cancelBooking(b.id).subscribe({
      next: (res) => {
        const cancelled =
          res.status === 'CANCELLED_PATRON' ||
          res.status === 'CANCELLED_ADMIN' ||
          !!res.bookingId ||
          !!res.bookingRef;
        if (!cancelled) {
          this.notifications.showError({
            title: 'Cancel failed',
            message: res.statusDescription || 'Could not cancel this booking.',
            code: res.statusCode,
          });
          return;
        }
        // Reflect the cancellation locally.
        this.all.update((list) =>
          list.map((x) => (x.id === b.id ? { ...x, status: 'cancelled' as BookingStatus } : x)),
        );
      },
      error: () => {
        // The error interceptor surfaces a modal.
      },
    });
  }

  /** "28 Sep 2026, 3:58 PM" from the performance's date + time. */
  private showDateTime(perf: PerformanceResponse | null): string {
    if (!perf?.date) return '';
    const date = new Date(perf.date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const time = this.clockLabel(perf.time);
    return time ? `${date}, ${time}` : date;
  }

  /** "3:58 PM" from an HH:mm(:ss) string. */
  private clockLabel(time: string | undefined): string {
    if (!time) return '';
    const [hStr, mStr] = time.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr ?? '0', 10);
    if (Number.isNaN(h)) return '';
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hr12 = ((h + 11) % 12) + 1;
    return `${hr12}:${`${Number.isNaN(m) ? 0 : m}`.padStart(2, '0')} ${ampm}`;
  }

  // Loyalty program state for the dashboard promo card.
  readonly isMember = this.loyalty.isMember;
  readonly loyaltyHighlights: { icon: string; textKey: TranslationKey }[] = [
    { icon: 'sell', textKey: 'loyalty.benefit1Title' },
    { icon: 'schedule', textKey: 'loyalty.benefit2Title' },
  ];

  readonly enrolling = signal(false);

  enrollLoyalty(): void {
    this.enrolling.set(true);
    this.loyalty.enroll().subscribe({
      next: () => this.enrolling.set(false),
      error: () => this.enrolling.set(false),
    });
  }

  // Bookings loaded from GET /patrons/{id}/bookings.
  private readonly all = signal<Booking[]>([]);

  // Upcoming: soonest show first. Past: most recent show first.
  readonly upcoming = computed(() =>
    this.all()
      .filter((b) => b.status === 'confirmed')
      .sort((a, b) => a.sortDate.localeCompare(b.sortDate)),
  );
  readonly past = computed(() =>
    this.all()
      .filter((b) => b.status === 'completed' || b.status === 'cancelled')
      .sort((a, b) => b.sortDate.localeCompare(a.sortDate)),
  );

  readonly visible = computed(() => (this.tab() === 'upcoming' ? this.upcoming() : this.past()));

  setTab(t: 'upcoming' | 'past'): void {
    this.tab.set(t);
  }

  statusKey(status: BookingStatus): TranslationKey {
    return `mb.status.${status}` as TranslationKey;
  }
}
