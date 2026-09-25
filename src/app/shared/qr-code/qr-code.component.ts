import { Component, Input, computed, signal } from '@angular/core';

/**
 * Builds a deterministic QR-style matrix (with the three finder squares) from
 * a value. Shared by the on-screen SVG and the PDF renderer so both look the
 * same. Returns a size×size grid of booleans (true = dark cell).
 */
export function buildQrMatrix(value: string, size = 25): boolean[][] {
  const seedStr = value || 'SAPUMAL';
  const grid: boolean[][] = [];

  const isFinder = (x: number, y: number): boolean => {
    const inBox = (bx: number, by: number) => x >= bx && x < bx + 7 && y >= by && y < by + 7;
    return inBox(0, 0) || inBox(size - 7, 0) || inBox(0, size - 7);
  };
  const finderOn = (x: number, y: number): boolean => {
    const local = (bx: number, by: number) => {
      const lx = x - bx;
      const ly = y - by;
      const border = lx === 0 || lx === 6 || ly === 0 || ly === 6;
      const centre = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4;
      return border || centre;
    };
    if (x < 7 && y < 7) return local(0, 0);
    if (x >= size - 7 && y < 7) return local(size - 7, 0);
    if (x < 7 && y >= size - 7) return local(0, size - 7);
    return false;
  };

  let h = 2166136261;
  for (let k = 0; k < seedStr.length; k++) {
    h ^= seedStr.charCodeAt(k);
    h = Math.imul(h, 16777619);
  }

  for (let y = 0; y < size; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < size; x++) {
      if (isFinder(x, y)) {
        row.push(finderOn(x, y));
      } else {
        const n = Math.imul(h ^ (x * 73856093) ^ (y * 19349663), 2654435761);
        row.push(((n >>> 13) & 1) === 1);
      }
    }
    grid.push(row);
  }
  return grid;
}

/**
 * Lightweight deterministic QR-style placeholder (no external dependency).
 * It renders a pseudo-random but stable matrix derived from the input value,
 * with the three finder squares, so it reads visually as a QR code for the
 * prototype. Swap for a real QR encoder when the booking service is wired in.
 */
@Component({
  selector: 'app-qr-code',
  standalone: true,
  template: `
    <svg
      [attr.viewBox]="'0 0 ' + grid + ' ' + grid"
      class="qr"
      role="img"
      [attr.aria-label]="'QR code ' + value"
    >
      <rect [attr.width]="grid" [attr.height]="grid" fill="#ffffff" />
      @for (cell of cells(); track cell.i) {
        @if (cell.on) {
          <rect [attr.x]="cell.x" [attr.y]="cell.y" width="1" height="1" fill="#1a1a1a" />
        }
      }
    </svg>
  `,
  styles: [
    `
      .qr {
        width: 100%;
        height: 100%;
        display: block;
        shape-rendering: crispEdges;
      }
    `,
  ],
})
export class QrCodeComponent {
  readonly grid = 25;
  private readonly _value = signal('SAPUMAL');

  @Input() set value(v: string) {
    this._value.set(v || 'SAPUMAL');
  }
  get value(): string {
    return this._value();
  }

  readonly cells = computed(() => {
    const matrix = buildQrMatrix(this._value(), this.grid);
    const out: { i: number; x: number; y: number; on: boolean }[] = [];
    let i = 0;
    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        out.push({ i: i++, x, y, on: matrix[y][x] });
      }
    }
    return out;
  });
}
