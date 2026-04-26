import { test, expect } from '@playwright/test';
import { cleanupDatabase } from './utils';

test.describe('Category Deletion Logic', () => {
  test.beforeEach(async ({ _page }) => {
    await cleanupDatabase();
  });

  test('should reassign transactions to Uncategorized when category is deleted', async ({ page }) => {
    // 1. Setup Source Account
    await page.goto('/accounts');
    await page.getByRole('button', { name: 'New Account' }).click();
    await page.getByPlaceholder('e.g. Chase Checking').fill('Bank');
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByRole('heading', { name: 'Bank', exact: true })).toBeVisible();

    // 2. Create Category to be deleted
    await page.goto('/categories');
    await page.getByRole('button', { name: 'New Category' }).click();
    await page.getByPlaceholder('e.g. Groceries').fill('Temporary Category');
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByText('Temporary Category', { exact: true })).toBeVisible();

    // 3. Create Transaction in that category
    await page.goto('/transactions');
    await page.getByRole('button', { name: 'New Transaction' }).click();
    
    const fromSelect = page.locator('select').first();
    const toSelect = page.locator('select').nth(1);
    
    // Wait for dropdowns to be ready
    await expect(fromSelect).not.toContainText('Loading accounts...', { timeout: 10000 });
    await expect(toSelect).not.toContainText('Loading categories...', { timeout: 10000 });

    await page.getByPlaceholder('e.g. Starbucks Coffee').fill('Deletion Test Tx');
    await page.getByPlaceholder('0.00').fill('50');
    
    await fromSelect.selectOption({ label: 'Bank' });
    await toSelect.selectOption({ label: 'Temporary Category' });
    await page.getByRole('button', { name: 'Save Transaction' }).click();
    await expect(page.getByText('Temporary Category')).toBeVisible();

    // 4. Delete the category
    await page.goto('/categories');
    const row = page.locator('div.group', { has: page.getByText('Temporary Category', { exact: true }) }).first();
    await row.hover();
    page.on('dialog', dialog => dialog.accept());
    await row.getByTitle('Delete').click();
    await expect(page.getByText('Temporary Category', { exact: true })).not.toBeVisible();

    // 5. Verify transaction is now "Uncategorized"
    await page.goto('/transactions');
    await expect(page.getByText('Uncategorized')).toBeVisible();
    
    // 6. Also verify "Uncategorized" exists in categories now
    await page.goto('/categories');
    await expect(page.getByText('Uncategorized', { exact: true })).toBeVisible();
  });
});
