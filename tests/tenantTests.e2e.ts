import { expect, test } from '@playwright/test';

test('tenant can load profile page', async ({ page }) => {
  await page.goto('/profile');
  await expect(page.getByRole('heading', { name: /profile/i })).toBeVisible();
});

test('tenant sees roommate preferences section', async ({ page }) => {
  await page.goto('/profile');
  await expect(page.getByRole('heading', { name: /roommate preferences/i })).toBeVisible();
});
