import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../../layout/header/header.component';
import { FooterComponent } from '../../../layout/footer/footer.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { QrCodeComponent } from '../../../shared/qr-code/qr-code.component';
import { BookingStateService } from '../../../core/services/booking-state.service';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [
    RouterLink,
    MatIconModule,
    HeaderComponent,
    FooterComponent,
    TranslatePipe,
    QrCodeComponent,
  ],
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.scss',
})
export class ConfirmationComponent {
  readonly booking = inject(BookingStateService);
  readonly bookingId: string;

  constructor() {
    // Finalise the booking reference (idempotent).
    this.bookingId = this.booking.confirmBooking();
  }

  get seatLabels(): string {
    return this.booking.draft().seats.map((s) => s.label).join(', ');
  }
}
