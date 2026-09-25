import { Injectable, computed, signal } from '@angular/core';
import {
  BookingDraft,
  ConcessionType,
  Performance,
  Production,
  SelectedSeat,
} from '../models/booking.models';
import { concessionByType } from '../booking/pricing';

const BOOKING_FEE = 100; // flat LKR booking fee, matches the mockup

function emptyDraft(): BookingDraft {
  return {
    seats: [],
    concession: 'none',
    fullName: '',
    email: '',
    phone: '',
    idNumber: '',
    specialRequests: '',
  };
}

/**
 * Holds the in-progress booking as it moves through the flow steps
 * (production → performance → seats → details → payment → confirmation).
 * Signal-based so every step reacts to changes and totals recompute live.
 */
@Injectable({ providedIn: 'root' })
export class BookingStateService {
  private readonly _draft = signal<BookingDraft>(emptyDraft());
  readonly draft = this._draft.asReadonly();

  /** Set once payment succeeds, so confirmation + e-ticket share one reference. */
  readonly bookingId = signal<string | null>(null);

  // Derived totals
  readonly subtotal = computed(() => this._draft().seats.reduce((sum, s) => sum + s.price, 0));

  readonly concessionOption = computed(() => concessionByType(this._draft().concession));

  readonly discount = computed(() => Math.round(this.subtotal() * this.concessionOption().discount));

  readonly bookingFee = computed(() => (this._draft().seats.length ? BOOKING_FEE : 0));

  readonly total = computed(() => this.subtotal() - this.discount() + this.bookingFee());

  /** True when a concession is claimed that needs NIC/passport verification. */
  readonly requiresId = computed(() => this.concessionOption().requiresId);

  setProduction(production: Production): void {
    this._draft.update((d) => ({ ...d, production }));
  }

  setPerformance(performance: Performance): void {
    this._draft.update((d) => ({ ...d, performance }));
  }

  setSeats(seats: SelectedSeat[]): void {
    this._draft.update((d) => ({ ...d, seats }));
  }

  setConcession(concession: ConcessionType): void {
    this._draft.update((d) => ({ ...d, concession }));
  }

  patchDetails(partial: Partial<BookingDraft>): void {
    this._draft.update((d) => ({ ...d, ...partial }));
  }

  reset(): void {
    this._draft.set(emptyDraft());
    this.bookingId.set(null);
  }

  /** Generates and stores a booking reference for the confirmation/ticket. */
  confirmBooking(): string {
    const existing = this.bookingId();
    if (existing) return existing;
    const now = new Date();
    const y = now.getFullYear();
    const m = `${now.getMonth() + 1}`.padStart(2, '0');
    const d = `${now.getDate()}`.padStart(2, '0');
    const rand = Math.floor(100 + Math.random() * 900);
    const id = `BK${y}${m}${d}-${rand}`;
    this.bookingId.set(id);
    return id;
  }
}
