import {
  CONCESSIONS,
  PRICE_TIERS,
  buildSeatMap,
  concessionByType,
  seatPrice,
  tierById,
} from './pricing';

describe('pricing: tierById', () => {
  it('returns the matching tier', () => {
    expect(tierById('stalls-premium')?.location).toBe('stalls');
    expect(tierById('upper-rear')?.label).toContain('Upper Circle');
  });

  it('returns undefined for an unknown id', () => {
    expect(tierById('does-not-exist')).toBeUndefined();
  });
});

describe('pricing: seatPrice', () => {
  it('applies the matinee multiplier and rounds', () => {
    // stalls-premium matinee = 3.0, base 1000 -> 3000
    expect(seatPrice('stalls-premium', 1000, 'matinee')).toBe(3000);
  });

  it('applies the evening multiplier (higher than matinee)', () => {
    // stalls-premium evening = 3.5, base 1000 -> 3500
    expect(seatPrice('stalls-premium', 1000, 'evening')).toBe(3500);
    expect(seatPrice('stalls-premium', 1000, 'evening')).toBeGreaterThan(
      seatPrice('stalls-premium', 1000, 'matinee'),
    );
  });

  it('rounds fractional results to the nearest rupee', () => {
    // circle-side matinee = 2.25, base 999 -> 2247.75 -> 2248
    expect(seatPrice('circle-side', 999, 'matinee')).toBe(2248);
  });

  it('falls back to the base price for an unknown tier', () => {
    expect(seatPrice('nope', 1234, 'evening')).toBe(1234);
  });
});

describe('pricing: concessionByType', () => {
  it('returns the right concession option', () => {
    expect(concessionByType('child').discount).toBe(0.3);
    expect(concessionByType('loyalty').discount).toBe(0.1);
    expect(concessionByType('none').discount).toBe(0);
  });

  it('child and senior require an ID; group and loyalty do not', () => {
    expect(concessionByType('child').requiresId).toBe(true);
    expect(concessionByType('senior').requiresId).toBe(true);
    expect(concessionByType('group').requiresId).toBe(false);
    expect(concessionByType('loyalty').requiresId).toBe(false);
  });

  it('falls back to "none" for an unknown type', () => {
    // deliberately cast an invalid value to exercise the fallback
    expect(concessionByType('bogus' as never)).toBe(CONCESSIONS[0]);
  });

  it('child/senior give the single best (largest) discount', () => {
    const discounts = CONCESSIONS.map((c) => c.discount);
    expect(Math.max(...discounts)).toBe(0.3);
  });
});

describe('pricing: PRICE_TIERS integrity', () => {
  it('has unique tier ids', () => {
    const ids = PRICE_TIERS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every tier has evening >= matinee multiplier', () => {
    for (const t of PRICE_TIERS) {
      expect(t.evening).toBeGreaterThanOrEqual(t.matinee);
    }
  });
});

describe('pricing: buildSeatMap', () => {
  const seats = buildSeatMap();

  it('builds a stable, non-empty seat map', () => {
    expect(seats.length).toBeGreaterThan(0);
    // deterministic between calls
    expect(buildSeatMap().length).toBe(seats.length);
  });

  it('gives every seat a unique id', () => {
    const ids = seats.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('marks known booked and unavailable seats', () => {
    const byId = new Map(seats.map((s) => [s.id, s]));
    expect(byId.get('S-AA-3')?.status).toBe('booked');
    expect(byId.get('S-AA-1')?.status).toBe('unavailable');
  });

  it('only uses valid statuses and every seat maps to a real tier', () => {
    const tierIds = new Set(PRICE_TIERS.map((t) => t.id));
    for (const s of seats) {
      expect(['available', 'booked', 'unavailable']).toContain(s.status);
      expect(tierIds.has(s.tierId)).toBe(true);
    }
  });
});
