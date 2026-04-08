import { defineConfig } from '@playwright/test';

export default defineConfig({
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4174',
    port: 4174,
    env: {
      E2E_AUTH_BYPASS: 'true',
      E2E_ACCOUNT_TYPE: 'landlord' //tenant / landlord
    }
  },
  testDir: 'tests',
  testMatch: '**/*.e2e.{ts,js}',
  use: {
    baseURL: 'http://127.0.0.1:4174',
    headless: false
  }
});
