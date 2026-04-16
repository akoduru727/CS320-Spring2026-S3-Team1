import { expect, test } from '@playwright/test';

const bypassEnabled = process.env.auth === 'true';

test('root redirects to login', async ({ page }) => {
  test.skip(bypassEnabled, 'Requires auth bypass to be off.');
  await page.goto('/');
  await expect(page).toHaveURL(/\/login/);
});

test('login page shows sign-in heading', async ({ page }) => {
  test.skip(bypassEnabled, 'Requires auth bypass to be off.');
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
});

test('login page shows Google button', async ({ page }) => {
  test.skip(bypassEnabled, 'Requires auth bypass to be off.');
  await page.goto('/login');
  await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
});

test('login page shows helper text', async ({ page }) => {
  test.skip(bypassEnabled, 'Requires auth bypass to be off.');
  await page.goto('/login');
  await expect(page.getByText('Use your Google account to continue.')).toBeVisible();
});

test('login page shows signin link', async ({ page }) => {
  test.skip(bypassEnabled, 'Requires auth bypass to be off.');
  await page.goto('/login');
  await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
});

test('protected dashboard redirects to login', async ({ page }) => {
  test.skip(bypassEnabled, 'Requires auth bypass to be off.');
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/);
});

test('protected profile redirects to login', async ({ page }) => {
  test.skip(bypassEnabled, 'Requires auth bypass to be off.');
  await page.goto('/profile');
  await expect(page).toHaveURL(/\/login\?next=%2Fprofile/);
});
