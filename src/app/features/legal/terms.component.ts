import { Component } from '@angular/core';
import { LegalPageComponent, LegalSection } from './legal-page.component';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [LegalPageComponent],
  template: `<app-legal-page titleKey="legal.termsTitle" [sections]="sections" />`,
})
export class TermsComponent {
  readonly sections: LegalSection[] = [
    {
      heading: 'Booking & Payment',
      body: 'All ticket prices are shown in Sri Lankan Rupees and vary per production and seating location. Payment is required in full at the time of booking to confirm your seats.',
    },
    {
      heading: 'Concessions',
      body: 'Concessionary rates for under 16s, over 70s, and groups of more than 10 are non-compound — the single best applicable concession is applied. Valid ID must be presented at the box office on the day of the performance.',
    },
    {
      heading: 'Loyalty Card',
      body: 'Loyalty members receive a 10% discount per ticket and may reserve seats one week before the official release date.',
    },
    {
      heading: 'Cancellations & Refunds',
      body: 'Bookings may be cancelled up to 48 hours before the performance for a full refund. Cancellations after this window are non-refundable.',
    },
    {
      heading: 'Entry',
      body: 'Please present your e-ticket QR code at the theatre entrance. Latecomers may be admitted only during a suitable break at the discretion of the venue.',
    },
  ];
}
