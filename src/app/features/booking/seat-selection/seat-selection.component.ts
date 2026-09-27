import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../../layout/header/header.component';
import { FooterComponent } from '../../../layout/footer/footer.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { BookingStateService } from '../../../core/services/booking-state.service';
import { AuthService } from '../../../core/services/auth.service';
import { SeatService } from '../../../core/services/seat.service';
import { SeatLocation, SeatStatus, SelectedSeat } from '../../../core/models/booking.models';
import {
  PerformanceSeatItem,
  PerformanceSeatStatus,
  SeatSection,
  SeatZoneListResponse,
} from '../../../core/models/seat.models';

/** A seat backed by the seat service, with the info needed to render + price it. */
interface ApiSeat {
  /** Stable unique key for selection/tracking (seatId, else composite). */
  key: string;
  seatId: string;
  zoneId: string;
  section: string;
  location: SeatLocation;
  zoneName: string;
  row: string;
  number: number;
  status: SeatStatus;
  price: number;
}

interface SeatRow {
  row: string;
  seats: ApiSeat[];
}
interface LocationGroup {
  location: SeatLocation;
  label: string;
  rows: SeatRow[];
}

const LOCATION_LABEL: Record<SeatLocation, string> = {
  stalls: 'Stalls',
  circle: 'Circle',
  upperCircle: 'Upper Circle',
};

