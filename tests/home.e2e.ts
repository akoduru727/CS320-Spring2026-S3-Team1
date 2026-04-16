import { expect, test } from '@playwright/test';

test('root redirects to login', async ({ page }) => {
  await page.goto('http://localhost:4173/');
  await expect(page).toHaveURL(/\/login/);
});

test('login page shows sign-in heading', async ({ page }) => {
  await page.goto('http://localhost:4173/login');
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
});

test('login page shows Google button', async ({ page }) => {
  await page.goto('http://localhost:4173/login');
  await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
});

test('protected dashboard redirects to login', async ({ page }) => {
  await page.goto('http://localhost:4173/dashboard');
  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/);
});


test('check for "Post Listing" button in landlord dashboard', async ({ page }) => {
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
  await page.goto('http://localhost:4173/dashboard');
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole('button', { name: 'Post Listing' })).toBeVisible();
});


test('renting dashboard page', async ({ page }) => {
  await page.context().addCookies([
    {
      name: 'e2e-user',
      value: JSON.stringify({
        id: 'playwright-user',
        email: 'playwright@example.com',
        account_type: 'tenant',
      }),
      url: 'http://localhost:4173',
    },    
  ]);
  await page.goto('http://localhost:4173/renter-landing');
  await expect(page).toHaveURL(/\/renter-landing/);
  await expect(page.getByRole('link', { name: 'Profile'})).toBeVisible();
  await page.getByRole('link', { name: 'Profile'}).click();
  await expect(page).toHaveURL(/\/profile/);
});

