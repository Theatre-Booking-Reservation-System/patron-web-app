import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <main class="home">
      <h1 class="page-title">{{ appName }}</h1>
      <p class="muted">Live theatre, real emotions. The patron booking portal is being set up.</p>
    </main>
  `,
  styles: [
    `
      .home {
        max-width: 960px;
        margin: 0 auto;
        padding: 3rem 1.5rem;
      }
    `,
  ],
})
export class HomeComponent {
  protected readonly appName = environment.appName;
}