@Component({
  selector: 'app-seat-selection',
  standalone: true,
  imports: [RouterLink, MatIconModule, HeaderComponent, FooterComponent, TranslatePipe],
  templateUrl: './seat-selection.component.html',
  styleUrl: './seat-selection.component.scss',
})
export class SeatSelectionComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly seatService = inject(SeatService);
  readonly booking = inject(BookingStateService);

  // Seat map loaded for the current performance, plus request state.
  private readonly seats = signal<ApiSeat[]>([]);
  private readonly selectedIds = signal<Set<string>>(new Set());
  readonly loading = signal(false);
  readonly error = signal(false);

  constructor() {
    const perf = this.booking.draft().performance;
    if (perf) this.loadSeats(perf.id);
  }

  private loadSeats(performanceId: string): void {
    this.loading.set(true);
    this.error.set(false);
    const base = this.booking.draft().production?.basePrice ?? 0;
    const isMatinee = this.booking.draft().performance?.time === 'matinee';

    // The seat map is public. Seat-zone percentages (for pricing) require auth,
    // so guests can view the map but prices show only once signed in.
    const zones$ = this.auth.isAuthenticated()
      ? this.seatService.getAllSeatZones()
      : of<SeatZoneListResponse>({ statusCode: '', statusDescription: '', seatZones: [] });

    forkJoin({
      zones: zones$,
      seats: this.seatService.getSeatsByPerformanceId(performanceId),
    }).subscribe({
      next: ({ zones, seats }) => {
        const pctByZone = new Map<string, number>();
        for (const z of zones.seatZones ?? []) {
          pctByZone.set(z.zoneId, isMatinee ? z.matineePct ?? 0 : z.eveningPct ?? 0);
        }

        const mapped = (seats.seats ?? []).map((s) =>
          this.toSeat(s, base, pctByZone.get(s.zoneId ?? '') ?? 0),
        );
        this.seats.set(mapped);

        // Re-apply the user's prior picks on top of the FRESH availability,
        // but only for seats that are still available — a seat booked/held by
        // someone else in the meantime is dropped from the selection.
        const priorIds = new Set(this.booking.draft().seats.map((s) => s.seatId));
        const restored = new Set(
          mapped
            .filter(
              (s) => s.status === 'available' && (priorIds.has(s.seatId) || priorIds.has(s.key)),
            )
            .map((s) => s.key),
        );
        this.selectedIds.set(restored);
        // Keep the draft in sync in case some seats are no longer available.
        this.syncDraft(mapped, restored);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }

  /** Persist the currently-selected (still-available) seats back to the draft. */
  private syncDraft(seats: ApiSeat[], selectedKeys: Set<string>): void {
    const picks: SelectedSeat[] = seats
      .filter((s) => selectedKeys.has(s.key))
      .map((s) => ({
        seatId: s.seatId || s.key,
        label: `${s.row}${s.number}`,
        tierLabel: s.zoneName,
        price: s.price,
        section: s.section,
      }));
    this.booking.setSeats(picks);
  }

  private toSeat(s: PerformanceSeatItem, base: number, pct: number): ApiSeat {
    const seatId = s.seatId ?? '';
    // Use seatId; fall back to a section/row/number composite so selection never
    // keys off an empty string (which would match every seat).
    const key = seatId || `${s.section ?? ''}-${s.rowLabel ?? ''}-${s.seatNumber ?? ''}`;
    return {
      key,
      seatId,
      zoneId: s.zoneId ?? '',
      section: s.section ?? '',
      location: this.locationFrom(s.section),
      zoneName: s.zoneName ?? '',
      row: s.rowLabel ?? '',
      number: s.seatNumber ?? 0,
      status: this.statusFrom(s.status),
      // Price = base ticket cost × (1 + pct/100). Percentages are additive.
      price: Math.round(base * (1 + pct / 100)),
    };
  }

  private locationFrom(section: SeatSection | undefined): SeatLocation {
    return section === 'CIRCLE' ? 'circle' : section === 'UPPER_CIRCLE' ? 'upperCircle' : 'stalls';
  }

  private statusFrom(status: PerformanceSeatStatus | undefined): SeatStatus {
    if (status === 'BOOKED') return 'booked';
    if (status === 'HELD' || status === 'BLOCKED') return 'unavailable';
    return 'available';
  }

  readonly groups = computed<LocationGroup[]>(() => {
    const selected = this.selectedIds();
    const byLoc: Record<SeatLocation, Map<string, ApiSeat[]>> = {
      stalls: new Map(),
      circle: new Map(),
      upperCircle: new Map(),
    };
    for (const seat of this.seats()) {
      const map = byLoc[seat.location];
      if (!map.has(seat.row)) map.set(seat.row, []);
      // Reflect the transient selection on the seat we render.
      map.get(seat.row)!.push({
        ...seat,
        status: selected.has(seat.key) ? 'selected' : seat.status,
      });
    }
    const order: SeatLocation[] = ['stalls', 'circle', 'upperCircle'];
    return order
      .map((location) => ({
        location,
        label: LOCATION_LABEL[location],
        rows: Array.from(byLoc[location].entries())
          .map(([row, seats]) => ({ row, seats: seats.sort((a, b) => a.number - b.number) }))
          .sort((a, b) => a.row.localeCompare(b.row)),
      }))
      .filter((g) => g.rows.length);
  });

  readonly selected = computed<SelectedSeat[]>(() => {
    const ids = this.selectedIds();
    return this.seats()
      .filter((s) => ids.has(s.key))
      .map((s) => ({
        // Keep the real seatId for the booking payload; fall back to key.
        seatId: s.seatId || s.key,
        label: `${s.row}${s.number}`,
        tierLabel: s.zoneName,
        price: s.price,
        section: s.section,
      }));
  });

  readonly subtotal = computed(() => this.selected().reduce((sum, s) => sum + s.price, 0));

  toggleSeat(seat: ApiSeat): void {
    if (seat.status === 'booked' || seat.status === 'unavailable') return;

    // Guests can view the map, but selecting a seat requires login. Send them
    // to login and return to this seat page afterwards.
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    this.selectedIds.update((set) => {
      const next = new Set(set);
      next.has(seat.key) ? next.delete(seat.key) : next.add(seat.key);
      return next;
    });
  }

  /** Deselect a seat from the "Your Selection" list (seatId = seatId or key). */
  removeSeat(seatId: string): void {
    this.selectedIds.update((set) => {
      const next = new Set(set);
      // Match by key or seatId, since selected() exposes seatId.
      const seat = this.seats().find((s) => s.seatId === seatId || s.key === seatId);
      if (seat) next.delete(seat.key);
      return next;
    });
  }

  continue(): void {
    const prod = this.booking.draft().production;
    if (!prod || !this.selected().length) return;

    // Persist the seat picks so they survive a login round-trip.
    this.booking.setSeats(this.selected());

    const detailsUrl = `/book/${prod.id}/details`;

    // Booking details require a signed-in patron. If not logged in, send them
    // to login and return here afterwards via returnUrl.
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: detailsUrl } });
      return;
    }

    this.router.navigateByUrl(detailsUrl);
  }
}
