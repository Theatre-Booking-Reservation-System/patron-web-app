import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { LoginResponse } from '../models/auth.models';
import { installLocalStorageMock } from '../../../testing/local-storage-mock';

const base = environment.services.identity;

const loginOk: LoginResponse = {
  statusCode: '200',
  statusDescription: 'OK',
  accessToken: 'jwt-token',
  tokenType: 'Bearer',
  expiresIn: 3600,
  userId: 'patron-1',
  name: 'Nimal Perera',
  email: 'nimal@example.com',
  role: 'PATRON',
};

describe('AuthService', () => {
  let svc: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    installLocalStorageMock();
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });
    svc = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http?.verify());

  it('starts signed out', () => {
    expect(svc.isAuthenticated()).toBe(false);
    expect(svc.user()).toBeNull();
    expect(svc.role()).toBeNull();
  });

  it('persists the session on a successful login', () => {
    svc.login({ email: 'nimal@example.com', password: 'secret1' }).subscribe();

    const req = http.expectOne(`${base}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(loginOk);

    expect(svc.isAuthenticated()).toBe(true);
    expect(svc.user()?.userId).toBe('patron-1');
    expect(svc.role()).toBe('PATRON');
    expect(svc.token).toBe('jwt-token');
  });

  it('throws when the response has no access token', () => {
    const spy = vi.fn();
    svc
      .login({ email: 'x@y.z', password: 'bad' })
      .subscribe({ error: spy });

    http.expectOne(`${base}/auth/login`).flush({
      statusCode: '401',
      statusDescription: 'Invalid credentials',
      accessToken: '',
    });

    expect(spy).toHaveBeenCalled();
    expect(svc.isAuthenticated()).toBe(false);
  });

  it('logout clears the user and stored token', () => {
    svc.login({ email: 'nimal@example.com', password: 'secret1' }).subscribe();
    http.expectOne(`${base}/auth/login`).flush(loginOk);
    expect(svc.isAuthenticated()).toBe(true);

    svc.logout();
    expect(svc.isAuthenticated()).toBe(false);
    expect(svc.token).toBeNull();
  });

  it('restores a persisted user from storage', () => {
    // Seed storage via a successful login...
    svc.login({ email: 'nimal@example.com', password: 'secret1' }).subscribe();
    http.expectOne(`${base}/auth/login`).flush(loginOk);

    // ...then a brand-new injector should read it back from localStorage.
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });
    const svc2 = TestBed.inject(AuthService);
    // Point the shared controller at the new injector so afterEach verifies it.
    http = TestBed.inject(HttpTestingController);
    expect(svc2.isAuthenticated()).toBe(true);
    expect(svc2.user()?.email).toBe('nimal@example.com');
  });
});
