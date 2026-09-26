import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, MatIconModule, TranslatePipe],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  name = '';
  email = '';
  mobile = '';
  birthday = '';
  nic = '';
  password = '';
  confirm = '';
  agree = false;

  readonly showPassword = signal(false);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly benefits = [
    'register.benefit1',
    'register.benefit2',
    'register.benefit3',
    'register.benefit4',
  ] as const;

  togglePassword() {
    this.showPassword.update((v) => !v);
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.error.set(null);

    if (this.password !== this.confirm) {
      this.error.set('register.mismatch');
      return;
    }
    if (!this.agree) {
      this.error.set('register.mustAgree');
      return;
    }

    this.loading.set(true);
    this.auth
      .register({
        name: this.name.trim(),
        email: this.email.trim(),
        password: this.password,
        nic: this.nic.trim(),
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigateByUrl('/login');
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(this.messageFor(err));
        },
      });
  }

  private messageFor(err: any): string {
    const desc = err?.error?.statusDescription;
    if (typeof desc === 'string' && desc.trim()) return desc;
    if (err?.status === 409) return 'An account with this email already exists.';
    if (err?.status === 0) return 'Cannot reach the server. Please try again.';
    return 'Sign up failed. Please try again.';
  }
}
