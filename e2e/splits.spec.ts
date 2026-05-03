import { test, expect } from '@playwright/test';
import { cleanupDatabase } from './utils';

test.describe('Split Transactions', () => {
  test.beforeEach(async () => {
    await cleanupDatabase();
  });

  test('should create and edit a 3-way split transaction', async ({ page }) => {
    // 0. Setup unique accounts
    await page.goto('/accounts');
    const suffix = Math.floor(Math.random() * 10000);
    const source = `Checking ${suffix}`;
    const category1 = `Groceries ${suffix}`;
    const category2 = `Rent ${suffix}`;

    for (const name of [source, category1, category2]) {
      await page.getByRole('button', { name: 'New Account' }).click();
      await page.getByPlaceholder('e.g. Chase Checking').fill(name);
      if (name !== source) {
         await page.locator('select').first().selectOption('expense');
      }
      await page.getByRole('button', { name: 'Create' }).click();
      await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
    }

    // 1. Create a 3-way split
    await page.goto('/transactions');
    await page.getByRole('button', { name: 'New Transaction' }).click();
    await page.getByPlaceholder('e.g. Starbucks Coffee').fill('Split Test');
    await page.getByRole('button', { name: 'Split Transaction' }).click();

    // Fill Entry 0 (Source)
    const row0 = page.locator('.space-y-3 > div').nth(0);
    await row0.locator('select').selectOption({ label: `${source} (asset)` });
    await row0.locator('input[type="number"]').fill('100');

    // Fill Entry 1 (Groceries)
    const row1 = page.locator('.space-y-3 > div').nth(1);
    await row1.locator('select').selectOption({ label: `${category1} (expense)` });
    await row1.locator('input[type="number"]').fill('70');

    // Add Entry 2 (Rent)
    await page.getByRole('button', { name: '+ Add Row' }).click();
    const row2 = page.locator('.space-y-3 > div').nth(2);
    await row2.locator('select').selectOption({ label: `${category2} (expense)` });
    await row2.locator('input[type="number"]').fill('30');

    // Verify balanced and save
    await expect(page.locator('span', { hasText: 'Remaining Balance' }).locator('xpath=following-sibling::span')).toContainText('$0.00');
    await page.getByRole('button', { name: 'Save Transaction' }).click();

    // 2. Verify in list
    const txRow = page.locator('tr', { hasText: 'Split Test' });
    await expect(txRow).toBeVisible();
    await expect(txRow).toContainText('$100.00');

    // 3. Edit the split
    await txRow.click();
    await expect(page.getByRole('heading', { name: 'Edit Transaction' })).toBeVisible();

    // Change Rent to 20, add another row for Groceries ($10)
    await row2.locator('input[type="number"]').fill('20');
    await page.getByRole('button', { name: '+ Add Row' }).click();
    const row3 = page.locator('.space-y-3 > div').nth(3);
    await row3.locator('select').selectOption({ label: `${category1} (expense)` });
    await row3.locator('input[type="number"]').fill('10');

    await page.getByRole('button', { name: 'Update Transaction' }).click();
    await expect(page.getByRole('heading', { name: 'Edit Transaction' })).not.toBeVisible();

    // 4. Final verification of balances
    await page.goto('/accounts');
    // Ensure the page has reloaded and data is fresh
    await expect(page.getByText('Loading...')).not.toBeVisible();

    // Verify balances with auto-retry
    await expect(page.locator('div', { hasText: source }).last().locator('p.text-2xl')).toContainText('-$100.00');
    await expect(page.locator('div', { hasText: category1 }).last().locator('p.text-2xl')).toContainText('$80.00');
    await expect(page.locator('div', { hasText: category2 }).last().locator('p.text-2xl')).toContainText('$20.00');
  });
});
