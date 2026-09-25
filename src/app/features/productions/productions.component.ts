import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationKey } from '../../core/i18n/translations';

type ProdLang = 'en' | 'si' | 'ta';

interface Production {
  id: string;
  name: string;
  genreKey: TranslationKey;
  language: ProdLang;
  dateRange: string;
  basePrice: number;
  image: string;
}

@Component({
  selector: 'app-productions',
  standalone: true,
  imports: [RouterLink, MatIconModule, HeaderComponent, FooterComponent, TranslatePipe],
  templateUrl: './productions.component.html',
  styleUrl: './productions.component.scss',
})
export class ProductionsComponent {
  // Placeholder catalogue until the catalogue service is wired in.
  private readonly all: Production[] = [
    {
      id: 'sanda-katha',
      name: 'Sanda Katha',
      genreKey: 'genre.drama',
      language: 'si',
      dateRange: '24 May – 15 Jun 2025',
      basePrice: 1500,
      image: 'assets/bg1.jpeg',
    },
    {
      id: 'dharma-patha',
      name: 'Dharma Patha',
      genreKey: 'genre.historical',
      language: 'si',
      dateRange: '01 Jun – 30 Jun 2025',
      basePrice: 1800,
      image: 'assets/curtain.png',
    },
    {
      id: 'yathra-gruwa',
      name: 'Yathra Gruwa',
      genreKey: 'genre.comedy',
      language: 'ta',
      dateRange: '10 Jun – 20 Jul 2025',
      basePrice: 1200,
      image: 'assets/loginBg.png',
    },
    {
      id: 'ahsa-maliga',
      name: 'Ahsa Maliga',
      genreKey: 'genre.musical',
      language: 'en',
      dateRange: '15 Jul – 30 Aug 2025',
      basePrice: 2000,
      image: 'assets/bg1.jpeg',
    },
    {
      id: 'kurulu-bandhana',
      name: 'Kurulu Bandhana',
      genreKey: 'genre.drama',
      language: 'ta',
      dateRange: '05 Aug – 25 Aug 2025',
      basePrice: 1600,
      image: 'assets/curtain.png',
    },
    {
      id: 'the-last-curtain',
      name: 'The Last Curtain',
      genreKey: 'genre.drama',
      language: 'en',
      dateRange: '01 Sep – 20 Sep 2025',
      basePrice: 2200,
      image: 'assets/loginBg.png',
    },
  ];

  readonly filter = signal<ProdLang | 'all'>('all');

  readonly filters: { value: ProdLang | 'all'; labelKey: TranslationKey }[] = [
    { value: 'all', labelKey: 'prod.filter.all' },
    { value: 'en', labelKey: 'lang.english' },
    { value: 'si', labelKey: 'lang.sinhala' },
    { value: 'ta', labelKey: 'lang.tamil' },
  ];

  readonly productions = computed(() => {
    const f = this.filter();
    return f === 'all' ? this.all : this.all.filter((p) => p.language === f);
  });

  setFilter(value: ProdLang | 'all'): void {
    this.filter.set(value);
  }

  langLabelKey(lang: ProdLang): TranslationKey {
    return lang === 'si' ? 'lang.sinhala' : lang === 'ta' ? 'lang.tamil' : 'lang.english';
  }
}
