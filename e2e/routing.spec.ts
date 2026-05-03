import { test, expect } from '@playwright/test';
import { cleanupDatabase } from './utils';

test.describe('SPA Routing', () => {
  test.beforeEach(async () => {
    await cleanupDatabase();
  });

  test('should load the transactions page and remain there after refresh', async ({ page }) => {
    // Navigate to the transactions page
    await page.goto('/transactions');

    // Check if the specific page header is present
    const header = page.getByRole('heading', { name: 'Transactions', exact: true });
    await expect(header).toBeVisible();

    // Refresh the page
    await page.reload();

    // Verify we are still on the transactions page and not a 404
    await expect(header).toBeVisible();
    await expect(page.url()).toContain('/transactions');
  });

  test('should load the accounts page and remain there after refresh', async ({ page }) => {
    await page.goto('/accounts');
    const header = page.getByRole('heading', { name: 'Accounts', exact: true });
    await expect(header).toBeVisible();
    await page.reload();
    await expect(header).toBeVisible();
    await expect(page.url()).toContain('/accounts');
  });
});
