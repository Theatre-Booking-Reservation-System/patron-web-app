import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ConnectionService } from '../../core/services/connection.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-connection-error',
  standalone: true,
  imports: [MatIconModule, TranslatePipe],
  templateUrl: './connection-error.component.html',
  styleUrl: './connection-error.component.scss',
})
export class ConnectionErrorComponent {
  private readonly connection = inject(ConnectionService);
  private readonly router = inject(Router);

  readonly retrying = signal(false);
  /** Set when a retry was attempted but the device is still offline. */
  readonly stillOffline = signal(false);

  /**
   * Return the user to the page they were on. Re-navigating re-triggers that
   * screen's data loads; if the backend is back, it renders normally.
   */
  tryAgain(): void {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.stillOffline.set(true);
      return;
    }

    this.stillOffline.set(false);
    this.retrying.set(true);
    this.connection.markOnline();
    const target = this.connection.retryUrl;

    // Force a fresh navigation even if the target === current logical route.
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigateByUrl(target).finally(() => this.retrying.set(false));
    });
  }
}
