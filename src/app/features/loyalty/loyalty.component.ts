import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { LoyaltyService } from '../../core/services/loyalty.service';
import { AuthService } from '../../core/services/auth.service';
import { TranslationKey } from '../../core/i18n/translations';

@Component({
  selector: 'app-loyalty',
  standalone: true,
  imports: [MatIconModule, HeaderComponent, FooterComponent, TranslatePipe],
  templateUrl: './loyalty.component.html',
  styleUrl: './loyalty.component.scss',
})
export class LoyaltyComponent {
  private readonly loyalty = inject(LoyaltyService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly isMember = this.loyalty.isMember;

  readonly benefits: { icon: string; titleKey: TranslationKey; textKey: TranslationKey }[] = [
    { icon: 'sell', titleKey: 'loyalty.benefit1Title', textKey: 'loyalty.benefit1' },
    { icon: 'schedule', titleKey: 'loyalty.benefit2Title', textKey: 'loyalty.benefit2' },
    { icon: 'event_seat', titleKey: 'loyalty.benefit3Title', textKey: 'loyalty.benefit3' },
    { icon: 'local_offer', titleKey: 'loyalty.benefit4Title', textKey: 'loyalty.benefit4' },
  ];

  readonly enrolling = signal(false);
  readonly enrollError = signal<string | null>(null);

  enroll(): void {
    // Enrolling requires a signed-in patron; send guests to login and back.
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/loyalty' } });
      return;
    }
    this.enrollError.set(null);
    this.enrolling.set(true);
    this.loyalty.enroll().subscribe({
      next: () => this.enrolling.set(false),
      error: (err) => {
        this.enrolling.set(false);
        this.enrollError.set(this.messageFor(err));
      },
    });
  }

  leave(): void {
    this.loyalty.cancel();
  }

  private messageFor(err: any): string {
    const desc = err?.error?.statusDescription;
    if (typeof desc === 'string' && desc.trim()) return desc;
    if (err?.status === 409) return 'You are already a loyalty member.';
    if (err?.status === 401) return 'Please sign in to enrol.';
    if (err?.status === 0) return 'Cannot reach the server. Please try again.';
    return 'Enrolment failed. Please try again.';
  }
}
