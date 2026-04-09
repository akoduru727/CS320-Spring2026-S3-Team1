import { test as setup } from '@playwright/test';


setup('save logged in session', async ({ page }) => {
  await page.context().addCookies([
    {
      name: 'e2e-user',
      value: JSON.stringify({
        id: 'playwright-user',
        email: 'playwright@example.com',
        account_type: 'landlord',
      }),
      url: 'http://localhost:4173',
    },
  ]);

  await page.goto('/');

  await page.context().storageState({ path: 'playwright/.auth/user.json' });
});
