import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E config for the Sapumal Theatre patron web app.
 * Spins up the Angular dev server, then runs the browser tests against it.
 */
const PORT = 4200;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Start the Angular dev server before the tests (reuse one if already up).
  webServer: {
    command: `npm run start -- --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env['CI'],
    timeout: 180_000,
  },
});
