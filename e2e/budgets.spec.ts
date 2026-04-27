import { test, expect, Page } from '@playwright/test';
import { cleanupDatabase } from './utils';

test.describe('Budgeting', () => {
  test.beforeEach(async () => {
    await cleanupDatabase();
  });

  async function setupAccounts(page: Page) {
    // 1. Create Checking Account
    await page.goto('/accounts');
    await page.getByRole('button', { name: 'New Account' }).click();
    await page.getByPlaceholder('e.g. Chase Checking').fill('Checking');
    await page.getByLabel('Type').selectOption('asset');
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByRole('heading', { name: 'Checking', exact: true })).toBeVisible();

    // 2. Create Category
    await page.goto('/categories');
    await page.getByRole('button', { name: 'New Category' }).click();
    await page.getByPlaceholder('e.g. Groceries').fill('Dining Out');
    await page.getByLabel('Type').selectOption('expense');
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByText('Dining Out', { exact: true })).toBeVisible();
  }

  test('should track monthly budget progress', async ({ page }) => {
    await setupAccounts(page);

    await page.goto('/budgets');
    
    // Create a budget
    await page.getByRole('button', { name: 'Set Budget' }).first().click(); // Open modal
    
    const categorySelect = page.getByLabel('Category');
    // Wait for options to load
    await expect(categorySelect).not.toContainText('Loading categories...');
    await categorySelect.selectOption({ label: 'Dining Out' });
    
    await page.getByLabel('Limit Amount ($)').fill('200');
    await page.locator('form').getByRole('button', { name: 'Set Budget' }).click(); // Submit modal

    // Verify initial state
    await expect(page.getByRole('heading', { name: 'Dining Out', exact: true })).toBeVisible();
    await expect(page.getByText(/\$0\.00 spent/)).toBeVisible();

    // Add a transaction
    await page.goto('/transactions');
    await page.getByRole('button', { name: 'New Transaction' }).click();
    
    const fromSelect = page.locator('select').first();
    const toSelect = page.locator('select').nth(1);
    await expect(fromSelect).not.toContainText('Loading accounts...');
    
    await page.fill('input[type="date"]', new Date().toISOString().split('T')[0]);
    await page.getByPlaceholder('e.g. Starbucks Coffee').fill('Dinner');
    
    await fromSelect.selectOption({ label: 'Checking' });
    await toSelect.selectOption({ label: 'Dining Out' });
    
    await page.getByPlaceholder('0.00').fill('50');
    await page.screenshot({ path: 'test-results/final-check-before-save.png' });
    await page.getByRole('button', { name: 'Save Transaction' }).click();
    
    // Check if modal closed
    await expect(page.getByRole('heading', { name: 'New Transaction' })).not.toBeVisible();

    // Go back to budgets and check progress
    await page.goto('/budgets');
    await expect(page.getByText(/\$50\.00 spent/)).toBeVisible();
    await expect(page.getByText(/75% remaining/)).toBeVisible();
  });

  test('should edit and delete budgets', async ({ page }) => {
    await setupAccounts(page);

    await page.goto('/budgets');
    
    // Create budget
    await page.getByRole('button', { name: 'Set Budget' }).first().click();
    await page.getByLabel('Category').selectOption({ label: 'Dining Out' });
    await page.getByLabel('Limit Amount ($)').fill('100');
    await page.locator('form').getByRole('button', { name: 'Set Budget' }).click();

    const budgetCard = page.locator('div.group', { has: page.getByRole('heading', { name: 'Dining Out', exact: true }) }).first();
    
    // Edit
    await budgetCard.hover();
    await budgetCard.locator('.lucide-pencil').locator('xpath=..').click();
    await page.getByLabel('Limit Amount ($)').fill('150');
    await page.getByRole('button', { name: 'Update' }).click();
    await expect(page.getByText(/of \$150\.00/)).toBeVisible();

    // Delete
    page.on('dialog', dialog => dialog.accept());
    await budgetCard.hover();
    await budgetCard.locator('.lucide-trash2').locator('xpath=..').click();
    await expect(page.getByRole('heading', { name: 'Dining Out', exact: true })).not.toBeVisible();
  });
});
