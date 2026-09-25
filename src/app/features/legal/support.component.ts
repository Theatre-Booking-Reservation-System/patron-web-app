import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationKey } from '../../core/i18n/translations';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [RouterLink, MatIconModule, HeaderComponent, FooterComponent, TranslatePipe],
  templateUrl: './support.component.html',
  styleUrl: './support.component.scss',
})
export class SupportComponent {
  // Reuse the visit FAQ strings — they cover the most common patron questions.
  readonly faqs: { q: TranslationKey; a: TranslationKey }[] = [
    { q: 'visit.faq1Q', a: 'visit.faq1A' },
    { q: 'visit.faq2Q', a: 'visit.faq2A' },
    { q: 'visit.faq3Q', a: 'visit.faq3A' },
  ];

  readonly openFaq = signal<number | null>(0);

  toggleFaq(i: number): void {
    this.openFaq.update((cur) => (cur === i ? null : i));
  }
}
