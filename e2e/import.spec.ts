import { test, expect, Page } from '@playwright/test';
import { cleanupDatabase } from './utils';
import path from 'path';
import fs from 'fs';

test.describe('CSV Import Engine', () => {
  test.beforeEach(async () => {
    await cleanupDatabase();
  });

  async function setupAccounts(page: Page): Promise<string> {
    // 1. Create Checking Account
    await page.goto('/accounts');
    await page.getByRole('button', { name: 'New Account' }).click();
    await page.getByLabel('Name').fill('Checking');
    await page.getByLabel('Type').selectOption('asset');
    await page.getByRole('button', { name: 'Create' }).click();

    // Wait for account to appear and click it
    const accountCard = page.locator('a', { hasText: 'Checking' }).first();
    await expect(accountCard).toBeVisible();
    const href = await accountCard.getAttribute('href') || '';
    const accountId = new URL(href, 'http://localhost').searchParams.get('accountId') || '';
    console.log('SetupAccounts: found ID:', accountId);

    // 2. Create Dining Out Category (for auto-cat test)
    await page.goto('/categories');
    await page.getByRole('button', { name: 'New Category' }).click();
    await page.getByLabel('Category Name').fill('Dining Out');
    await page.getByLabel('Type').selectOption('expense');
    await page.getByRole('button', { name: 'Create' }).click();

    await page.getByRole('button', { name: 'New Category' }).click();
    await page.getByLabel('Category Name').fill('Groceries');
    await page.getByLabel('Type').selectOption('expense');
    await page.getByRole('button', { name: 'Create' }).click();

    // Wait for the account list to update
    await expect(page.locator('div:has-text("Groceries")').first()).toBeVisible();

    return accountId;
  }

  test('should complete full import flow', async ({ page }) => {
    const accountId = await setupAccounts(page);
    // Explicit navigation to ensure searchParams are picked up
    await page.goto(`http://localhost:3000/transactions?accountId=${accountId}`);
    await page.waitForURL(`**/transactions?accountId=${accountId}`);

    console.log('Current URL in E2E:', page.url());

    // 1. Open Modal
    const importBtn = page.getByRole('button', { name: 'Import CSV' });
    await expect(importBtn).toBeVisible();
    await importBtn.click();

    // Wait for modal content
    const modal = page.getByTestId('csv-import-modal');
    await expect(modal).toBeVisible();
    await expect(modal.getByText('Import Transactions')).toBeVisible();
    await expect(modal.getByText('Upload bank statement')).toBeVisible();

    // 2. Simulate File Upload
    const csvContent = "Date,Payee,Amount\n2026-01-01,Starbucks,5.50\n2026-01-02,Groceries,50.00";
    const filePath = path.join('/tmp', 'test-import.csv');
    fs.writeFileSync(filePath, csvContent);

    // Playwright file upload for hidden input
    const fileChooserPromise = page.waitForEvent('filechooser');
    await modal.locator('label:has-text("Click or drag CSV file to upload")').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);
    await page.waitForTimeout(500); // Wait for reader and state update

    // 3. Mapping Phase
    await expect(page.getByText('Map Columns')).toBeVisible();
    await page.locator('select').nth(0).selectOption('0'); // Date
    await page.locator('select').nth(1).selectOption('1'); // Description
    await page.locator('select').nth(2).selectOption('2'); // Amount

    await page.getByRole('button', { name: 'Next' }).click();

    // 4. Preview Phase
    await expect(page.getByText('Auto-categorizing')).not.toBeVisible(); // Wait for loading to finish
    await expect(page.getByText('Starbucks')).toBeVisible();

    // Wait for auto-categorization for Starbucks
    const starbucksRow = page.locator('tr').filter({ has: page.locator('span', { hasText: 'Starbucks' }) });
    const starbucksSelect = starbucksRow.locator('select');
    await starbucksSelect.locator('option:has-text("Dining Out")').waitFor({ state: 'attached' });
    await starbucksSelect.selectOption({ label: 'Dining Out' });

    // Select category for Groceries
    const groceriesRow = page.locator('tr').filter({ has: page.locator('span', { hasText: 'Groceries' }) });
    const groceriesSelect = groceriesRow.locator('select');
    await groceriesSelect.locator('option:has-text("Groceries")').waitFor({ state: 'attached' });
    await groceriesSelect.selectOption({ label: 'Groceries' });

    // 5. Commit Import
    await page.getByRole('button', { name: /Import \d+ Transactions/ }).click();

    // 6. Success Phase
    await expect(page.getByText('Import Successful!')).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();

    // 7. Verify in Transaction List
    // The list should have refetched
    await expect(page.getByRole('row').filter({ hasText: 'Starbucks' }).first()).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: 'Groceries' }).first()).toBeVisible();
    await expect(page.getByText('csv_import')).toHaveCount(2);

    // Clean up temp file
    fs.unlinkSync(filePath);
  });

  test('should allow selecting account if none selected', async ({ page }) => {
    await setupAccounts(page);
    await page.goto('/transactions'); // No accountId in URL

    await page.getByRole('button', { name: 'Import CSV' }).click();
    const modal = page.getByTestId('csv-import-modal');

    // Should see source account selector
    const selector = modal.locator('select');
    await expect(selector).toBeVisible();
    await selector.selectOption({ label: 'Checking' });

    // Zone should now be enabled (opacity check or just interaction)
    await expect(modal.locator('label:has-text("Click or drag CSV file to upload")')).toBeVisible();
  });
});
