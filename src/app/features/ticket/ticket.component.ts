import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { QrCodeComponent, buildQrMatrix } from '../../shared/qr-code/qr-code.component';
import { AuthService } from '../../core/services/auth.service';
import { BookingStateService } from '../../core/services/booking-state.service';
import { BookingApiService } from '../../core/services/booking-api.service';
import { CatalogueService } from '../../core/services/catalogue.service';
import { BookingResponse } from '../../core/models/booking-api.models';
import { jsPDF } from 'jspdf';

interface TicketDetails {
  bookingId: string;
  production: string;
  dateTime: string;
  venue: string;
  section: string;
  seats: string;
  patron: string;
  total: string;
  /** QR image data URL from the API, when available. */
  qrCode: string | null;
}

@Component({
  selector: 'app-ticket',
  standalone: true,
  imports: [
    RouterLink,
    MatIconModule,
    HeaderComponent,
    FooterComponent,
    TranslatePipe,
    QrCodeComponent,
  ],
  templateUrl: './ticket.component.html',
  styleUrl: './ticket.component.scss',
})
export class TicketComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly booking = inject(BookingStateService);
  private readonly bookingApi = inject(BookingApiService);
  private readonly catalogue = inject(CatalogueService);

  readonly ticket = signal<TicketDetails>(this.buildFromState());
  readonly loading = signal(false);

  constructor() {
    // If a booking reference is supplied, load the authoritative booking.
    const ref = this.route.snapshot.queryParamMap.get('ref') || this.booking.bookingId();
    if (ref) this.loadTicket(ref);
  }

  private loadTicket(ref: string): void {
    this.loading.set(true);
    this.bookingApi.getBookingByRef(ref).subscribe({
      next: (res) => {
        if (res.bookingId || res.bookingRef) {
          this.ticket.set(this.fromResponse(res));
          // If the booking response lacks the production name or show date/time,
          // fall back to the catalogue via the performance record.
          const needsName = !res.productionName;
          const needsDate = !res.performanceDate;
          if ((needsName || needsDate) && res.performanceId) {
            this.enrichFromCatalogue(res.performanceId, needsName, needsDate);
          }
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  /** Fill in production name and/or show date/time from the catalogue. */
  private enrichFromCatalogue(performanceId: string, needsName: boolean, needsDate: boolean): void {
    this.catalogue.getPerformanceById(performanceId).subscribe({
      next: (perf) => {
        if (needsDate && perf?.date) {
          this.ticket.update((t) => ({ ...t, dateTime: this.showDateTime(perf.date, perf.time) }));
        }
        if (needsName && perf?.productionId) {
          this.catalogue.getProductionById(perf.productionId).subscribe({
            next: (prod) => {
              if (prod?.title) {
                this.ticket.update((t) => ({ ...t, production: prod.title! }));
              }
            },
          });
        }
      },
    });
  }

  /** Build the ticket from the API booking response. */
  private fromResponse(res: BookingResponse): TicketDetails {
    const seats = res.seats ?? [];
    const section = seats[0]?.section || seats[0]?.zoneName?.split(' ')[0] || '';
    return {
      bookingId: res.bookingRef || res.bookingId || '',
      production: res.productionName || 'Booking',
      dateTime: this.showDateTime(res.performanceDate, res.performanceTime),
      venue: 'Main Theatre, Sapumal Theatre',
      section,
      seats: seats.map((s) => s.seatRef).filter(Boolean).join(', ') || '—',
      patron: this.auth.user()?.name || 'Guest',
      total: res.totalLkr != null ? `LKR ${res.totalLkr.toLocaleString()}` : '',
      qrCode: res.qrCode || null,
    };
  }

  /** Build the ticket from in-memory booking state (right after checkout). */
  private buildFromState(): TicketDetails {
    const d = this.booking.draft();
    if (d.production && d.seats.length) {
      const perf = d.performance;
      const firstTier = d.seats[0]?.tierLabel ?? '';
      const section = d.seats[0]?.section || firstTier.split(' ')[0] || 'Stalls';
      return {
        bookingId: this.booking.bookingId() ?? this.booking.confirmBooking(),
        production: d.production.name,
        dateTime: perf ? `${perf.date}, ${perf.clockLabel}` : d.production.dateRange,
        venue: d.production.venue,
        section,
        seats: d.seats.map((s) => s.label).join(', '),
        patron: d.fullName || this.auth.user()?.name || 'Guest',
        total: `LKR ${this.booking.total().toLocaleString()}`,
        qrCode: this.booking.qrCode(),
      };
    }
    return {
      bookingId: '',
      production: '',
      dateTime: '',
      venue: 'Main Theatre, Sapumal Theatre',
      section: '',
      seats: '',
      patron: this.auth.user()?.name ?? 'Guest',
      total: '',
      qrCode: null,
    };
  }

  private showDateTime(date: string | undefined, time: string | undefined): string {
    if (!date) return '';
    const d = new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const t = this.clockLabel(time);
    return t ? `${d}, ${t}` : d;
  }

  private clockLabel(time: string | undefined): string {
    if (!time) return '';
    const [hStr, mStr] = time.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr ?? '0', 10);
    if (Number.isNaN(h)) return '';
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hr12 = ((h + 11) % 12) + 1;
    return `${hr12}:${`${Number.isNaN(m) ? 0 : m}`.padStart(2, '0')} ${ampm}`;
  }

  print(): void {
    window.print();
  }

  /** Generate and download the e-ticket as a PDF. */
  download(): void {
    const t = this.ticket();
    const doc = new jsPDF({ unit: 'pt', format: 'a5' });
    const pageW = doc.internal.pageSize.getWidth();
    const maroon: [number, number, number] = [90, 15, 24];
    const gold: [number, number, number] = [212, 167, 44];

    // Header band
    doc.setFillColor(...maroon);
    doc.rect(0, 0, pageW, 70, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('SAPUMAL THEATRE', 30, 38);
    doc.setTextColor(...gold);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('E-TICKET', 30, 55);

    // Production title
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(t.production, 30, 110);

    // Details
    const rows: [string, string][] = [
      ['Booking ID', t.bookingId],
      ['Date & Time', t.dateTime],
      ['Venue', t.venue],
      ['Section', t.section],
      ['Seats', t.seats],
      ['Patron', t.patron],
      ['Total Paid', t.total],
    ];
    let y = 145;
    doc.setFontSize(11);
    for (const [label, value] of rows) {
      doc.setTextColor(120, 120, 120);
      doc.setFont('helvetica', 'normal');
      doc.text(label, 30, y);
      doc.setTextColor(30, 30, 30);
      doc.setFont('helvetica', 'bold');
      doc.text(String(value), 160, y);
      y += 24;
    }

    const qrSize = 120;
    const qrX = pageW - 30 - qrSize;
    const qrY = 135;
    // White backing
    doc.setFillColor(255, 255, 255);
    doc.rect(qrX - 6, qrY - 6, qrSize + 12, qrSize + 12, 'F');

    if (t.qrCode) {
      // Use the authoritative QR image from the API.
      try {
        doc.addImage(t.qrCode, 'PNG', qrX, qrY, qrSize, qrSize);
      } catch {
        this.drawQrMatrix(doc, t.bookingId, qrX, qrY, qrSize);
      }
    } else {
      this.drawQrMatrix(doc, t.bookingId, qrX, qrY, qrSize);
    }
    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Scan at entrance', qrX + qrSize / 2, qrY + qrSize + 14, { align: 'center' });

    // Footer note
    const footY = Math.max(y + 6, qrY + qrSize + 30);
    doc.setDrawColor(220, 210, 205);
    doc.line(30, footY, pageW - 30, footY);
    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.text('Please present this ticket at the theatre entrance. Enjoy the show!', 30, footY + 20);

    doc.save(`SapumalTheatre-${t.bookingId}.pdf`);
  }

  /** Fallback: draw a locally-generated QR matrix into the PDF. */
  private drawQrMatrix(doc: jsPDF, value: string, x: number, y: number, size: number): void {
    const matrix = buildQrMatrix(value, 25);
    const cell = size / matrix.length;
    doc.setFillColor(26, 26, 26);
    for (let ry = 0; ry < matrix.length; ry++) {
      for (let rx = 0; rx < matrix[ry].length; rx++) {
        if (matrix[ry][rx]) {
          doc.rect(x + rx * cell, y + ry * cell, cell, cell, 'F');
        }
      }
    }
  }
}
