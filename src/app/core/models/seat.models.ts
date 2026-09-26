// ─────────────────────────────────────────────────────────────────────────────
// Seat Service API models (mirrors docs/api/seat.json).
// Seat-zone catalogue and per-performance seat availability. Requires a JWT.
// ─────────────────────────────────────────────────────────────────────────────

import { CommonResponse } from './auth.models';

export type SeatSection = 'STALLS' | 'CIRCLE' | 'UPPER_CIRCLE';
export type PerformanceSeatStatus = 'AVAILABLE' | 'HELD' | 'BOOKED' | 'BLOCKED';

export interface SeatZoneItem {
  zoneId: string;
  section?: SeatSection;
  zoneName?: string;
  /** Matinee price percentage applied to the base ticket cost. */
  matineePct?: number;
  /** Evening price percentage applied to the base ticket cost. */
  eveningPct?: number;
}

export interface SeatZoneListResponse extends CommonResponse {
  seatZones?: SeatZoneItem[];
}

export interface PerformanceSeatItem {
  perfSeatId: string;
  seatId: string;
  zoneId?: string;
  section?: SeatSection;
  zoneName?: string;
  rowLabel?: string;
  seatNumber?: number;
  wheelchairSpace?: boolean;
  status?: PerformanceSeatStatus;
  /** ISO date-time until which a HELD seat remains reserved. */
  heldUntil?: string;
}

export interface PerformanceSeatListResponse extends CommonResponse {
  performanceId?: string;
  seats?: PerformanceSeatItem[];
}
