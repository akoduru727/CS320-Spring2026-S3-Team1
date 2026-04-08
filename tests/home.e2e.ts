import { expect, test } from '@playwright/test';

// test('bypass lands on profile page', async ({ page }) => {
//   await page.goto('/profile');
//   await expect(page.getByRole('heading', { name: /profile/i })).toBeVisible();
// });
//
// test('profile page shows sign out button', async ({ page }) => {
//   await page.goto('/profile');
//   await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
// });
//
// test('profile page shows roommate preferences section', async ({ page }) => {
//   await page.goto('/profile');
//   await expect(page.getByRole('heading', { name: /roommate preferences/i })).toBeVisible();
// });
//
// test('profile page shows intro copy', async ({ page }) => {
//   await page.goto('/profile');
//   await expect(
//     page.getByText(/manage your profile and roommate preferences/i)
//   ).toBeVisible();
// });
//
//
// test('profile page shows edit profile button', async ({ page }) => {
//   await page.goto('/profile');
//   await expect(page.getByRole('button', { name: /edit profile/i })).toBeVisible();
// });
//
// test('profile page shows organization preference', async ({ page }) => {
//   await page.goto('/profile');
//   await expect(page.getByText(/organization level/i)).toBeVisible();
// });

test('env auth bypass reaches profile', async ({ page }) => {
  await page.goto('/profile');
  await expect(page.getByRole('heading', { name: /profile/i })).toBeVisible();
  await page.pause();
});
