import { test, expect } from '@playwright/test';

test.describe('Landlord Dashboard', () => {

  //Always start on dashboard
  test.beforeEach(async ({ page }) => {
    await page.context().addCookies([
      {
        name: 'e2e-user',
        value: JSON.stringify({
          id: 'playwright-user',
          email: 'playwright@example.com',
          account_type: 'landlord',
        }),
        url: 'http://127.0.0.1:4174',
      },
    ]);

    await page.goto('/dashboard');
  });

  //Access control
  test('landlord can access dashboard', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  //Navbar tests
  test('navbar shows landlord links', async ({ page }) => {
    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /create listing/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /application portal/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /chats/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /about/i })).toBeVisible();
  });

  test('navbar links to create listing correctly', async ({ page }) => {
    await page.getByRole('link', { name: /create listing/i }).first().click();
    await expect(page).toHaveURL(/create-listing/);
  });

  //Post listing button
  test('create listing button is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Create Listing/i }).last()).toBeVisible();
  });

  //Listings
  test('listings are displayed', async ({ page }) => {
    await expect(page.getByText('Kendrick Place').first()).toBeVisible();
    await expect(page.getByText('123 Kendrick Place').first()).toBeVisible();
  });

  //Stats
  test('stats are displayed', async ({ page }) => {
    await expect(page.getByText(/active listings/i)).toBeVisible();
    await expect(page.getByText(/pending applications/i)).toBeVisible();
    await expect(page.getByText(/unread messages/i)).toBeVisible();
    await expect(page.getByText(/listing views/i)).toBeVisible();
  });

  //Edit/Delete buttons
  test('each listing has edit and delete buttons', async ({ page }) => {
    const editButtons = page.getByRole('button', { name: /edit listing/i });
    const deleteButtons = page.getByRole('button', { name: /delete listing/i });
    await expect(editButtons).toHaveCount(5);
    await expect(deleteButtons).toHaveCount(5);
  });
});
