import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ErrorModalComponent } from './shared/error-modal/error-modal.component';
import { ConfirmModalComponent } from './shared/confirm-modal/confirm-modal.component';
import { ConnectionService } from './core/services/connection.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ErrorModalComponent, ConfirmModalComponent],
  template: `
    <!-- Skip link: first focusable element, jumps keyboard users past the
         header nav to the current page's main content. -->
    <a class="skip-link" href="#" (click)="skipToMain($event)">Skip to main content</a>

    <router-outlet />
    <app-error-modal />
    <app-confirm-modal />
  `,
})
export class App {
  private readonly connection = inject(ConnectionService);

  constructor() {
    // Watch for browser online/offline events across the whole app.
    this.connection.init();
  }

  /** Move focus (and the viewport) to the active page's <main> region. */
  skipToMain(event: Event): void {
    event.preventDefault();
    const main = document.querySelector('main');
    if (!main) return;
    // Make it programmatically focusable, then focus for screen-reader context.
    if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
    (main as HTMLElement).focus();
    main.scrollIntoView();
  }
}
