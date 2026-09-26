import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../../layout/header/header.component';
import { FooterComponent } from '../../../layout/footer/footer.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { BookingStateService } from '../../../core/services/booking-state.service';
import { AuthService } from '../../../core/services/auth.service';
import { CONCESSIONS } from '../../../core/booking/pricing';
import { ConcessionType } from '../../../core/models/booking.models';

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
  readonly booking = inject(BookingStateService);

  readonly concessions = CONCESSIONS;

  // Local form model, pre-filled from the signed-in user where possible.
  fullName = this.booking.draft().fullName || this.auth.user()?.name || '';
  email = this.booking.draft().email || this.auth.user()?.email || '';
  phone = this.booking.draft().phone || '';
  idNumber = this.booking.draft().idNumber || '';
  specialRequests = this.booking.draft().specialRequests || '';
  concession: ConcessionType = this.booking.draft().concession;

  onConcessionChange(value: ConcessionType): void {
    this.concession = value;
    this.booking.setConcession(value);
  }

  get requiresId(): boolean {
    return this.booking.requiresId();
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    const prod = this.booking.draft().production;
    if (!prod) return;

    this.booking.patchDetails({
      fullName: this.fullName.trim(),
      email: this.email.trim(),
      phone: this.phone.trim(),
      idNumber: this.idNumber.trim(),
      specialRequests: this.specialRequests.trim(),
    });
    this.router.navigate(['/book', prod.id, 'payment']);
  }
}
