import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../../layout/header/header.component';
import { FooterComponent } from '../../../layout/footer/footer.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { BookingStateService } from '../../../core/services/booking-state.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoyaltyService } from '../../../core/services/loyalty.service';
import { concessionByType } from '../../../core/booking/pricing';
import { ConcessionOption, ConcessionType } from '../../../core/models/booking.models';

/** Number of tickets above which a booking qualifies as a large party. */
const GROUP_MIN = 10;

@Component({
  selector: 'app-booking-details',
  standalone: true,
  imports: [FormsModule, RouterLink, MatIconModule, HeaderComponent, FooterComponent, TranslatePipe],
  templateUrl: './booking-details.component.html',
  styleUrl: './booking-details.component.scss',
})
export class BookingDetailsComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly loyalty = inject(LoyaltyService);
  readonly booking = inject(BookingStateService);

  // Local form model (signals), pre-filled from the signed-in user where possible.
  readonly fullName = signal(this.booking.draft().fullName || this.auth.user()?.name || '');
  readonly email = signal(this.booking.draft().email || this.auth.user()?.email || '');
  readonly phone = signal(this.booking.draft().phone || '');
  readonly idNumber = signal(this.booking.draft().idNumber || '');

  readonly submitted = signal(false);

  // Validation patterns (mirrors the register form).
  private readonly emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  private readonly phonePattern = /^(?:\+94|0)\d{9}$/;

  // Per-field validity.
  readonly nameValid = computed(() => this.fullName().trim().length >= 2);
  readonly emailValid = computed(() => this.emailPattern.test(this.email().trim()));
  readonly phoneValid = computed(() => this.phonePattern.test(this.phone().trim()));
  readonly idValid = computed(() => !this.requiresId || this.idNumber().trim().length > 0);

  /** Proceed is allowed only when every required field is valid. */
  readonly formValid = computed(
    () => this.nameValid() && this.emailValid() && this.phoneValid() && this.idValid(),
  );

  // Ticket type is auto-selected (never user-editable).
  readonly concession = signal<ConcessionType>(this.booking.draft().concession);
  readonly selectedConcession = computed<ConcessionOption>(() =>
    concessionByType(this.concession()),
  );

  constructor() {
    // Auto-apply the best concession we can determine without the API first
    // (group booking from seat count, loyalty from local membership).
    this.autoSelectConcession(undefined, undefined);

    // Then enrich from the patron record: dateOfBirth (age → child/senior) and
    // loyaltyHolder, plus prefill the phone from contactNo.
    const patronId = this.auth.user()?.userId;
    if (patronId) {
      this.auth.getPatron(patronId).subscribe({
        next: (res) => {
          const p = res.patron;
          if (p?.contactNo && !this.phone()) {
            this.phone.set(p.contactNo);
          }
          this.autoSelectConcession(p?.dateOfBirth, p?.loyaltyHolder);
        },
      });
    }
  }

  /**
   * Pick the single best concession (non-compound) from the patron's age,
   * loyalty status and the number of seats selected. Highest discount wins.
   */
  private autoSelectConcession(
    dateOfBirth: string | undefined,
    loyaltyHolder: boolean | undefined,
  ): void {
    const eligible: ConcessionType[] = ['none'];

    const age = this.ageFrom(dateOfBirth);
    if (age !== null && age < 16) eligible.push('child');
    if (age !== null && age > 70) eligible.push('senior');

    if (this.booking.draft().seats.length > GROUP_MIN) eligible.push('group');

    if (loyaltyHolder === true || this.loyalty.isMember()) eligible.push('loyalty');

    // Best = highest discount among eligible types.
    const best = eligible.reduce<ConcessionType>((chosen, type) => {
      return concessionByType(type).discount > concessionByType(chosen).discount ? type : chosen;
    }, 'none');

    this.concession.set(best);
    this.booking.setConcession(best);
  }

  /** Whole-year age from an ISO date of birth, or null if unavailable/invalid. */
  private ageFrom(isoDate: string | undefined): number | null {
    if (!isoDate) return null;
    const dob = new Date(isoDate);
    if (Number.isNaN(dob.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
    return age;
  }

  get requiresId(): boolean {
    return this.booking.requiresId();
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
    const prod = this.booking.draft().production;
    // Guard: the button is disabled while invalid, but double-check here too.
    if (!prod || !this.formValid()) return;

    this.booking.patchDetails({
      fullName: this.fullName().trim(),
      email: this.email().trim(),
      phone: this.phone().trim(),
      idNumber: this.idNumber().trim(),
    });
    this.router.navigate(['/book', prod.id, 'payment']);
  }
}
