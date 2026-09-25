// ─────────────────────────────────────────────────────────────────────────────
// Booking domain models for the Sapumal Theatre patron flow (Scenario 2).
// Prices are derived from a per-production base ticket cost (LKR) multiplied by
// a percentage that depends on the seating location and the show time
// (matinee vs evening).
// ─────────────────────────────────────────────────────────────────────────────

export type ProductionLang = 'en' | 'si' | 'ta';
export type ShowTime = 'matinee' | 'evening';

/** The three seating locations. */
export type SeatLocation = 'stalls' | 'circle' | 'upperCircle';

/** A pricing tier within a location, with matinee/evening multipliers. */
export interface PriceTier {
  id: string;
  location: SeatLocation;
  /** Human label, e.g. "Stalls AA–DD" (Premium). */
  label: string;
  /** Multiplier applied to the base price. e.g. 2.0 means +100%. */
  matinee: number;
  evening: number;
}

export type SeatStatus = 'available' | 'selected' | 'booked';

export interface Seat {
  id: string; // e.g. "S-AA-1"
  row: string;
  number: number;
  tierId: string;
  status: SeatStatus;
}

export interface Performance {
  id: string;
  productionId: string;
  date: string; // ISO date
  time: ShowTime;
  clockLabel: string; // e.g. "7:00 PM"
  availability: 'available' | 'limited' | 'popular';
}

export interface Production {
  id: string;
  name: string;
  genreKey: string;
  language: ProductionLang;
  dateRange: string;
  basePrice: number; // LKR
  durationLabel: string;
  ageLabel: string;
  venue: string;
  rating: number;
  reviews: number;
  synopsis: string;
  image: string;
}

/** Concession types — non-compound; the single best is applied. */
export type ConcessionType = 'none' | 'child' | 'senior' | 'group' | 'loyalty';

export interface ConcessionOption {
  type: ConcessionType;
  labelKey: string;
  /** Fractional discount, e.g. 0.10 = 10% off. */
  discount: number;
  /** Whether an NIC/passport must be captured for box-office verification. */
  requiresId: boolean;
}

/** A single selected seat with its computed gross price (pre-concession). */
export interface SelectedSeat {
  seatId: string;
  label: string; // "C12"
  tierLabel: string;
  price: number;
}

/** The in-progress booking carried across the flow steps. */
export interface BookingDraft {
  production?: Production;
  performance?: Performance;
  seats: SelectedSeat[];
  concession: ConcessionType;
  // Personal info
  fullName: string;
  email: string;
  phone: string;
  /** NIC or passport, required when a concession is claimed. */
  idNumber: string;
  specialRequests: string;
}
