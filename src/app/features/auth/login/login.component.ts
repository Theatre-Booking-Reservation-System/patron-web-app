import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';

  readonly showPassword = signal(false);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  togglePassword() {
    this.showPassword.update((v) => !v);
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.error.set(null);
    this.loading.set(true);

    this.auth.login({ email: this.email.trim(), password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(this.messageFor(err));
      },
    });
  }

  private messageFor(err: any): string {
    // Prefer the backend's own description when present.
    const desc = err?.error?.statusDescription;
    if (typeof desc === 'string' && desc.trim()) return desc;
    // Thrown Error (e.g. missing accessToken on a 2xx response).
    if (err?.message && !err?.status) return err.message;

    switch (err?.status) {
      case 401:
        return 'Invalid email or password.';
      case 423:
        return 'Account temporarily locked after too many failed attempts.';
      case 400:
        return 'Please enter a valid email and password.';
      case 0:
        return 'Cannot reach the server. Please try again.';
      default:
        return 'Sign in failed. Please try again.';
    }
  }
}
