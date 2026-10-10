import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { PaymentComponent } from './payment.component';
import { installLocalStorageMock } from '../../../../testing/local-storage-mock';

describe('PaymentComponent: card validation', () => {
  let cmp: PaymentComponent;

  beforeEach(() => {
    installLocalStorageMock();
    TestBed.configureTestingModule({
      imports: [PaymentComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    cmp = TestBed.createComponent(PaymentComponent).componentInstance;
  });

  it('rejects a card number shorter than 13 digits', () => {
    cmp.cardNumber.set('4111 1111');
    expect(cmp.cardNumberValid()).toBe(false);
  });

  it('accepts a 16-digit card number with spaces', () => {
    cmp.cardNumber.set('4111 1111 1111 1111');
    expect(cmp.cardNumberValid()).toBe(true);
  });

  it('validates CVV as 3 or 4 digits', () => {
    cmp.cvv.set('12');
    expect(cmp.cvvValid()).toBe(false);
    cmp.cvv.set('123');
    expect(cmp.cvvValid()).toBe(true);
    cmp.cvv.set('1234');
    expect(cmp.cvvValid()).toBe(true);
    cmp.cvv.set('12a');
    expect(cmp.cvvValid()).toBe(false);
  });

  it('validates expiry in MM/YY or MM/YYYY form', () => {
    cmp.expiry.set('12/27');
    expect(cmp.expiryValid()).toBe(true);
    cmp.expiry.set('12/2027');
    expect(cmp.expiryValid()).toBe(true);
    cmp.expiry.set('1227');
    expect(cmp.expiryValid()).toBe(false);
  });

  it('requires a non-empty cardholder name', () => {
    cmp.cardName.set('   ');
    expect(cmp.cardNameValid()).toBe(false);
    cmp.cardName.set('N Perera');
    expect(cmp.cardNameValid()).toBe(true);
  });

  it('formValid is true only when every card field is valid', () => {
    expect(cmp.formValid()).toBe(false);
    cmp.cardNumber.set('4111 1111 1111 1111');
    cmp.expiry.set('12/27');
    cmp.cvv.set('123');
    cmp.cardName.set('N Perera');
    expect(cmp.formValid()).toBe(true);
  });
});
