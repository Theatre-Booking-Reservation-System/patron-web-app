// ─────────────────────────────────────────────────────────────────────────────
// Booking Service API models (mirrors docs/api/booking.json).
// Creation, lookup and cancellation of theatre bookings. Requires a JWT.
// Named booking-api.models to avoid clashing with the app's internal domain
// models in booking.models.ts.
// ─────────────────────────────────────────────────────────────────────────────

import { CommonResponse } from './auth.models';

export type TicketType = 'REGULAR' | 'GROUP' | 'LOYALTY';

export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'EWALLET' | 'BANK_TRANSFER';

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED_PATRON'
  | 'CANCELLED_ADMIN'
  | 'EXPIRED';

export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED' | 'FAILED';

/** A seat chosen for a booking. */
export interface SeatSelection {
  seatId: string;
  seatRef?: string;
  zoneName?: string;
  section?: string;
}

/** Card details submitted with a booking (card payment methods). */
export interface PaymentDetails {
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
  cardHolderName?: string;
}

export interface BookingRequest {
  patronId?: string;
  performanceId: string;
  seats: SeatSelection[];
  ticketType?: TicketType;
  paymentMethod?: PaymentMethod;
  paymentDetails?: PaymentDetails;
}

/** A seat as returned on a booking. */
export interface BookingSeatItem {
  seatId?: string;
  seatRef?: string;
  zoneName?: string;
  section?: string;
}

export interface BookingResponse extends CommonResponse {
  bookingId?: string;
  bookingRef?: string;
  patronId?: string;
  performanceId?: string;
  productionName?: string;
  performanceDate?: string;
  performanceTime?: string;
  seats?: BookingSeatItem[];
  ticketType?: TicketType;
  totalLkr?: number;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  cardLast4?: string;
  createdAt?: string;
  qrCode?: string;
}

export interface BookingItem {
  bookingId: string;
  bookingRef?: string;
  performanceId?: string;
  seats?: BookingSeatItem[];
  ticketType?: TicketType;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  totalLkr?: number;
  createdAt?: string;
}

export interface BookingListResponse extends CommonResponse {
  bookings?: BookingItem[];
}

/** Booked seats for a performance (to grey out on the seat map). */
export interface PerformanceBookedSeatsResponse extends CommonResponse {
  performanceId?: string;
  bookedSeatIds?: string[];
  bookedSeatRefs?: string[];
}

// ── Admin dashboard aggregates (not used by the patron app UI) ───────────────

export interface MonthlyBookingPoint {
  month?: string;
  label?: string;
  bookings?: number;
  revenue?: number;
}

export interface BookingSummaryResponse extends CommonResponse {
  totalBookings?: number;
  totalRevenue?: number;
  bookingOverview?: MonthlyBookingPoint[];
}

export interface RecentBookingItem {
  bookingId?: string;
  bookingRef?: string;
  patronId?: string;
  customerName?: string;
  performanceId?: string;
  showName?: string;
  performanceDate?: string;
  performanceTime?: string;
  totalLkr?: number;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  createdAt?: string;
}

export interface RecentBookingsResponse extends CommonResponse {
  bookings?: RecentBookingItem[];
}
