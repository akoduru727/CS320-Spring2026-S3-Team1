import { test, expect } from '@playwright/test';

test.describe('Post Listing', () => {

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

        await page.goto('/create-listing');
    });

    test('landlord can submit listing and gets redirected', async ({ page }) => {
        const uniqueTitle = `Test Listing ${Date.now()}`;

        await page.fill('input[name="address"]', '123 Test St');
        await page.fill('input[name="city"]', 'Amherst');
        await page.fill('input[name="zip_code"]', '01002');
        await page.fill('input[name="title"]', uniqueTitle);
        await page.fill('input[name="price"]', '2000');

        //redirect check
        await Promise.all([
            page.waitForURL(/dashboard/),
            page.click('button[type="submit"]'),
        ]);
    });
    
    //test for required fields
    test('shows error if required fields are missing', async ({ page }) => {
        //overall check
        await page.click('button:has-text("Submit Listing")');
        await expect(page).toHaveURL(/create-listing/); 
        //address filled
        await page.fill('input[name="address"]', '123 Main Street');
        await page.click('button:has-text("Submit Listing")');
        await expect(page).toHaveURL(/create-listing/); 
        //zip code filled
        await page.fill('input[name="zip_code"]', '01003')
        await page.click('button:has-text("Submit Listing")');
        await expect(page).toHaveURL(/create-listing/); 
        //city filled
        await page.fill('input[name="city"]', 'Amherst');
        await page.click('button:has-text("Submit Listing")');
        await expect(page).toHaveURL(/create-listing/);
        //rent filled
        await page.fill('input[name="price"]', '100');
        await page.click('button:has-text("Submit Listing")');
        await expect(page).toHaveURL(/create-listing/);
        //title filled
        await page.fill('input[name="title"]', 'Requirements Test');
        await page.click('button:has-text("Submit Listing")');
        await expect(page).toHaveURL(/create-listing/);
        //everything filled (should work)
        await page.fill('input[name="contact_email"]', 'landlord@example.com');
        await Promise.all([
            page.waitForURL(/dashboard/),
            await page.click('button:has-text("Submit Listing")'),
        ]);

    });
  
    //Input validation check
    test('shows error for invalid price', async ({ page }) => {
        await page.fill('input[name="address"]', '123 Test St');
        await page.fill('input[name="city"]', 'Amherst');
        await page.fill('input[name="title"]', 'Bad Price Test');
        await page.fill('input[name="price"]', '-10');

        await page.click('button:has-text("Submit Listing")');

        await expect(page.getByText(/invalid monthly rent/i)).toBeVisible();
    });

    test('navbar links to dashboard correctly', async ({ page }) => {
    await page.getByRole('link', { name: /dashboard/i }).first().click();
    await expect(page).toHaveURL(/dashboard/);
  });
});