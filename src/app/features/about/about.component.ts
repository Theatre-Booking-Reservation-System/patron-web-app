import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationKey } from '../../core/i18n/translations';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [MatIconModule, HeaderComponent, FooterComponent, TranslatePipe],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  readonly stats: { value: string; labelKey: TranslationKey }[] = [
    { value: '25+', labelKey: 'about.stat.years' },
    { value: '180+', labelKey: 'about.stat.productions' },
    { value: '500K+', labelKey: 'about.stat.patrons' },
    { value: '850', labelKey: 'about.stat.seats' },
  ];

  readonly values: { icon: string; titleKey: TranslationKey; textKey: TranslationKey }[] = [
    { icon: 'auto_awesome', titleKey: 'about.value1Title', textKey: 'about.value1' },
    { icon: 'diversity_3', titleKey: 'about.value2Title', textKey: 'about.value2' },
    { icon: 'favorite', titleKey: 'about.value3Title', textKey: 'about.value3' },
  ];
}
