import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  icon?: string;
  /** Translation key or literal text. */
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
}

/**
 * Holds a single active confirmation dialog. A branded, SweetAlert-style modal
 * rendered once at the app root reads this signal.
 */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly current = signal<ConfirmOptions | null>(null);

  open(options: ConfirmOptions): void {
    this.current.set(options);
  }

  confirm(): void {
    const opts = this.current();
    this.current.set(null);
    opts?.onConfirm();
  }

  dismiss(): void {
    this.current.set(null);
  }
}
