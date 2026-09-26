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
import { productionById } from '../../../core/booking/catalogue.data';
import { Production } from '../../../core/models/booking.models';
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

  readonly production = signal<Production | undefined>(undefined);
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

  readonly cast = [
    { role: 'Director', name: 'Nimal Perera' },
    { role: 'Lead', name: 'Sarasi Sumiyana' },
    { role: 'Lead', name: 'Kasun Fernando' },
    { role: 'Music', name: 'Amaya Silva' },
  ];

  readonly showDates = [
    { date: 'Sat, 24 May 2025', time: '7:00 PM' },
    { date: 'Sun, 25 May 2025', time: '3:00 PM' },
    { date: 'Sat, 31 May 2025', time: '7:00 PM' },
    { date: 'Sun, 01 Jun 2025', time: '3:00 PM' },
  ];

  constructor() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.production.set(productionById(id));
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
