import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.context().addCookies([
    {
      name: 'e2e-user',
      value: JSON.stringify({
        id: 'playwright-user',
        email: 'playwright@example.com',
        account_type: 'tenant',
      }),
      url: 'http://127.0.0.1:4174',
    },
  ]);
});

test('tenant can load profile page', async ({ page }) => {
  await page.goto('/profile');
  await expect(page.getByRole('heading', { name: /profile/i })).toBeVisible();
});

test('tenant sees roommate preferences section', async ({ page }) => {
  await page.goto('/profile');
  await expect(page.getByRole('heading', { name: /roommate preferences/i })).toBeVisible();
});
