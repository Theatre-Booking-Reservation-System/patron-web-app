import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../../layout/header/header.component';
import { FooterComponent } from '../../../layout/footer/footer.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationKey } from '../../../core/i18n/translations';

type BookingStatus = 'confirmed' | 'completed' | 'cancelled';

interface Booking {
  bookingId: string;
  production: string;
  genreKey: TranslationKey;
  dateTime: string;
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
  readonly tab = signal<'upcoming' | 'past'>('upcoming');

  // Placeholder bookings until the booking service is wired in.
  private readonly all: Booking[] = [
    {
      bookingId: 'BK20250524-001',
      production: 'Sanda Katha',
      genreKey: 'genre.drama',
      dateTime: '24 May 2025, 7:00 PM',
      venue: 'Main Theatre',
      seats: 'C12, C13',
      image: 'assets/bg1.jpeg',
      status: 'confirmed',
    },
    {
      bookingId: 'BK20250610-014',
      production: 'Yathra Oruwa',
      genreKey: 'genre.comedy',
      dateTime: '10 Jun 2025, 3:00 PM',
      venue: 'Main Theatre',
      seats: 'A5, A6',
      image: 'assets/loginBg.png',
      status: 'confirmed',
    },
    {
      bookingId: 'BK20250315-072',
      production: 'Dharma Patha',
      genreKey: 'genre.historical',
      dateTime: '15 Mar 2025, 7:00 PM',
      venue: 'Main Theatre',
      seats: 'B10',
      image: 'assets/curtain.png',
      status: 'completed',
    },
    {
      bookingId: 'BK20250128-039',
      production: 'Ahsa Maliga',
      genreKey: 'genre.musical',
      dateTime: '28 Jan 2025, 7:00 PM',
      venue: 'Main Theatre',
      seats: 'AA2, AA3',
      image: 'assets/bg1.jpeg',
      status: 'cancelled',
    },
  ];

  readonly upcoming = computed(() => this.all.filter((b) => b.status === 'confirmed'));
  readonly past = computed(() =>
    this.all.filter((b) => b.status === 'completed' || b.status === 'cancelled'),
  );

  readonly visible = computed(() => (this.tab() === 'upcoming' ? this.upcoming() : this.past()));

  setTab(t: 'upcoming' | 'past'): void {
    this.tab.set(t);
  }

  statusKey(status: BookingStatus): TranslationKey {
    return `mb.status.${status}` as TranslationKey;
  }
}
