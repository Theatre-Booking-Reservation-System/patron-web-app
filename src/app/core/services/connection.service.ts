import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Tracks whether the backend/network is reachable and remembers where the user
 * was, so the connection-error page can offer a meaningful "Try again".
 *
 * Two detection layers:
 *  1. Reactive  — the errorInterceptor calls markOffline() when a request fails
 *                 with a connection-class status (0/502/503/504).
 *  2. Proactive — browser `offline`/`online` events fire the moment the device
 *                 loses/regains its network link, even with no request in flight.
 */
@Injectable({ providedIn: 'root' })
export class ConnectionService {
  private readonly router = inject(Router);

  /** True while we believe the backend/network is unavailable. */
  readonly offline = signal(false);

  /** The in-app URL the user was on when the connection failed. */
  private lastUrl = '/';

  /** Wire browser online/offline events once, at app startup. */
  init(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('offline', () => {
      this.markOffline(this.router.url);
      this.router.navigateByUrl('/connection-error');
    });

    window.addEventListener('online', () => {
      this.markOnline();
      // If the user is stuck on the connection page, bring them back automatically.
      if (this.router.url.startsWith('/connection-error')) {
        this.router.navigateByUrl(this.lastUrl);
      }
    });

    // If the app boots while already offline, reflect that immediately.
    if (!navigator.onLine) {
      this.markOffline(this.router.url);
    }
  }

  markOffline(fromUrl: string): void {
    // Don't overwrite with the error page's own URL.
    if (fromUrl && !fromUrl.startsWith('/connection-error')) {
      this.lastUrl = fromUrl;
    }
    this.offline.set(true);
  }

  markOnline(): void {
    this.offline.set(false);
  }

  /** Where "Try again" should send the user back to. */
  get retryUrl(): string {
    return this.lastUrl;
  }
}
