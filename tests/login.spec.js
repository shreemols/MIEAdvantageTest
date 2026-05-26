// @ts-check
import { test, expect } from '@playwright/test';

const USERNAME = process.env.TEST_USERNAME;
const PASSWORD = process.env.TEST_PASSWORD;

test.describe('Login Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('page loads and shows login form', async ({ page }) => {
    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator('input[name="identifier"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('input[type="submit"]')).toBeVisible();
  });

  test('successful login with valid credentials', async ({ page }) => {
    await page.locator('input[name="identifier"]').fill(USERNAME);
    await page.locator('input[type="password"]').fill(PASSWORD);
    await page.locator('input[type="submit"]').click();

    // Handle "Stay signed in?" prompt (appears as links)
    const dontStayLink = page.getByRole('link', { name: "Don't stay signed in" });
    await dontStayLink.waitFor({ timeout: 10000 });
    await dontStayLink.click();

    // Should land on the member dashboard
    await expect(page).toHaveURL(/\/member\/.*\/dashboard/, { timeout: 15000 });
  });

  test('failed login with wrong password', async ({ page }) => {
    await page.locator('input[name="identifier"]').fill(USERNAME);
    await page.locator('input[type="password"]').fill('WrongPassword123!');
    await page.locator('input[type="submit"]').click();

    // App shows "Unable to sign in" on failed login
    await expect(page.getByText('Unable to sign in')).toBeVisible({ timeout: 7000 });
  });

  test('failed login with empty credentials stays on login page', async ({ page }) => {
    await page.locator('input[type="submit"]').click();

    // Should stay on the login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('failed login with wrong username shows error', async ({ page }) => {
    await page.locator('input[name="identifier"]').fill('nonexistent@example.com');
    await page.locator('input[type="password"]').fill('SomePassword123!');
    await page.locator('input[type="submit"]').click();

    // App shows "Unable to sign in" for unknown users too
    await expect(page.getByText('Unable to sign in')).toBeVisible({ timeout: 7000 });
  });

  test('password field masks input', async ({ page }) => {
    await expect(page.locator('input[type="password"]')).toHaveAttribute('type', 'password');
  });

  test('"Keep me signed in" checkbox is present', async ({ page }) => {
    await expect(page.locator('input[name="rememberMe"]')).toBeVisible();
  });

  test('"Forgot password?" link is visible', async ({ page }) => {
    await expect(page.getByText('Forgot password?')).toBeVisible();
  });

});
