import { devices, type PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  webServer: {
    command: 'yarn start',
    port: 3000,
    timeout: 10 * 1000,
    reuseExistingServer: !process.env.CI,
  },
  expect: {
    timeout: 5000,
  },
  forbidOnly: !!process.env.CI,
  testIgnore: '**/util/__tests__/**',
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'list' : 'html',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  outputDir: 'test-results/',
};

module.exports = config;
