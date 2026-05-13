import { expect, test } from '@playwright/test';

//For tenant, always start on profile
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
   await page.goto('/profile');
});

//Access control
  test('tenant can access profile', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /profile/i })).toBeVisible();
  });

  test('tenant can access search', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /search/i })).toBeVisible();
  });

  test('tenant can access connect', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /connect/i })).toBeVisible();
  });

  test('tenant can access chats', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /chats/i })).toBeVisible();
  });

  test('tenant can access favorites', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /favorites/i })).toBeVisible();
  });

  test('tenant can access application portal', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /application portal/i })).toBeVisible();
  });

  //Navbar tests
  test('navbar shows tenant links', async ({ page }) => {
    await expect(page.getByRole('link', { name: /search/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /profile/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /connect/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /chats/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /favorites/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /application profile/i })).toBeVisible();
  });

  //search  button
  test('search button is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Search/i }).last()).toBeVisible();
  });

  //save name button
  test('search button is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Save Nave/i }).last()).toBeVisible();
  });

  //submit preferences button
  test('submit preferences button is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Submit Preferences/i }).last()).toBeVisible();
  });

  //Listings
  test('listings are displayed', async ({ page }) => {
    await expect(page.getByText('Umass Boston').first()).toBeVisible();
    await expect(page.getByText('Lederle Graduate Research Center').first()).toBeVisible();
    await expect(page.getByText('11 East Pleasant App').first()).toBeVisible();
    await expect(page.getByText('Test').first()).toBeVisible();
    await expect(page.getByText('Cashin').first()).toBeVisible();
    await expect(page.getByText('Umass Dartmouth').first()).toBeVisible();
    await expect(page.getByText('Thatcher Hall').first()).toBeVisible();
    await expect(page.getByText('Portal test').first()).toBeVisible();
    await expect(page.getByText('Manager room').first()).toBeVisible();
    await expect(page.getByText('Fieldstone').first()).toBeVisible();
  });

test('tenant can load profile page', async ({ page }) => {
  await page.goto('/profile');
  await expect(page.getByRole('heading', { name: /profile/i })).toBeVisible();
});

test('tenant sees roommate preferences section', async ({ page }) => {
  await page.goto('/profile');
  await expect(page.getByRole('heading', { name: /roommate preferences/i })).toBeVisible();
});
