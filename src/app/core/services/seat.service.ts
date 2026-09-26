import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PerformanceSeatListResponse,
  SeatZoneListResponse,
} from '../models/seat.models';

/**
 * Seat Service client — seat zones and per-performance seat availability.
 * The auth interceptor attaches the JWT required by every endpoint.
 * See docs/api/seat.json.
 */
@Injectable({ providedIn: 'root' })
export class SeatService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.services.seat;

  /** List every seat zone defined for the theatre. */
  getAllSeatZones(): Observable<SeatZoneListResponse> {
    return this.http.get<SeatZoneListResponse>(`${this.baseUrl}/seat-zones`);
  }

  /** List seats and their availability for a given performance. */
  getSeatsByPerformanceId(performanceId: string): Observable<PerformanceSeatListResponse> {
    return this.http.get<PerformanceSeatListResponse>(
      `${this.baseUrl}/performances/${performanceId}/seats`,
    );
  }
}
