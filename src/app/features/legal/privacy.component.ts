import { Component } from '@angular/core';
import { LegalPageComponent, LegalSection } from './legal-page.component';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [LegalPageComponent],
  template: `<app-legal-page titleKey="legal.privacyTitle" [sections]="sections" />`,
})
export class PrivacyComponent {
  readonly sections: LegalSection[] = [
    {
      heading: 'Information We Collect',
      body: 'We collect the details you provide when creating an account or booking tickets — your name, email, phone number, and, where a concessionary rate is claimed, an NIC or passport number for verification at the box office.',
    },
    {
      heading: 'How We Use Your Information',
      body: 'Your information is used to process bookings, send booking confirmations and e-tickets, verify concession eligibility, and keep you informed about upcoming productions if you opt in.',
    },
    {
      heading: 'Data Sharing',
      body: 'We do not sell your personal data. Information is shared only with payment processors and services strictly necessary to complete your booking.',
    },
    {
      heading: 'Your Rights',
      body: 'You may access, correct, or request deletion of your personal data at any time by contacting our support team.',
    },
    {
      heading: 'Cookies',
      body: 'We use essential cookies to keep you signed in and remember your language and theme preferences. No tracking cookies are used without your consent.',
    },
  ];
}
