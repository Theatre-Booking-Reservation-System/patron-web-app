import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationKey } from '../../core/i18n/translations';
import { CatalogueService } from '../../core/services/catalogue.service';
import {
  ApiLanguage,
  ProductionItem,
  ProductionSearchParams,
} from '../../core/models/catalogue.models';

type ProdLang = 'en' | 'si' | 'ta';

interface Production {
  id: string;
  name: string;
  genreKey: TranslationKey;
  language: ProdLang;
  dateRange: string;
  basePrice: number;
  image: string;
  /** ISO release date, used to split now-showing vs upcoming. */
  releaseDate?: string;
  /** Raw backend genre string, used for category matching + text search. */
  genre?: string;
}

@Component({
  selector: 'app-productions',
  standalone: true,
  imports: [RouterLink, MatIconModule, HeaderComponent, FooterComponent, TranslatePipe],
  templateUrl: './productions.component.html',
  styleUrl: './productions.component.scss',
})
export class ProductionsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly catalogue = inject(CatalogueService);

  // Loaded productions and request state.
  private readonly all = signal<Production[]>([]);
  readonly loading = signal(false);
  readonly error = signal(false);

  // 'upcoming' | 'now' | null (all) — from the ?upcoming= query param.
  private readonly showFilter = signal<'upcoming' | 'now' | null>(null);

  // Free-text search + category from the home search bar (?q= / ?category=).
  private readonly searchText = signal('');
  private readonly category = signal('');

  // Client-side language filter (applied on top of the loaded results).
  readonly filter = signal<ProdLang | 'all'>('all');

  readonly filters: { value: ProdLang | 'all'; labelKey: TranslationKey }[] = [
    { value: 'all', labelKey: 'prod.filter.all' },
    { value: 'en', labelKey: 'lang.english' },
    { value: 'si', labelKey: 'lang.sinhala' },
    { value: 'ta', labelKey: 'lang.tamil' },
  ];

  readonly productions = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    let list = this.all();

    // Show filter (from ?upcoming=): now-showing vs upcoming by release date.
    const show = this.showFilter();
    if (show === 'upcoming') {
      list = list.filter((p) => p.releaseDate && p.releaseDate > today);
    } else if (show === 'now') {
      list = list.filter((p) => !p.releaseDate || p.releaseDate <= today);
    }

    // Category filter (from the home search category), matched on genre.
    const cat = this.category().trim().toLowerCase();
    if (cat) {
      list = list.filter((p) => (p.genre ?? '').toLowerCase().includes(cat));
    }

    // Free-text search over title + genre.
    const q = this.searchText().trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) || (p.genre ?? '').toLowerCase().includes(q),
      );
    }

    // Language filter.
    const f = this.filter();
    if (f !== 'all') list = list.filter((p) => p.language === f);

    return list;
  });

  ngOnInit(): void {
    // Re-run the search whenever the query params change (e.g. from the home
    // search bar, or the "View All" links carrying an `upcoming` flag).
    this.route.queryParamMap.subscribe((qp) => {
      const params: ProductionSearchParams = { page: 0, size: 100, sort: 'releaseDate,desc' };

      const upcoming = qp.get('upcoming');

      // Search text + category from the home search bar. Filtering is applied
      // client-side because the backend `q` filter isn't reliable here.
      this.searchText.set(qp.get('q') ?? '');
      this.category.set(qp.get('category') ?? '');

      // Now-showing vs upcoming is decided client-side from release dates,
      // because the backend `upcoming` filter isn't reliable here.
      this.showFilter.set(
        upcoming === 'true' ? 'upcoming' : upcoming === 'false' ? 'now' : null,
      );

      this.load(params);
    });
  }

  private load(params: ProductionSearchParams): void {
    this.loading.set(true);
    this.error.set(false);
    this.catalogue.searchProductions(params).subscribe({
      next: (res) => {
        this.all.set((res.content ?? []).map((p) => this.toProduction(p)));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }

  private toProduction(p: ProductionItem): Production {
    return {
      id: p.productionId,
      name: this.titleFor(p),
      genreKey: this.genreKey(p.genre),
      language: this.langFrom(p.language),
      dateRange: this.dateRange(p.releaseDate, p.endDate),
      basePrice: p.baseTicketCost ?? 0,
      image: p.posterImageUrl || 'assets/curtain.png',
      releaseDate: p.releaseDate,
      genre: p.genre,
    };
  }

  private titleFor(p: ProductionItem): string {
    return p.title || '';
  }

  private langFrom(lang: ApiLanguage | undefined): ProdLang {
    return lang === 'SINHALA' ? 'si' : lang === 'TAMIL' ? 'ta' : 'en';
  }

  private genreKey(genre: string | undefined): TranslationKey {
    const g = (genre ?? '').trim().toLowerCase();
    const known = ['drama', 'musical', 'comedy', 'dance', 'opera', 'children', 'historical', 'cultural'];
    return (known.includes(g) ? `genre.${g}` : 'genre.drama') as TranslationKey;
  }

  private dateRange(from: string | undefined, to: string | undefined): string {
    const fmt = (iso?: string) =>
      iso
        ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : '';
    const a = fmt(from);
    const b = fmt(to);
    if (a && b) return `${a} – ${b}`;
    return a || b || '';
  }

  setFilter(value: ProdLang | 'all'): void {
    this.filter.set(value);
  }

  langLabelKey(lang: ProdLang): TranslationKey {
    return lang === 'si' ? 'lang.sinhala' : lang === 'ta' ? 'lang.tamil' : 'lang.english';
  }
}
