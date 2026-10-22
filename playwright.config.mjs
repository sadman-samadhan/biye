import { defineConfig, devices } from '@playwright/test'

/**
 * End-to-end tests run against an already-running app + local Supabase:
 *   npm run db:start && npm run dev -- -p 3210
 *   E2E_BASE_URL=http://localhost:3210 npm run test:e2e
 */
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 240_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3210',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
