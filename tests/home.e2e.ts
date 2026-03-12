import { expect, test } from '@playwright/test';

test('login page shows Google sign-in prompt', async ({ page }) => {
  await page.goto('http://localhost:4173/login');

  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  await expect(page.getByText('Use your Google account to continue.')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Continue with Google' })
  ).toBeVisible();
});
