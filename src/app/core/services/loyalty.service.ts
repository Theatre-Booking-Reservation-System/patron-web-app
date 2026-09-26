import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, map, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { LoyaltyEnrollResponse } from '../models/auth.models';

const STORAGE_KEY = 'sapumal-patron-loyalty';
const CARD_KEY = 'sapumal-patron-loyalty-card';

/**
 * Loyalty membership for the signed-in patron. Enrolment calls the Identity
 * Service (POST /patron/{patronId}/loyalty); membership is cached locally so
 * the UI reflects it across reloads. Loyalty members get a 10% per-ticket
 * discount and can book early-access productions before the release date.
 */
@Injectable({ providedIn: 'root' })
export class LoyaltyService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = environment.services.identity;

  readonly isMember = signal<boolean>(this.readFlag());
  readonly loyaltyCardNo = signal<string | null>(this.readCard());

  /**
   * Enrol the signed-in patron via the API. On success, marks the patron as a
   * member and stores the returned loyalty card number.
   */
  enroll(): Observable<LoyaltyEnrollResponse> {
    const patronId = this.auth.user()?.userId;
    if (!patronId) {
      // No signed-in patron — surface as an error the caller can handle.
      throw new Error('Not signed in');
    }
    return this.http
      .post<LoyaltyEnrollResponse>(`${this.baseUrl}/patron/${patronId}/loyalty`, {})
      .pipe(
        tap((res) => {
          if (!res.loyaltyCardNo) {
            throw new Error(res.statusDescription || 'Enrolment failed');
          }
          this.isMember.set(true);
          this.loyaltyCardNo.set(res.loyaltyCardNo);
          this.persist(true, res.loyaltyCardNo);
        }),
      );
  }

  /**
   * Sync membership from the backend for the signed-in patron by reading
   * GET /patron/{patronId} and reflecting `loyaltyHolder`. Call this after login.
   * Returns the resolved membership status.
   */
  syncMembership(): Observable<boolean> {
    const patronId = this.auth.user()?.userId;
    if (!patronId) {
      return of(false);
    }
    return this.auth.getPatron(patronId).pipe(
      map((res) => {
        const holder = res.patron?.loyaltyHolder === true;
        const cardNo = res.patron?.loyaltyCardNo ?? null;
        this.isMember.set(holder);
        this.loyaltyCardNo.set(holder ? cardNo : null);
        this.persist(holder, holder ? cardNo : null);
        return holder;
      }),
      catchError(() => of(this.isMember())),
    );
  }

  /** Clear local membership state (does not call the API). */
  cancel(): void {
    this.isMember.set(false);
    this.loyaltyCardNo.set(null);
    this.persist(false, null);
  }

  private readFlag(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  }

  private readCard(): string | null {
    try {
      return localStorage.getItem(CARD_KEY);
    } catch {
      return null;
    }
  }

  private persist(isMember: boolean, cardNo: string | null): void {
    try {
      localStorage.setItem(STORAGE_KEY, String(isMember));
      if (cardNo) {
        localStorage.setItem(CARD_KEY, cardNo);
      } else {
        localStorage.removeItem(CARD_KEY);
      }
    } catch {
      /* storage unavailable */
    }
  }
}
