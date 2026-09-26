// ─────────────────────────────────────────────────────────────────────────────
// Pricing rules for Sapumal Theatre (Scenario 2).
//
// Location prices are a percentage uplift on the production base price. The
// numbers below follow the appendix tables. For the prototype we model a
// representative set of tiers per location rather than every individual seat
// range, while keeping the exact matinee/evening multipliers.
// ─────────────────────────────────────────────────────────────────────────────

import {
  ConcessionOption,
  ConcessionType,
  PriceTier,
  Seat,
  SeatLocation,
  ShowTime,
} from '../models/booking.models';

export const PRICE_TIERS: PriceTier[] = [
  // Stalls
  { id: 'stalls-premium', location: 'stalls', label: 'Stalls AA–DD', matinee: 3.0, evening: 3.5 },
  { id: 'stalls-standard', location: 'stalls', label: 'Stalls A–M', matinee: 2.5, evening: 2.75 },
  { id: 'stalls-rear', location: 'stalls', label: 'Stalls P–V', matinee: 2.0, evening: 2.5 },
  // Circle
  { id: 'circle-premium', location: 'circle', label: 'Circle Premium', matinee: 3.1, evening: 3.2 },
  { id: 'circle-standard', location: 'circle', label: 'Circle Standard', matinee: 2.5, evening: 2.75 },
  { id: 'circle-side', location: 'circle', label: 'Circle Side', matinee: 2.25, evening: 2.5 },
  // Upper Circle
  { id: 'upper-front', location: 'upperCircle', label: 'Upper Circle Front', matinee: 1.75, evening: 2.0 },
  { id: 'upper-mid', location: 'upperCircle', label: 'Upper Circle Mid', matinee: 1.5, evening: 1.7 },
  { id: 'upper-rear', location: 'upperCircle', label: 'Upper Circle (Base)', matinee: 1.0, evening: 1.0 },
];

export function tierById(id: string): PriceTier | undefined {
  return PRICE_TIERS.find((t) => t.id === id);
}

/** Gross price for a seat tier at a given show time, before any concession. */
export function seatPrice(tierId: string, base: number, time: ShowTime): number {
  const tier = tierById(tierId);
  if (!tier) return base;
  const mult = time === 'matinee' ? tier.matinee : tier.evening;
  return Math.round(base * mult);
}

// ── Concessions (non-compound — the single best applies) ───────────────────────
export const CONCESSIONS: ConcessionOption[] = [
  { type: 'none', labelKey: 'book.concession.none', discount: 0, requiresId: false },
  { type: 'child', labelKey: 'book.concession.child', discount: 0.3, requiresId: true },
  { type: 'senior', labelKey: 'book.concession.senior', discount: 0.3, requiresId: true },
  { type: 'group', labelKey: 'book.concession.group', discount: 0.2, requiresId: false },
  { type: 'loyalty', labelKey: 'book.concession.loyalty', discount: 0.1, requiresId: false },
];

export function concessionByType(type: ConcessionType): ConcessionOption {
  return CONCESSIONS.find((c) => c.type === type) ?? CONCESSIONS[0];
}

// ── Seat map generation ────────────────────────────────────────────────────────
// A representative layout: a handful of rows per location, each mapped to a tier.
// Some seats are pre-marked "booked" so the map feels alive.

interface RowSpec {
  location: SeatLocation;
  row: string;
  count: number;
  tierId: string;
}

const ROW_LAYOUT: RowSpec[] = [
  // Stalls
  { location: 'stalls', row: 'AA', count: 12, tierId: 'stalls-premium' },
  { location: 'stalls', row: 'A', count: 14, tierId: 'stalls-standard' },
  { location: 'stalls', row: 'B', count: 14, tierId: 'stalls-standard' },
  { location: 'stalls', row: 'P', count: 16, tierId: 'stalls-rear' },
  // Circle
  { location: 'circle', row: 'CA', count: 14, tierId: 'circle-premium' },
  { location: 'circle', row: 'CB', count: 16, tierId: 'circle-standard' },
  { location: 'circle', row: 'CC', count: 16, tierId: 'circle-side' },
  // Upper Circle
  { location: 'upperCircle', row: 'UA', count: 16, tierId: 'upper-front' },
  { location: 'upperCircle', row: 'UB', count: 18, tierId: 'upper-mid' },
  { location: 'upperCircle', row: 'UC', count: 18, tierId: 'upper-rear' },
];

// Deterministic "already booked" seats so the map is stable between renders.
const BOOKED = new Set([
  'S-AA-3',
  'S-AA-4',
  'S-A-7',
  'S-B-8',
  'S-B-9',
  'S-P-2',
  'S-CA-5',
  'S-CB-11',
  'S-UA-1',
  'S-UB-14',
  'S-UC-9',
]);

// Seats taken out of sale (blocked/held for access, sightline, or maintenance).
// Not bookable, but shown distinctly from already-booked seats.
const UNAVAILABLE = new Set([
  'S-AA-1',
  'S-AA-2',
  'S-P-1',
  'S-CA-1',
  'S-UC-1',
  'S-UC-18',
]);

export function buildSeatMap(): Seat[] {
  const seats: Seat[] = [];
  for (const spec of ROW_LAYOUT) {
    for (let n = 1; n <= spec.count; n++) {
      const id = `S-${spec.row}-${n}`;
      seats.push({
        id,
        row: spec.row,
        number: n,
        tierId: spec.tierId,
        status: BOOKED.has(id) ? 'booked' : UNAVAILABLE.has(id) ? 'unavailable' : 'available',
      });
    }
  }
  return seats;
}

export const LOCATION_LABEL: Record<SeatLocation, string> = {
  stalls: 'Stalls',
  circle: 'Circle',
  upperCircle: 'Upper Circle',
};
