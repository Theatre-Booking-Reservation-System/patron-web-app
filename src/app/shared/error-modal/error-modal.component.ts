import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-error-modal',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './error-modal.component.html',
  styleUrl: './error-modal.component.scss',
})
export class ErrorModalComponent {
  private readonly notifications = inject(NotificationService);
  readonly error = this.notifications.error;

  close(): void {
    this.notifications.clear();
  }
}
