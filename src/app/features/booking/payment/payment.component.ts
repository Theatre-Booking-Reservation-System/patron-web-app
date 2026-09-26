import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../../layout/header/header.component';
import { FooterComponent } from '../../../layout/footer/footer.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { BookingStateService } from '../../../core/services/booking-state.service';

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
  readonly booking = inject(BookingStateService);

  readonly method = signal<PayMethod>('card');
  readonly processing = signal(false);

  cardNumber = '';
  expiry = '';
  cvv = '';
  cardName = '';
  saveCard = false;

  setMethod(m: PayMethod): void {
    this.method.set(m);
  }

  pay(event: Event): void {
    event.preventDefault();
    const prod = this.booking.draft().production;
    if (!prod) return;
    this.processing.set(true);
    // Simulate a payment round-trip.
    setTimeout(() => {
      this.processing.set(false);
      this.router.navigate(['/book', prod.id, 'confirmation']);
    }, 800);
  }
}
