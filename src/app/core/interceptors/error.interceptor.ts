import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';
import { ConnectionService } from '../services/connection.service';

/** Backend uses HTTP 440 to signal an expired session (force re-login). */
const SESSION_EXPIRED = 440;

/**
 * Statuses that mean "we couldn't reach a working backend": a network/CORS
 * failure (0) or the gateway being unavailable. These send the user to the
 * dedicated connection-error page instead of a transient modal.
 */
const CONNECTION_ERRORS = new Set([0, 502, 503, 504]);

// Requests that show their OWN inline error (so no global modal on failure).
const SILENT_PATHS: string[] = ['/auth/login'];

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);
  const auth = inject(AuthService);
  const connection = inject(ConnectionService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === SESSION_EXPIRED) {
        // 440 → session expired: sign out and go to /login from any screen.
        auth.logout();
        router.navigateByUrl('/login');
      } else if (CONNECTION_ERRORS.has(err.status)) {
        // Backend/network unavailable → full connection-error page with retry.
        connection.markOffline(router.url);
        router.navigateByUrl('/connection-error');
      } else if (!SILENT_PATHS.some((p) => req.url.includes(p))) {
        // Every other error (including 401) → stay put and show the modal.
        notifications.showError({
          title: titleFor(err.status),
          message: messageFor(err),
          code: err.error?.statusCode,
        });
      }

      return throwError(() => err);
    }),
  );
};

function titleFor(status: number): string {
  switch (status) {
    case 0:
      return 'Connection error';
    case 401:
      return 'Unauthorized';
    case 403:
      return 'Access denied';
    case 404:
      return 'Not found';
    case 500:
    case 502:
    case 503:
      return 'Server error';
    default:
      return 'Something went wrong';
  }
}

function messageFor(err: HttpErrorResponse): string {
  // Prefer the backend's own description when provided.
  const desc = err.error?.statusDescription;
  if (typeof desc === 'string' && desc.trim()) return desc;

  switch (err.status) {
    case 0:
      return 'Cannot reach the server. Please check your connection and try again.';
    case 401:
      return 'You are not authorized to perform this action.';
    case 403:
      return "You don't have permission to perform this action.";
    case 404:
      return 'The requested resource could not be found.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}
