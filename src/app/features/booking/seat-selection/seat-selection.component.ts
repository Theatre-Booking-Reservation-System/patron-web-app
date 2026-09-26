import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../../layout/header/header.component';
import { FooterComponent } from '../../../layout/footer/footer.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { BookingStateService } from '../../../core/services/booking-state.service';
import {
  LOCATION_LABEL,
  buildSeatMap,
  seatPrice,
  tierById,
} from '../../../core/booking/pricing';
import { Seat, SeatLocation, SelectedSeat } from '../../../core/models/booking.models';

interface SeatRow {
  row: string;
  seats: Seat[];
}
interface LocationGroup {
  location: SeatLocation;
  label: string;
  rows: SeatRow[];
}

@Component({
  selector: 'app-seat-selection',
  standalone: true,
  imports: [RouterLink, MatIconModule, HeaderComponent, FooterComponent, TranslatePipe],
  templateUrl: './seat-selection.component.html',
  styleUrl: './seat-selection.component.scss',
})
export class SeatSelectionComponent {
  private readonly router = inject(Router);
  readonly booking = inject(BookingStateService);

  // Local, mutable copy of the seat map for this session.
  private readonly seats = signal<Seat[]>(buildSeatMap());

  readonly groups = computed<LocationGroup[]>(() => {
    const byLoc: Record<SeatLocation, Map<string, Seat[]>> = {
      stalls: new Map(),
      circle: new Map(),
      upperCircle: new Map(),
    };
    for (const seat of this.seats()) {
      const tier = tierById(seat.tierId);
      if (!tier) continue;
      const map = byLoc[tier.location];
      if (!map.has(seat.row)) map.set(seat.row, []);
      map.get(seat.row)!.push(seat);
    }
    const order: SeatLocation[] = ['stalls', 'circle', 'upperCircle'];
    return order.map((location) => ({
      location,
      label: LOCATION_LABEL[location],
      rows: Array.from(byLoc[location].entries()).map(([row, seats]) => ({
        row,
        seats: seats.sort((a, b) => a.number - b.number),
      })),
    }));
  });

  readonly selected = computed<SelectedSeat[]>(() => {
    const perf = this.booking.draft().performance;
    const base = this.booking.draft().production?.basePrice ?? 0;
    if (!perf) return [];
    return this.seats()
      .filter((s) => s.status === 'selected')
      .map((s) => {
        const tier = tierById(s.tierId);
        return {
          seatId: s.id,
          label: `${s.row}${s.number}`,
          tierLabel: tier?.label ?? '',
          price: seatPrice(s.tierId, base, perf.time),
        };
      });
  });

  readonly subtotal = computed(() => this.selected().reduce((sum, s) => sum + s.price, 0));

  toggleSeat(seat: Seat): void {
    if (seat.status === 'booked') return;
    this.seats.update((list) =>
      list.map((s) =>
        s.id === seat.id
          ? { ...s, status: s.status === 'selected' ? 'available' : 'selected' }
          : s,
      ),
    );
  }

  /** Whether a tier counts as "premium" for the legend colour. */
  isPremium(tierId: string): boolean {
    return tierId.includes('premium');
  }

  continue(): void {
    const prod = this.booking.draft().production;
    if (!prod || !this.selected().length) return;
    this.booking.setSeats(this.selected());
    this.router.navigate(['/book', prod.id, 'details']);
  }
}
