// ─────────────────────────────────────────────────────────────────────────────
// Placeholder catalogue data (productions + performances) until the catalogue
// service is wired in. Shared by the productions listing, details, and flow.
// ─────────────────────────────────────────────────────────────────────────────

import { Performance, Production } from '../models/booking.models';

export const PRODUCTIONS: Production[] = [
  {
    id: 'sanda-katha',
    name: 'Sanda Katha',
    genreKey: 'genre.drama',
    language: 'si',
    dateRange: '24 May – 15 Jun 2025',
    basePrice: 1000,
    durationLabel: 'Approx. 2 hours (with interval)',
    ageLabel: 'Suitable for ages 12+',
    venue: 'Main Theatre, Sapumal Theatre',
    rating: 4.8,
    reviews: 342,
    synopsis:
      'Sanda Katha is a heartfelt drama that explores love, loss and the unspoken words between two souls. A story that will stay with you long after the curtains close.',
    image: 'assets/bg1.jpeg',
  },
  {
    id: 'dharma-patha',
    name: 'Dharma Patha',
    genreKey: 'genre.historical',
    language: 'si',
    dateRange: '01 Jun – 30 Jun 2025',
    basePrice: 1200,
    durationLabel: 'Approx. 2 hours 30 minutes (with interval)',
    ageLabel: 'Suitable for all ages',
    venue: 'Main Theatre, Sapumal Theatre',
    rating: 4.6,
    reviews: 210,
    synopsis:
      'A sweeping historical epic following a kingdom at a crossroads, where duty and conscience collide on the path of righteousness.',
    image: 'assets/curtain.png',
  },
  {
    id: 'yathra-gruwa',
    name: 'Yathra Gruwa',
    genreKey: 'genre.comedy',
    language: 'ta',
    dateRange: '10 Jun – 20 Jul 2025',
    basePrice: 800,
    durationLabel: 'Approx. 1 hour 45 minutes',
    ageLabel: 'Suitable for all ages',
    venue: 'Main Theatre, Sapumal Theatre',
    rating: 4.5,
    reviews: 178,
    synopsis:
      'A riotous comedy of errors aboard an ill-fated journey, where every misunderstanding leads to laughter and every stranger becomes family.',
    image: 'assets/loginBg.png',
  },
  {
    id: 'ahsa-maliga',
    name: 'Ahsa Maliga',
    genreKey: 'genre.musical',
    language: 'en',
    dateRange: '15 Jul – 30 Aug 2025',
    basePrice: 1500,
    durationLabel: 'Approx. 2 hours 15 minutes (with interval)',
    ageLabel: 'Suitable for ages 8+',
    venue: 'Main Theatre, Sapumal Theatre',
    rating: 4.9,
    reviews: 401,
    synopsis:
      'A dazzling musical spectacle of dreams and ambition, set to an original score that lifts the palace of illusions into the sky.',
    image: 'assets/bg1.jpeg',
  },
  {
    id: 'kurulu-bandhana',
    name: 'Kurulu Bandhana',
    genreKey: 'genre.drama',
    language: 'ta',
    dateRange: '05 Aug – 25 Aug 2025',
    basePrice: 1100,
    durationLabel: 'Approx. 2 hours',
    ageLabel: 'Suitable for ages 12+',
    venue: 'Main Theatre, Sapumal Theatre',
    rating: 4.4,
    reviews: 96,
    synopsis:
      'A tender drama about freedom and belonging, told through the bond between a caged bird and the girl who longs to set it free.',
    image: 'assets/curtain.png',
  },
  {
    id: 'the-last-curtain',
    name: 'The Last Curtain',
    genreKey: 'genre.drama',
    language: 'en',
    dateRange: '01 Sep – 20 Sep 2025',
    basePrice: 1400,
    durationLabel: 'Approx. 2 hours 10 minutes (with interval)',
    ageLabel: 'Suitable for ages 15+',
    venue: 'Main Theatre, Sapumal Theatre',
    rating: 4.7,
    reviews: 152,
    synopsis:
      'A gripping backstage drama about an ageing star facing her final performance, and the secrets that surface before the last curtain falls.',
    image: 'assets/loginBg.png',
  },
];

export function productionById(id: string): Production | undefined {
  return PRODUCTIONS.find((p) => p.id === id);
}

// Poya (full-moon) dates in 2025 — performances cannot be scheduled on these.
export const POYA_DATES_2025 = new Set([
  '2025-05-12',
  '2025-06-10',
  '2025-07-10',
  '2025-08-08',
  '2025-09-07',
]);

export function isPoya(isoDate: string): boolean {
  return POYA_DATES_2025.has(isoDate);
}

/** Build a few performances for a production across a given month, skipping Poya days. */
export function performancesFor(productionId: string, year: number, month0: number): Performance[] {
  const out: Performance[] = [];
  const daysInMonth = new Date(year, month0 + 1, 0).getDate();
  // Offer shows on a handful of representative days.
  const showDays = [3, 10, 17, 24, 31].filter((d) => d <= daysInMonth);

  for (const day of showDays) {
    const iso = `${year}-${`${month0 + 1}`.padStart(2, '0')}-${`${day}`.padStart(2, '0')}`;
    if (isPoya(iso)) continue; // spec: no performances on Poya days

    out.push({
      id: `${productionId}-${iso}-mat`,
      productionId,
      date: iso,
      time: 'matinee',
      clockLabel: '3:00 PM',
      availability: 'available',
    });
    out.push({
      id: `${productionId}-${iso}-eve`,
      productionId,
      date: iso,
      time: 'evening',
      clockLabel: '7:00 PM',
      availability: day % 2 === 0 ? 'popular' : 'limited',
    });
  }
  return out;
}
