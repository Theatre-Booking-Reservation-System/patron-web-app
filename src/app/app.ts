import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ErrorModalComponent } from './shared/error-modal/error-modal.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ErrorModalComponent],
  template: `
    <router-outlet />
    <app-error-modal />
  `,
})
export class App {}
