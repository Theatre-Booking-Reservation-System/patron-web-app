import {
  PRODUCTIONS,
  isPoya,
  performancesFor,
  productionById,
} from './catalogue.data';

describe('catalogue.data: productionById', () => {
  it('finds an existing production', () => {
    expect(productionById('sanda-katha')?.name).toBe('Sanda Katha');
  });

  it('returns undefined for an unknown id', () => {
    expect(productionById('missing')).toBeUndefined();
  });

  it('has unique production ids', () => {
    const ids = PRODUCTIONS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('catalogue.data: isPoya', () => {
  it('recognises a known Poya date', () => {
    expect(isPoya('2025-05-12')).toBe(true);
  });

  it('returns false for a non-Poya date', () => {
    expect(isPoya('2025-05-13')).toBe(false);
  });
});

describe('catalogue.data: performancesFor', () => {
  it('creates matinee + evening shows for representative days', () => {
    // May 2025 (month0 = 4). Day 12 is Poya and should be skipped.
    const perfs = performancesFor('sanda-katha', 2025, 4);
    expect(perfs.length).toBeGreaterThan(0);

    const times = new Set(perfs.map((p) => p.time));
    expect(times.has('matinee')).toBe(true);
    expect(times.has('evening')).toBe(true);
  });

  it('never schedules a performance on a Poya day', () => {
    const perfs = performancesFor('sanda-katha', 2025, 4);
    expect(perfs.some((p) => isPoya(p.date))).toBe(false);
  });

  it('tags each performance with the production id and a valid ISO date', () => {
    const perfs = performancesFor('dharma-patha', 2025, 5);
    for (const p of perfs) {
      expect(p.productionId).toBe('dharma-patha');
      expect(p.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('does not generate days beyond the month length (e.g. Feb has no 31st)', () => {
    // February 2025 (month0 = 1) has 28 days; day 31 must not appear.
    const perfs = performancesFor('sanda-katha', 2025, 1);
    expect(perfs.every((p) => Number(p.date.slice(-2)) <= 28)).toBe(true);
  });
});
