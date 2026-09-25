import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationKey } from '../../core/i18n/translations';

export interface LegalSection {
  heading: string;
  body: string;
}

/**
 * Shared document-style layout for legal pages (Privacy, Terms).
 * Content is passed in via inputs so each page is a thin wrapper.
 */
@Component({
  selector: 'app-legal-page',
  standalone: true,
  imports: [MatIconModule, HeaderComponent, FooterComponent, TranslatePipe],
  templateUrl: './legal-page.component.html',
  styleUrl: './legal-page.component.scss',
})
export class LegalPageComponent {
  @Input({ required: true }) titleKey!: TranslationKey;
  @Input() updated = 'June 2025';
  @Input() sections: LegalSection[] = [];
}
