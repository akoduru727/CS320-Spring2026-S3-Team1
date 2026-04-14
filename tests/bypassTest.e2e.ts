import { expect, test } from '@playwright/test';

test('env auth bypass reaches profile', async ({ page }) => {
  await page.goto('/profile');
  await expect(page.getByRole('heading', { name: /profile/i })).toBeVisible();
});
