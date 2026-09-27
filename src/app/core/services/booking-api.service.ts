import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  BookingListResponse,
  BookingRequest,
  BookingResponse,
  BookingSummaryResponse,
  PerformanceBookedSeatsResponse,
  RecentBookingsResponse,
} from '../models/booking-api.models';

/**
 * Booking Service client — create, look up and cancel bookings.
 * The auth interceptor attaches the JWT required by every endpoint.
 * See docs/api/booking.json.
 *
 * Named BookingApiService to avoid confusion with the in-app
 * BookingStateService that holds the draft across the flow steps.
 */
@Injectable({ providedIn: 'root' })
export class BookingApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.services.booking;

  /** Create a booking from selected seats, ticket type and payment details. */
  createBooking(payload: BookingRequest): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(`${this.baseUrl}/bookings`, payload);
  }

  /** Booked seat ids/refs for a performance (to grey out already-taken seats). */
  getBookedSeats(performanceId: string): Observable<PerformanceBookedSeatsResponse> {
    return this.http.get<PerformanceBookedSeatsResponse>(
      `${this.baseUrl}/performances/${performanceId}/bookings`,
    );
  }

  /** Look up a booking by its human-readable reference (e.g. STB-20260913-00847). */
  getBookingByRef(ref: string): Observable<BookingResponse> {
    return this.http.get<BookingResponse>(`${this.baseUrl}/bookings/${ref}`);
  }

  /** List all bookings for a patron, most recent first. */
  getBookingsByPatronId(patronId: string): Observable<BookingListResponse> {
    return this.http.get<BookingListResponse>(`${this.baseUrl}/patrons/${patronId}/bookings`);
  }

  /** Cancel a booking by id. Paid bookings are marked for refund. */
  cancelBooking(bookingId: string): Observable<BookingResponse> {
    return this.http.put<BookingResponse>(`${this.baseUrl}/bookings/${bookingId}/cancel`, {});
  }

  // ── Admin dashboard aggregates (not used by the patron UI) ─────────────────

  /** Recent bookings across all patrons (admin dashboard). Defaults to 5 rows. */
  getRecentBookings(limit?: number): Observable<RecentBookingsResponse> {
    const params = limit != null ? new HttpParams().set('limit', String(limit)) : undefined;
    return this.http.get<RecentBookingsResponse>(`${this.baseUrl}/bookings/recent`, { params });
  }

  /** Aggregate booking totals + per-month overview (admin dashboard). */
  getBookingSummary(): Observable<BookingSummaryResponse> {
    return this.http.get<BookingSummaryResponse>(`${this.baseUrl}/bookings/summary`);
  }
}
