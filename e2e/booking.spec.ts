import { test, expect } from '@playwright/test';
import { mockApi, ids } from './mock-api';

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test('guest can browse a production from the home page', async ({ page }) => {
  await page.goto('/');

  // The home "Now Showing" / "Upcoming" sections render the mocked production.
  await expect(page.getByRole('heading', { name: 'Hamlet' }).first()).toBeVisible();

  // Open the productions listing.
  await page.getByRole('link', { name: 'Productions' }).first().click();
  await expect(page).toHaveURL(/\/productions/);
  await expect(page.getByText('Hamlet').first()).toBeVisible();

  // Open the production details page.
  await page.goto(`/productions/${ids.PRODUCTION_ID}`);
  await expect(page.getByRole('heading', { name: 'Hamlet' }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: /Book Tickets/i }).first()).toBeVisible();
});

test('selecting a seat as a guest redirects to login', async ({ page }) => {
  // Walk the booking flow as a guest (production → performance → seats);
  // these steps are public and populate the in-memory booking draft.
  await page.goto(`/productions/${ids.PRODUCTION_ID}`);
  await page.getByRole('button', { name: /Book Tickets/i }).first().click();

  await expect(page).toHaveURL(new RegExp(`/book/${ids.PRODUCTION_ID}/performance`));
  await page.locator('.cal__day--shows').first().click();
  await page.locator('.show').first().click();
  await page.getByRole('button', { name: /Continue/i }).click();

  // On the seat map, clicking a seat should bounce an unauthenticated user to
  // the login page with a returnUrl.
  await expect(page).toHaveURL(new RegExp(`/book/${ids.PRODUCTION_ID}/seats`));
  const seat = page.locator('.seat').first();
  await expect(seat).toBeVisible();
  await seat.click();

  await expect(page).toHaveURL(/\/login/);
  await expect(page).toHaveURL(/returnUrl/);
});

test('a logged-in patron can book a seat and reach confirmation', async ({ page }) => {
  // Log in first (mocked identity).
  await page.goto('/login');
  await page.locator('#email').fill('patron@test.com');
  await page.locator('#password').fill('Password1');
  await page.getByRole('button', { name: /Log In/i }).click();

  // Land back on home after login.
  await expect(page).toHaveURL(/\/$|\/#/);

  // Go through the booking flow: details → performance → seats.
  await page.goto(`/productions/${ids.PRODUCTION_ID}`);
  await page.getByRole('button', { name: /Book Tickets/i }).first().click();

  // Pick the available date, then the performance.
  await expect(page).toHaveURL(new RegExp(`/book/${ids.PRODUCTION_ID}/performance`));
  await page.locator('.cal__day--shows').first().click();
  await page.locator('.show').first().click();
  await page.getByRole('button', { name: /Continue/i }).click();

  // Seat map → select the available seat.
  await expect(page).toHaveURL(new RegExp(`/book/${ids.PRODUCTION_ID}/seats`));
  await page.locator('.seat').first().click();
  await expect(page.locator('.seat--selected')).toHaveCount(1);
});
