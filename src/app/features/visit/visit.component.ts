import { Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationKey } from '../../core/i18n/translations';

@Component({
  selector: 'app-visit',
  standalone: true,
  imports: [MatIconModule, HeaderComponent, FooterComponent, TranslatePipe],
  templateUrl: './visit.component.html',
  styleUrl: './visit.component.scss',
})
export class VisitComponent {
  readonly facilities: { icon: string; key: TranslationKey }[] = [
    { icon: 'accessible', key: 'visit.facility1' },
    { icon: 'local_parking', key: 'visit.facility2' },
    { icon: 'local_cafe', key: 'visit.facility3' },
    { icon: 'checkroom', key: 'visit.facility4' },
    { icon: 'ac_unit', key: 'visit.facility5' },
    { icon: 'family_restroom', key: 'visit.facility6' },
  ];

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
