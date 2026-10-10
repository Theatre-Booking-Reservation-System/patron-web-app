import { BookingStateService } from './booking-state.service';
import { SelectedSeat } from '../models/booking.models';

function seat(id: string, price: number): SelectedSeat {
  return { seatId: id, label: id, tierLabel: 'Stalls', price };
}

describe('BookingStateService', () => {
  let svc: BookingStateService;

  beforeEach(() => {
    svc = new BookingStateService();
  });

  it('starts with an empty draft and zero totals', () => {
    expect(svc.draft().seats).toEqual([]);
    expect(svc.subtotal()).toBe(0);
    expect(svc.discount()).toBe(0);
    expect(svc.bookingFee()).toBe(0); // no fee when no seats
    expect(svc.total()).toBe(0);
  });

  it('subtotal sums the selected seat prices', () => {
    svc.setSeats([seat('A1', 3000), seat('A2', 3000)]);
    expect(svc.subtotal()).toBe(6000);
  });

  it('charges the flat booking fee once seats are selected', () => {
    svc.setSeats([seat('A1', 3000)]);
    expect(svc.bookingFee()).toBe(100);
  });

  it('applies the loyalty concession discount to the subtotal', () => {
    svc.setSeats([seat('A1', 3000), seat('A2', 3000)]); // 6000
    svc.setConcession('loyalty'); // 10%
    expect(svc.discount()).toBe(600);
    // total = subtotal - discount + fee = 6000 - 600 + 100
    expect(svc.total()).toBe(5500);
  });

  it('applies the larger child discount (30%)', () => {
    svc.setSeats([seat('A1', 1000)]);
    svc.setConcession('child');
    expect(svc.discount()).toBe(300);
    expect(svc.total()).toBe(1000 - 300 + 100);
  });

  it('requiresId reflects the active concession', () => {
    svc.setConcession('none');
    expect(svc.requiresId()).toBe(false);
    svc.setConcession('child'); // requires ID
    expect(svc.requiresId()).toBe(true);
    svc.setConcession('group'); // does not
    expect(svc.requiresId()).toBe(false);
  });

  it('patchDetails merges without clobbering unrelated fields', () => {
    svc.patchDetails({ fullName: 'Nimal Perera' });
    svc.patchDetails({ email: 'nimal@example.com' });
    expect(svc.draft().fullName).toBe('Nimal Perera');
    expect(svc.draft().email).toBe('nimal@example.com');
  });

  it('reset clears seats, booking id and qr code', () => {
    svc.setSeats([seat('A1', 3000)]);
    svc.bookingId.set('BK-123');
    svc.qrCode.set('data:image/png;base64,xxx');
    svc.reset();
    expect(svc.draft().seats).toEqual([]);
    expect(svc.bookingId()).toBeNull();
    expect(svc.qrCode()).toBeNull();
  });

  it('confirmBooking generates a reference and is idempotent', () => {
    const ref1 = svc.confirmBooking();
    expect(ref1).toMatch(/^BK\d{8}-\d{3}$/);
    // calling again returns the same reference
    expect(svc.confirmBooking()).toBe(ref1);
  });
});
