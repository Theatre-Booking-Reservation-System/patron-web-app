import { Component, computed, inject, signal } from '@angular/core';
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

  // Client-side validation patterns.
  // Email: standard address shape.
  readonly emailPattern = '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$';
  // Sri Lankan mobile: local 0xxxxxxxxx (10 digits) or +94xxxxxxxxx.
  readonly mobilePattern = '^(?:\\+94|0)\\d{9}$';
  // NIC: old (9 digits + V/X) or new (12 digits), or a passport (letter + 6-8 digits).
  readonly nicPattern = '^(?:\\d{9}[VvXx]|\\d{12}|[A-Za-z]\\d{6,8})$';

  // Form fields as signals so validity computeds react to every change.
  readonly name = signal('');
  readonly email = signal('');
  readonly mobile = signal('');
  readonly birthday = signal('');
  readonly nic = signal('');
  readonly password = signal('');
  readonly confirm = signal('');
  readonly agree = signal(false);

  readonly showPassword = signal(false);
  readonly showConfirm = signal(false);
  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly error = signal<string | null>(null);

  // Birthday bounds for the date picker.
  // Latest allowed = today (no future dates); earliest = 120 years ago.
  readonly maxDob = new Date().toISOString().split('T')[0];
  readonly minDob = this.isoYearsAgo(120);

  readonly benefits = [
    'register.benefit1',
    'register.benefit2',
    'register.benefit3',
    'register.benefit4',
  ] as const;

  // Per-field validity (used for inline errors and the submit button state).
  readonly nameValid = computed(() => this.name().trim().length >= 2);
  readonly emailValid = computed(() => new RegExp(this.emailPattern).test(this.email().trim()));
  readonly mobileValid = computed(() => new RegExp(this.mobilePattern).test(this.mobile().trim()));
  readonly nicValid = computed(() => new RegExp(this.nicPattern).test(this.nic().trim()));
  // DOB just needs to be present and not in the future — no minimum age.
  readonly ageValid = computed(() => this.isValidDob(this.birthday()));
  readonly passwordStrong = computed(() => this.isPasswordStrong(this.password()));
  readonly passwordsMatch = computed(
    () => this.confirm().length > 0 && this.password() === this.confirm(),
  );

  /** True only when every field passes validation and the terms are accepted. */
  readonly formValid = computed(
    () =>
      this.nameValid() &&
      this.emailValid() &&
      this.mobileValid() &&
      this.ageValid() &&
      this.nicValid() &&
      this.passwordStrong() &&
      this.passwordsMatch() &&
      this.agree(),
  );

  /** ISO date (yyyy-MM-dd) for a date exactly `years` before today. */
  private isoYearsAgo(years: number): string {
    const d = new Date();
    d.setFullYear(d.getFullYear() - years);
    return d.toISOString().split('T')[0];
  }

  private isPasswordStrong(pw: string): boolean {
    // At least 8 chars, with a letter and a number.
    return pw.length >= 8 && /[A-Za-z]/.test(pw) && /\d/.test(pw);
  }

  /** DOB is valid when present, a real date, and not in the future. */
  private isValidDob(isoDate: string): boolean {
    if (!isoDate) return false;
    const dob = new Date(isoDate);
    if (Number.isNaN(dob.getTime())) return false;
    return dob <= new Date();
  }

  togglePassword() {
    this.showPassword.update((v) => !v);
  }

  toggleConfirm() {
    this.showConfirm.update((v) => !v);
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.submitted.set(true);
    this.error.set(null);

    // Guard: the button is disabled while invalid, but double-check here too.
    if (!this.formValid()) {
      return;
    }

    this.loading.set(true);
    this.auth
      .register({
        name: this.name().trim(),
        email: this.email().trim(),
        contactNo: this.mobile().trim(),
        dateOfBirth: this.birthday(),
        nicPassportNo: this.nic().trim(),
        password: this.password(),
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
