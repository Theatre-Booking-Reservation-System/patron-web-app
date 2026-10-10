import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BookingDetailsComponent } from './booking-details.component';
import { BookingStateService } from '../../../core/services/booking-state.service';
import { installLocalStorageMock } from '../../../../testing/local-storage-mock';

describe('BookingDetailsComponent: form validation', () => {
  let cmp: BookingDetailsComponent;
  let http: HttpTestingController;

  beforeEach(() => {
    installLocalStorageMock();
    TestBed.configureTestingModule({
      imports: [BookingDetailsComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    cmp = TestBed.createComponent(BookingDetailsComponent).componentInstance;
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify({ ignoreCancelled: true }));

  it('requires a full name of at least 2 characters', () => {
    cmp.fullName.set('A');
    expect(cmp.nameValid()).toBe(false);
    cmp.fullName.set('Nimal Perera');
    expect(cmp.nameValid()).toBe(true);
  });

  it('validates email format', () => {
    cmp.email.set('not-an-email');
    expect(cmp.emailValid()).toBe(false);
    cmp.email.set('nimal@example.com');
    expect(cmp.emailValid()).toBe(true);
  });

  it('accepts Sri Lankan mobile numbers (local and +94)', () => {
    cmp.phone.set('0771234567');
    expect(cmp.phoneValid()).toBe(true);
    cmp.phone.set('+94771234567');
    expect(cmp.phoneValid()).toBe(true);
  });

  it('rejects malformed phone numbers', () => {
    cmp.phone.set('12345');
    expect(cmp.phoneValid()).toBe(false);
    cmp.phone.set('077123456'); // 9 digits after 0 -> too short
    expect(cmp.phoneValid()).toBe(false);
  });

  it('formValid gates on all required fields together', () => {
    cmp.fullName.set('Nimal Perera');
    cmp.email.set('nimal@example.com');
    cmp.phone.set('0771234567');
    // idValid is true by default when no ID is required.
    expect(cmp.formValid()).toBe(true);

    cmp.email.set('bad');
    expect(cmp.formValid()).toBe(false);
  });
});
