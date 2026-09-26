import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { QrCodeComponent, buildQrMatrix } from '../../shared/qr-code/qr-code.component';
import { AuthService } from '../../core/services/auth.service';
import { BookingStateService } from '../../core/services/booking-state.service';
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
  private readonly auth = inject(AuthService);
  private readonly booking = inject(BookingStateService);

  readonly ticket: TicketDetails = this.buildTicket();

  private buildTicket(): TicketDetails {
    const d = this.booking.draft();
    // If a real booking exists in state, reflect it; otherwise show a sample.
    if (d.production && d.seats.length) {
      const perf = d.performance;
      const firstTier = d.seats[0]?.tierLabel ?? '';
      const section = firstTier.split(' ')[0] || 'Stalls';
      return {
        bookingId: this.booking.bookingId() ?? this.booking.confirmBooking(),
        production: d.production.name,
        dateTime: perf ? `${perf.date}, ${perf.clockLabel}` : d.production.dateRange,
        venue: d.production.venue,
        section,
        seats: d.seats.map((s) => s.label).join(', '),
        patron: d.fullName || this.auth.user()?.name || 'Guest',
        total: `LKR ${this.booking.total().toLocaleString()}`,
      };
    }
    return {
      bookingId: 'BK20250524-001',
      production: 'Sanda Katha',
      dateTime: '24 May 2025, 7:00 PM',
      venue: 'Main Theatre, Sapumal Theatre',
      section: 'Stalls',
      seats: 'C12, C13',
      patron: this.auth.user()?.name ?? 'Sarasi Sumiyana',
      total: 'LKR 3,100',
    };
  }

  print(): void {
    window.print();
  }

  /** Generate and download the e-ticket as a PDF. */
  download(): void {
    const t = this.ticket;
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

    // QR code (drawn from the same deterministic matrix as the on-screen one)
    const matrix = buildQrMatrix(t.bookingId, 25);
    const qrSize = 120;
    const cell = qrSize / matrix.length;
    const qrX = pageW - 30 - qrSize;
    const qrY = 135;
    // White backing
    doc.setFillColor(255, 255, 255);
    doc.rect(qrX - 6, qrY - 6, qrSize + 12, qrSize + 12, 'F');
    doc.setFillColor(26, 26, 26);
    for (let ry = 0; ry < matrix.length; ry++) {
      for (let rx = 0; rx < matrix[ry].length; rx++) {
        if (matrix[ry][rx]) {
          doc.rect(qrX + rx * cell, qrY + ry * cell, cell, cell, 'F');
        }
      }
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
}
