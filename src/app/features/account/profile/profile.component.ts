import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../../layout/header/header.component';
import { FooterComponent } from '../../../layout/footer/footer.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { AuthService } from '../../../core/services/auth.service';
import { TranslationKey } from '../../../core/i18n/translations';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, MatIconModule, HeaderComponent, FooterComponent, TranslatePipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  private readonly auth = inject(AuthService);

  readonly editing = signal(false);
  readonly saved = signal(false);

  // Form model, seeded from the signed-in user.
  fullName = this.auth.user()?.name ?? 'Sarasi Sumiyana';
  email = this.auth.user()?.email ?? 'sarasi@email.com';
  phone = '+94 77 123 4567';
  nic = '199012345678';
  memberSince = 'January 2025';

  readonly stats: { value: string; labelKey: TranslationKey; icon: string }[] = [
    { value: '12', labelKey: 'profile.stats.bookings', icon: 'confirmation_number' },
    { value: '2', labelKey: 'profile.stats.upcoming', icon: 'event_upcoming' },
    { value: '10', labelKey: 'profile.stats.shows', icon: 'theater_comedy' },
  ];

  get initials(): string {
    const parts = this.fullName.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
  }

  edit(): void {
    this.editing.set(true);
    this.saved.set(false);
  }

  cancel(): void {
    this.editing.set(false);
  }

  save(event: Event): void {
    event.preventDefault();
    this.editing.set(false);
    this.saved.set(true);
    // Reflect the name change in the shared auth user signal.
    const u = this.auth.user();
    if (u) {
      this.auth.user.set({ ...u, name: this.fullName.trim(), email: this.email.trim() });
    }
  }
}
