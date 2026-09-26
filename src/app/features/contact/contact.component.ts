import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationKey } from '../../core/i18n/translations';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [MatIconModule, HeaderComponent, FooterComponent, TranslatePipe],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  readonly details: { icon: string; labelKey: TranslationKey; value: string }[] = [
    { icon: 'place', labelKey: 'contact.address', value: 'Ward Place, Colombo 07, Sri Lanka' },
    { icon: 'call', labelKey: 'contact.phone', value: '+94 11 234 5678' },
    { icon: 'mail_outline', labelKey: 'contact.emailLabel', value: 'hello@sapumaltheatre.lk' },
    { icon: 'schedule', labelKey: 'contact.hours', value: 'Mon–Sun · 9:00 AM – 8:00 PM' },
  ];
}
