import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { errorInterceptor } from './error.interceptor';
import { AuthService } from '../services/auth.service';
import { ConnectionService } from '../services/connection.service';
import { NotificationService } from '../services/notification.service';
import { installLocalStorageMock } from '../../../testing/local-storage-mock';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let router: Router;
  let auth: AuthService;
  let connection: ConnectionService;
  let notifications: NotificationService;

  beforeEach(() => {
    installLocalStorageMock();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    auth = TestBed.inject(AuthService);
    connection = TestBed.inject(ConnectionService);
    notifications = TestBed.inject(NotificationService);

    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
  });

  afterEach(() => httpMock.verify());

  it('on 440 logs out and routes to /login', () => {
    const logout = vi.spyOn(auth, 'logout');
    http.get('/api/x').subscribe({ error: () => {} });
    httpMock.expectOne('/api/x').flush(null, { status: 440, statusText: 'Session Expired' });

    expect(logout).toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('on a connection error (503) marks offline and routes to /connection-error', () => {
    const markOffline = vi.spyOn(connection, 'markOffline');
    http.get('/api/x').subscribe({ error: () => {} });
    httpMock.expectOne('/api/x').flush(null, { status: 503, statusText: 'Unavailable' });

    expect(markOffline).toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/connection-error');
  });

  it('on a generic error (404) shows a notification modal', () => {
    const showError = vi.spyOn(notifications, 'showError');
    http.get('/api/x').subscribe({ error: () => {} });
    httpMock.expectOne('/api/x').flush(
      { statusCode: 'E404', statusDescription: 'Missing' },
      { status: 404, statusText: 'Not Found' },
    );

    expect(showError).toHaveBeenCalledTimes(1);
    const arg = showError.mock.calls[0][0];
    expect(arg.message).toBe('Missing'); // backend description preferred
  });

  it('does not show a modal for the silent /auth/login path', () => {
    const showError = vi.spyOn(notifications, 'showError');
    http.post('/auth/login', {}).subscribe({ error: () => {} });
    httpMock.expectOne('/auth/login').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(showError).not.toHaveBeenCalled();
  });
});
