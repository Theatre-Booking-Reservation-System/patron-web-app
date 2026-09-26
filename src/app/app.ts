import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ErrorModalComponent } from './shared/error-modal/error-modal.component';
import { ConfirmModalComponent } from './shared/confirm-modal/confirm-modal.component';
import { ConnectionService } from './core/services/connection.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ErrorModalComponent, ConfirmModalComponent],
  template: `
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
}
