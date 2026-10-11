import { Page } from '@playwright/test';

/**
 * Mocks the backend APIs (proxied under /api/*) so the E2E flows are
 * deterministic and don't depend on live backend state or auth.
 */

const PRODUCTION_ID = '11111111-1111-1111-1111-111111111111';
const PERFORMANCE_ID = '22222222-2222-2222-2222-222222222222';
const ZONE_ID = '33333333-3333-3333-3333-333333333333';
const SEAT_ID = '44444444-4444-4444-4444-444444444444';

const production = {
  productionId: PRODUCTION_ID,
  title: 'Hamlet',
  language: 'ENGLISH',
  genre: 'Drama',
  description: 'A young prince seeks revenge for his father’s murder.',
  baseTicketCost: 1000,
  duration: '120',
  ageRestriction: '12+',
  releaseDate: '2025-01-01', // already released → bookable by everyone
  endDate: '2026-12-31',
  posterImageUrl: 'assets/curtain.png',
  status: 1,
};

const performance = {
  performanceId: PERFORMANCE_ID,
  productionId: PRODUCTION_ID,
  date: '2026-10-15',
  time: '19:00:00',
  sessionType: 'EVENING',
  availability: 'AVAILABLE',
  releaseDate: '2025-01-01',
  status: 1,
};

export async function mockApi(page: Page): Promise<void> {
  // ── Catalogue ──────────────────────────────────────────────────────────────
  await page.route('**/api/catalogue/productions/search**', (route) =>
    route.fulfill({ json: { statusCode: '200', content: [production], totalElements: 1 } }),
  );
  await page.route('**/api/catalogue/productions', (route) =>
    route.fulfill({ json: { statusCode: '200', productions: [production] } }),
  );
  await page.route(`**/api/catalogue/productions/${PRODUCTION_ID}`, (route) =>
    route.fulfill({ json: { statusCode: '200', ...production } }),
  );
  await page.route(`**/api/catalogue/productions/${PRODUCTION_ID}/performances`, (route) =>
    route.fulfill({ json: { statusCode: '200', performances: [performance] } }),
  );
  await page.route(`**/api/catalogue/performances/${PERFORMANCE_ID}`, (route) =>
    route.fulfill({ json: { statusCode: '200', ...performance } }),
  );

  // ── Seat ─────────────────────────────────────────────────────────────────────
  await page.route('**/api/seat/seat-zones', (route) =>
    route.fulfill({
      json: {
        statusCode: '200',
        seatZones: [
          { zoneId: ZONE_ID, section: 'STALLS', zoneName: 'Stalls', matineePct: 100, eveningPct: 150 },
        ],
      },
    }),
  );
  await page.route(`**/api/seat/performances/${PERFORMANCE_ID}/seats`, (route) =>
    route.fulfill({
      json: {
        statusCode: '200',
        performanceId: PERFORMANCE_ID,
        seats: [
          {
            seatId: SEAT_ID,
            zoneId: ZONE_ID,
            section: 'STALLS',
            zoneName: 'Stalls',
            rowLabel: 'A',
            seatNumber: 1,
            status: 'AVAILABLE',
          },
        ],
      },
    }),
  );

  // ── Booking ──────────────────────────────────────────────────────────────────
  await page.route('**/api/booking/bookings', (route) =>
    route.fulfill({
      json: {
        statusCode: '200',
        bookingId: '55555555-5555-5555-5555-555555555555',
        bookingRef: 'STB-20261015-00001',
        performanceId: PERFORMANCE_ID,
        productionName: 'Hamlet',
        performanceDate: '2026-10-15',
        performanceTime: '19:00:00',
        seats: [{ seatId: SEAT_ID, seatRef: 'A1', section: 'STALLS', zoneName: 'Stalls' }],
        ticketType: 'REGULAR',
        totalLkr: 2500,
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        qrCode: null,
      },
    }),
  );

  // ── Identity (login) ───────────────────────────────────────────────────────
  await page.route('**/api/identity/auth/login', (route) =>
    route.fulfill({
      json: {
        statusCode: '200',
        accessToken: 'test-jwt-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        userId: '66666666-6666-6666-6666-666666666666',
        name: 'Test Patron',
        email: 'patron@test.com',
        role: 'PATRON',
      },
    }),
  );
  await page.route('**/api/identity/patron/**', (route) =>
    route.fulfill({
      json: {
        statusCode: '200',
        patron: {
          patronId: '66666666-6666-6666-6666-666666666666',
          name: 'Test Patron',
          email: 'patron@test.com',
          contactNo: '0771234567',
          loyaltyHolder: false,
        },
      },
    }),
  );
}

export const ids = { PRODUCTION_ID, PERFORMANCE_ID, SEAT_ID };
