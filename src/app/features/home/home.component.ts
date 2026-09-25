import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationKey } from '../../core/i18n/translations';
import { AuthService } from '../../core/services/auth.service';

interface ShowCard {
  id: string;
  name: string;
  genreKey: TranslationKey;
  dateRange: string;
  venue: string;
  image: string;
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

  ngOnInit(): void {
    this.startAutoPlay();
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

  onSearch(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/productions'], {
      queryParams: this.query.trim() ? { q: this.query.trim() } : {},
    });
  }

  // Placeholder data until the catalogue service is wired in.
  readonly nowShowing: ShowCard[] = [
    {
      id: 'sanda-katha',
      name: 'Sanda Katha',
      genreKey: 'genre.drama',
      dateRange: '24 May – 15 Jun 2025',
      venue: 'Main Theatre',
      image: 'assets/bg1.jpeg',
    },
    {
      id: 'dharma-patha',
      name: 'Dharma Patha',
      genreKey: 'genre.historical',
      dateRange: '01 Jun – 30 Jun 2025',
      venue: 'Main Theatre',
      image: 'assets/curtain.png',
    },
    {
      id: 'ahsa-maliga',
      name: 'Ahsa Maliga',
      genreKey: 'genre.musical',
      dateRange: '15 Jul – 30 Aug 2025',
      venue: 'Main Theatre',
      image: 'assets/loginBg.png',
    },
    {
      id: 'the-last-curtain',
      name: 'The Merchant of Venice',
      genreKey: 'genre.drama',
      dateRange: '05 Aug – 28 Aug 2025',
      venue: 'Main Theatre',
      image: 'assets/bg1.jpeg',
    },
  ];

  readonly upcoming: ShowCard[] = [
    {
      id: 'nava-rathri',
      name: 'Nava Rathri',
      genreKey: 'genre.cultural',
      dateRange: '01 Sep – 15 Sep 2025',
      venue: 'Main Theatre',
      image: 'assets/curtain.png',
    },
    {
      id: 'yathra-gruwa',
      name: 'Yathra Oruwa',
      genreKey: 'genre.comedy',
      dateRange: '10 Jun – 20 Jun 2025',
      venue: 'Main Theatre',
      image: 'assets/loginBg.png',
    },
    {
      id: 'nrithya-sandhya',
      name: 'Nrithya Sandhya',
      genreKey: 'genre.dance',
      dateRange: '20 Sep – 12 Oct 2025',
      venue: 'Main Theatre',
      image: 'assets/bg1.jpeg',
    },
    {
      id: 'raja-saha-ranaviru',
      name: 'Raja Saha Ranaviru',
      genreKey: 'genre.drama',
      dateRange: '18 Oct – 05 Nov 2025',
      venue: 'Main Theatre',
      image: 'assets/curtain.png',
    },
  ];
}
