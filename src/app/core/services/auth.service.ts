import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthUser,
  LoginRequest,
  LoginResponse,
  LoyaltyEnrollResponse,
  PatronDetailResponse,
  PatronRegisterRequest,
  PatronRegisterResponse,
} from '../models/auth.models';

// localStorage key names (not secrets — just where the session is cached).
const STORAGE = {
  token: 'sapumal-patron-token',
  user: 'sapumal-patron-user',
} as const;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.services.identity;

  // Current user (null when signed out)
  readonly user = signal<AuthUser | null>(this.readUser());
  readonly isAuthenticated = computed(() => this.user() !== null);
  readonly role = computed(() => this.user()?.role ?? null);

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, credentials).pipe(
      tap((res) => {
        // The API signals failure via statusCode/description.
        if (!res.accessToken) {
          throw new Error(res.statusDescription || 'Invalid credentials');
        }
        this.persistSession(res);
      }),
    );
  }

  register(payload: PatronRegisterRequest): Observable<PatronRegisterResponse> {
    return this.http.post<PatronRegisterResponse>(`${this.baseUrl}/patron/register`, payload);
  }

  /** Enrol a patron in the loyalty programme. Returns the generated card number. */
  enrollLoyalty(patronId: string): Observable<LoyaltyEnrollResponse> {
    return this.http.post<LoyaltyEnrollResponse>(
      `${this.baseUrl}/patron/${patronId}/loyalty`,
      {},
    );
  }

  /** Fetch a single patron's details (requires authentication). */
  getPatron(patronId: string): Observable<PatronDetailResponse> {
    return this.http.get<PatronDetailResponse>(`${this.baseUrl}/patron/${patronId}`);
  }

  logout(): void {
    this.user.set(null);
    try {
      localStorage.removeItem(STORAGE.token);
      localStorage.removeItem(STORAGE.user);
    } catch {
      /* storage unavailable */
    }
  }

  /** The raw JWT for the Authorization header. */
  get token(): string | null {
    try {
      return localStorage.getItem(STORAGE.token);
    } catch {
      return null;
    }
  }

  private persistSession(res: LoginResponse): void {
    const user: AuthUser = {
      userId: res.userId,
      name: res.name,
      email: res.email,
      role: res.role,
    };
    this.user.set(user);
    try {
      localStorage.setItem(STORAGE.token, res.accessToken);
      localStorage.setItem(STORAGE.user, JSON.stringify(user));
    } catch {
      /* storage unavailable */
    }
  }

  private readUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(STORAGE.user);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}
