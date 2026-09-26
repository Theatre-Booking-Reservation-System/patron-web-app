// ─────────────────────────────────────────────────────────────────────────────
// Booking Service API models (mirrors docs/api/booking.json).
// Creation, lookup and cancellation of theatre bookings. Requires a JWT.
// Note: named booking-api.models to avoid clashing with the app's internal
// domain models in booking.models.ts.
// ─────────────────────────────────────────────────────────────────────────────

import { CommonResponse } from './auth.models';

export type ApiConcessionType = 'UNDER_16' | 'OVER_70' | 'LARGE_PARTY';

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED_PATRON'
  | 'CANCELLED_ADMIN'
  | 'EXPIRED';

export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED' | 'FAILED';

export interface BookingLineRequest {
  perfSeatId: string;
  seatRef?: string;
  zoneName?: string;
  sessionType?: string;
  concessionType?: ApiConcessionType;
  /** NIC/passport captured when a concession is claimed. */
  nicPassport?: string;
  basePriceLkr?: number;
  concessionDiscLkr?: number;
  loyaltyDiscLkr?: number;
  vatLkr?: number;
  finalPriceLkr?: number;
}

export interface BookingRequest {
  patronId?: string;
  guestEmail?: string;
  performanceId: string;
  paymentToken?: string;
  lines: BookingLineRequest[];
}

export interface BookingLineItem {
  lineId?: string;
  perfSeatId?: string;
  seatRef?: string;
  zoneName?: string;
  sessionType?: string;
  concessionType?: ApiConcessionType;
  basePriceLkr?: number;
  concessionDiscLkr?: number;
  loyaltyDiscLkr?: number;
  vatLkr?: number;
  finalPriceLkr?: number;
}

export interface BookingResponse extends CommonResponse {
  bookingId?: string;
  bookingRef?: string;
  patronId?: string;
  guestEmail?: string;
  performanceId?: string;
  status?: BookingStatus;
  isFlagged?: boolean;
  subtotalLkr?: number;
  discountLkr?: number;
  vatLkr?: number;
  totalLkr?: number;
  paymentToken?: string;
  paymentStatus?: PaymentStatus;
  createdAt?: string;
  lines?: BookingLineItem[];
}

export interface BookingItem {
  bookingId: string;
  bookingRef?: string;
  performanceId?: string;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  totalLkr?: number;
  createdAt?: string;
}

export interface BookingListResponse extends CommonResponse {
  bookings?: BookingItem[];
}
