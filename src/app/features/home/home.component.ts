import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationKey } from '../../core/i18n/translations';

interface ProductionCard {
  id: string;
  name: string;
  /** Genre translation key, e.g. 'genre.drama'. */
  genreKey: TranslationKey;
  dateRange: string;
  image: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatIconModule, HeaderComponent, FooterComponent, TranslatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  // Placeholder data until the catalogue service is wired in.
  readonly productions: ProductionCard[] = [
    {
      id: 'sanda-katha',
      name: 'Sanda Katha',
      genreKey: 'genre.drama',
      dateRange: '24 May – 15 Jun 2025',
      image: 'assets/bg1.jpeg',
    },
    {
      id: 'dharma-patha',
      name: 'Dharma Patha',
      genreKey: 'genre.historical',
      dateRange: '01 Jun – 30 Jun 2025',
      image: 'assets/curtain.png',
    },
    {
      id: 'yathra-gruwa',
      name: 'Yathra Gruwa',
      genreKey: 'genre.comedy',
      dateRange: '10 Jun – 20 Jul 2025',
      image: 'assets/loginBg.png',
    },
    {
      id: 'ahsa-maliga',
      name: 'Ahsa Maliga',
      genreKey: 'genre.musical',
      dateRange: '15 Jul – 30 Aug 2025',
      image: 'assets/bg1.jpeg',
    },
  ];
}
