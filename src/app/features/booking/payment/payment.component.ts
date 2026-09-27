import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../../layout/header/header.component';
import { FooterComponent } from '../../../layout/footer/footer.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { BookingStateService } from '../../../core/services/booking-state.service';
import { AuthService } from '../../../core/services/auth.service';
import { BookingApiService } from '../../../core/services/booking-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import {
  BookingRequest,
  PaymentDetails,
  SeatSelection,
  TicketType,
} from '../../../core/models/booking-api.models';
import { ConcessionType } from '../../../core/models/booking.models';

type PayMethod = 'card' | 'wallet' | 'bank';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [FormsModule, RouterLink, MatIconModule, HeaderComponent, FooterComponent, TranslatePipe],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss',
})
export class PaymentComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly bookingApi = inject(BookingApiService);
  private readonly notifications = inject(NotificationService);
  readonly booking = inject(BookingStateService);

  readonly method = signal<PayMethod>('card');
  readonly processing = signal(false);
  readonly submitted = signal(false);

  // Card fields as signals so validity computeds react to every keystroke.
  readonly cardNumber = signal('');
  readonly expiry = signal('');
  readonly cvv = signal('');
  readonly cardName = signal('');

  // Per-field validity.
  readonly cardNumberValid = computed(() => {
    const digits = this.cardNumber().replace(/\D/g, '');
    return digits.length >= 13 && digits.length <= 19;
  });
  readonly cvvValid = computed(() => /^\d{3,4}$/.test(this.cvv().trim()));
  readonly expiryValid = computed(() => /^\d{2}\/\d{2,4}$/.test(this.expiry().trim()));
  readonly cardNameValid = computed(() => this.cardName().trim().length > 0);

  /** Pay Now is enabled only when the whole card form is valid. */
  readonly formValid = computed(
    () =>
      this.method() === 'card' &&
      this.cardNumberValid() &&
      this.cvvValid() &&
      this.expiryValid() &&
      this.cardNameValid(),
  );

  setMethod(m: PayMethod): void {
    this.method.set(m);
  }

  pay(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
    const draft = this.booking.draft();
    const prod = draft.production;
    const perf = draft.performance;
    if (!prod || !perf || !this.formValid() || !draft.seats.length) return;

    this.processing.set(true);

    const request = this.buildBookingRequest();
    this.bookingApi.createBooking(request).subscribe({
      next: (res) => {
        this.processing.set(false);
        if (!res.bookingId && !res.bookingRef) {
          this.notifications.showError({
            title: 'Booking failed',
            message: res.statusDescription || 'Could not create the booking. Please try again.',
            code: res.statusCode,
          });
          return;
        }
        // Share the booking reference + QR with the confirmation + e-ticket steps.
        this.booking.bookingId.set(res.bookingRef || res.bookingId || null);
        this.booking.qrCode.set(res.qrCode || null);
        this.router.navigate(['/book', prod.id, 'confirmation']);
      },
      error: () => {
        this.processing.set(false);
        // The error interceptor already surfaces a modal.
      },
    });
  }

  /** Build the POST /bookings payload from the current booking draft. */
  private buildBookingRequest(): BookingRequest {
    const draft = this.booking.draft();
    const perf = draft.performance!;

    const seats: SeatSelection[] = draft.seats.map((s) => ({
      seatId: s.seatId,
      seatRef: s.label,
      zoneName: s.tierLabel,
      section: s.section,
    }));

    const paymentDetails: PaymentDetails = {
      cardNumber: this.cardNumber().replace(/\s+/g, ''),
      expiry: this.expiry().trim(),
      cvv: this.cvv().trim(),
      cardHolderName: this.cardName().trim(),
    };

    return {
      patronId: this.auth.user()?.userId,
      performanceId: perf.id,
      seats,
      ticketType: this.ticketType(draft.concession),
      // Only card payment is offered right now.
      paymentMethod: 'CREDIT_CARD',
      paymentDetails,
    };
  }

  /** Map the app's concession to the booking API's ticket type. */
  private ticketType(type: ConcessionType): TicketType {
    if (type === 'group') return 'GROUP';
    if (type === 'loyalty') return 'LOYALTY';
    return 'REGULAR';
  }
}
