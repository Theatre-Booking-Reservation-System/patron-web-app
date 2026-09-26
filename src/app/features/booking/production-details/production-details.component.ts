import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../../layout/header/header.component';
import { FooterComponent } from '../../../layout/footer/footer.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { BookingStateService } from '../../../core/services/booking-state.service';
import { productionById } from '../../../core/booking/catalogue.data';
import { Production } from '../../../core/models/booking.models';

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

  readonly production = signal<Production | undefined>(undefined);
  readonly tab = signal<Tab>('about');

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

  bookTickets(): void {
    const p = this.production();
    if (!p) return;
    this.booking.setProduction(p);
    this.router.navigate(['/book', p.id, 'performance']);
  }
}
