import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SelectPerformanceComponent } from './select-performance.component';
import { Performance } from '../../../core/models/booking.models';
import { installLocalStorageMock } from '../../../../testing/local-storage-mock';

function iso(d: Date): string {
  return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`;
}

function perf(date: string, over: Partial<Performance> = {}): Performance {
  return {
    id: `p-${date}-${over.time ?? 'eve'}`,
    productionId: 'prod-1',
    date,
    time: 'evening',
    clockLabel: '7:00 PM',
    availability: 'available',
    ...over,
  };
}

describe('SelectPerformanceComponent: date/selection guards', () => {
  let cmp: SelectPerformanceComponent;

  const today = iso(new Date());
  const yesterday = iso(new Date(Date.now() - 86_400_000));
  const tomorrow = iso(new Date(Date.now() + 86_400_000));

  beforeEach(() => {
    installLocalStorageMock();
    TestBed.configureTestingModule({
      imports: [SelectPerformanceComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    cmp = TestBed.createComponent(SelectPerformanceComponent).componentInstance;
  });

  it('does not select a past calendar day', () => {
    cmp.selectDate({ day: 1, iso: yesterday, hasShows: false, poya: false, past: true });
    expect(cmp.selectedDate()).toBeNull();
  });

  it('selects a current/future day that has shows', () => {
    cmp.selectDate({ day: 1, iso: tomorrow, hasShows: true, poya: false, past: false });
    expect(cmp.selectedDate()).toBe(tomorrow);
  });

  it('does not select a fully-booked performance', () => {
    cmp.selectPerf(perf(tomorrow, { availability: 'fullyBooked' }));
    expect(cmp.selectedPerf()).toBeNull();
  });

  it('does not select a past performance', () => {
    cmp.selectPerf(perf(yesterday));
    expect(cmp.selectedPerf()).toBeNull();
  });

  it('canContinue is false for a past selection and true for a future one', () => {
    cmp.selectPerf(perf(yesterday));
    expect(cmp.canContinue()).toBe(false);

    cmp.selectPerf(perf(tomorrow));
    expect(cmp.canContinue()).toBe(true);
  });

  it('allows selecting a show dated today', () => {
    cmp.selectPerf(perf(today));
    expect(cmp.selectedPerf()?.date).toBe(today);
    expect(cmp.canContinue()).toBe(true);
  });
});
