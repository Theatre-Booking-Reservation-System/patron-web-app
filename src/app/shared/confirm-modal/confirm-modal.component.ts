import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmService } from '../../core/services/confirm.service';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [MatIconModule, TranslatePipe],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.scss',
})
export class ConfirmModalComponent {
  private readonly confirm = inject(ConfirmService);
  readonly current = this.confirm.current;

  onConfirm(): void {
    this.confirm.confirm();
  }

  onCancel(): void {
    this.confirm.dismiss();
  }
}
