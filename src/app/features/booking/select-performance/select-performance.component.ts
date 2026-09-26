import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../../layout/header/header.component';
import { FooterComponent } from '../../../layout/footer/footer.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { BookingStateService } from '../../../core/services/booking-state.service';
import { isPoya, performancesFor } from '../../../core/booking/catalogue.data';
import { Performance } from '../../../core/models/booking.models';

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
  readonly booking = inject(BookingStateService);

  // Fixed to May 2025 to line up with the sample productions.
  readonly year = 2025;
  readonly month0 = 4; // May (0-indexed)
  readonly monthLabel = 'May 2025';
  readonly weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  readonly selectedDate = signal<string | null>(null);
  readonly selectedPerf = signal<Performance | null>(null);

  private readonly allPerfs = computed<Performance[]>(() => {
    const prod = this.booking.draft().production;
    return prod ? performancesFor(prod.id, this.year, this.month0) : [];
  });

  readonly calendar = computed<DayCell[]>(() => {
    const first = new Date(this.year, this.month0, 1);
    const daysInMonth = new Date(this.year, this.month0 + 1, 0).getDate();
    // Monday-first offset.
    const startOffset = (first.getDay() + 6) % 7;
    const showDates = new Set(this.allPerfs().map((p) => p.date));

    const cells: DayCell[] = [];
    for (let i = 0; i < startOffset; i++) {
      cells.push({ day: 0, iso: `pad-${i}`, hasShows: false, poya: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${this.year}-${`${this.month0 + 1}`.padStart(2, '0')}-${`${d}`.padStart(2, '0')}`;
      cells.push({ day: d, iso, hasShows: showDates.has(iso), poya: isPoya(iso) });
    }
    return cells;
  });

  readonly showsForSelected = computed<Performance[]>(() => {
    const date = this.selectedDate();
    return date ? this.allPerfs().filter((p) => p.date === date) : [];
  });

  selectDate(cell: DayCell): void {
    if (!cell.hasShows) return;
    this.selectedDate.set(cell.iso);
    this.selectedPerf.set(null);
  }

  selectPerf(p: Performance): void {
    this.selectedPerf.set(p);
  }

  continue(): void {
    const perf = this.selectedPerf();
    const prod = this.booking.draft().production;
    if (!perf || !prod) return;
    this.booking.setPerformance(perf);
    this.router.navigate(['/book', prod.id, 'seats']);
  }
}
