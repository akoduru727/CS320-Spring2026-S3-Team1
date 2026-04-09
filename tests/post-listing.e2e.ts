import { test, expect } from '@playwright/test';

test.describe('Post Listing', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/post-listing');
  });

  test('landlord can submit listing and gets redirected', async ({ page }) => {
    const uniqueTitle = `Test Listing ${Date.now()}`;

    await page.fill('input[name="address"]', '123 Test St');
    await page.fill('input[name="city"]', 'Amherst');
    await page.fill('input[name="title"]', uniqueTitle);
    await page.fill('input[name="price"]', '2000');

    await page.click('button:has-text("Submit Listing")');

    //redirect check
    await expect(page).toHaveURL(/dashboard/);
  });
  //test for required fields
  test('shows error if required fields are missing', async ({ page }) => {
    await page.click('button:has-text("Submit Listing")');

    await expect(page.getByText(/please fill in address, city, and title/i)).toBeVisible();
  });
  
  //Input check
  test('shows error for invalid price', async ({ page }) => {
    await page.fill('input[name="address"]', '123 Test St');
    await page.fill('input[name="city"]', 'Amherst');
    await page.fill('input[name="title"]', 'Bad Price Test');
    await page.fill('input[name="price"]', 'abc');

    await page.click('button:has-text("Submit Listing")');

    await expect(page.getByText(/invalid monthly rent/i)).toBeVisible();
});
});