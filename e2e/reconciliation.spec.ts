import { test, expect } from '@playwright/test';
import { cleanupDatabase } from './utils';

test.describe('Account Balance & Reconciliation', () => {
  test.beforeEach(async () => {
    await cleanupDatabase();
  });

  test('should calculate balances and complete reconciliation flow', async ({ page }) => {
    // 0. Setup unique accounts for this run
    await page.goto('/accounts');
    const suffix = Math.floor(Math.random() * 10000);
    const sourceAccount = `Source ${suffix}`;
    const targetAccount = `Target ${suffix}`;

    // Create source account
    await page.getByRole('button', { name: 'New Account' }).click();
    await page.getByPlaceholder('e.g. Chase Checking').fill(sourceAccount);
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByRole('heading', { name: sourceAccount, exact: true })).toBeVisible();

    // Create target account
    await page.getByRole('button', { name: 'New Account' }).click();
    await page.getByPlaceholder('e.g. Chase Checking').fill(targetAccount);
    await page.getByRole('button', { name: 'Create' }).click();
    const targetHeading = page.getByRole('heading', { name: targetAccount, exact: true });
    await expect(targetHeading).toBeVisible();

    // 2. Verify account exists and has $0 balance
    const targetCard = page.locator('div', { has: targetHeading }).last();
    await expect(targetCard.locator('p.text-2xl')).toContainText('$0.00');

    // 3. Add transactions
    await targetCard.click();
    await expect(page).toHaveURL(/\/transactions\?accountId=.+/);

    // Add first transaction ($50.00)
    await page.getByRole('button', { name: 'New Transaction' }).click();
    const fromSelect = page.locator('select').first();
    await expect(fromSelect).not.toContainText('Loading accounts...');
    await fromSelect.selectOption({ label: sourceAccount });
    await page.getByPlaceholder('0.00').fill('50');
    await page.getByPlaceholder('e.g. Starbucks Coffee').fill('Income 50');
    await page.getByRole('button', { name: 'Save Transaction' }).click();

    // Add second transaction ($25.00)
    await page.getByRole('button', { name: 'New Transaction' }).click();
    await expect(fromSelect).not.toContainText('Loading accounts...');
    await fromSelect.selectOption({ label: sourceAccount });
    await page.getByPlaceholder('0.00').fill('25');
    await page.getByPlaceholder('e.g. Starbucks Coffee').fill('Income 25');
    await page.getByRole('button', { name: 'Save Transaction' }).click();

    // 4. Verify total balance is $75.00
    await expect(page.locator('p', { hasText: 'Current:' }).locator('span')).toContainText('$75.00');
    await expect(page.locator('p', { hasText: 'Cleared:' }).locator('span')).toContainText('$0.00');

    // 5. Toggle Income 50 transaction to 'cleared'
    const row50 = page.locator('tr', { hasText: 'Income 50' });
    await row50.locator('button').first().click();
    await expect(page.locator('p', { hasText: 'Cleared:' }).locator('span')).toContainText('$50.00');

    // 6. Reconciliation Flow
    await page.getByRole('button', { name: 'Reconcile' }).click();
    const statementBalanceInput = page.getByPlaceholder('0.00').last();
    await statementBalanceInput.fill('100');
    const varianceDisplay = page.locator('span', { hasText: 'Variance' }).locator('xpath=following-sibling::span');
    await expect(varianceDisplay).toContainText(/50\.00/);
    await expect(page.getByRole('button', { name: 'Finalize' })).toBeDisabled();
    await page.getByRole('button', { name: 'Cancel' }).click();

    const row25 = page.locator('tr', { hasText: 'Income 25' });
    await row25.locator('button').first().click();
    await expect(page.locator('p', { hasText: 'Cleared:' }).locator('span')).toContainText('$75.00');

    await page.getByRole('button', { name: 'Reconcile' }).click();
    await statementBalanceInput.fill('75');
    await expect(varianceDisplay).toContainText('$0.00');
    await page.getByRole('button', { name: 'Finalize' }).click();

    // 7. Verify reconciled status
    await expect(row50.locator('.text-green-600')).toBeVisible();
    await expect(row25.locator('.text-green-600')).toBeVisible();

    // 8. Test Deletion (Regression check for ReferenceError)
    page.on('dialog', dialog => dialog.accept());
    await row50.locator('button').last().click(); // Trash icon
    await expect(row50).not.toBeVisible();
    await expect(page.locator('p', { hasText: 'Current:' }).locator('span')).toContainText('$25.00');
  });
});
