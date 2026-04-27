import { test, expect, Page } from '@playwright/test';
import { cleanupDatabase } from './utils';
import { format } from 'date-fns';

test.describe('Dashboard', () => {
  test.beforeEach(async () => {
    await cleanupDatabase();
  });

  async function setupBudget(page: Page) {
    // 1. Create Account
    await page.goto('/accounts');
    await page.getByRole('button', { name: 'New Account' }).click();
    await page.getByLabel('Name').fill('Checking');
    await page.getByLabel('Type').selectOption('asset');
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByRole('heading', { name: 'Checking' })).toBeVisible();

    // 2. Create Category
    await page.goto('/categories');
    await page.getByRole('button', { name: 'New Category' }).click();
    await page.getByLabel('Category Name').fill('Groceries');
    await page.getByLabel('Type').selectOption('expense');
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByText('Groceries', { exact: true })).toBeVisible();

    // 3. Set Budget
    await page.goto('/budgets');
    await page.getByRole('button', { name: 'Set Budget' }).click();
    
    // Use selectOption directly on the locator, it will wait for the option to be attached
    await page.locator('select#category').selectOption({ label: 'Groceries' });
    
    await page.getByLabel('Limit Amount ($)').fill('100');
    await page.locator('form').getByRole('button', { name: 'Set Budget' }).click();
    await expect(page.getByRole('heading', { name: 'Groceries' })).toBeVisible();
  }

  test('should display budget progress on dashboard', async ({ page }) => {
    await setupBudget(page);

    // 4. Add Transaction (50% of budget)
    await page.goto('/transactions');
    await page.getByRole('button', { name: 'New Transaction' }).click();
    await page.fill('input[type="date"]', format(new Date(), 'yyyy-MM-dd'));
    await page.getByPlaceholder('e.g. Starbucks Coffee').fill('Weekly Shop');
    await page.locator('select').first().selectOption({ label: 'Checking' });
    await page.locator('select').nth(1).selectOption({ label: 'Groceries' });
    await page.getByPlaceholder('0.00').fill('50');
    await page.getByRole('button', { name: 'Save Transaction' }).click();
    await expect(page.getByRole('heading', { name: 'New Transaction' })).not.toBeVisible();

    // 5. Verify on Dashboard
    await page.goto('/');
    const budgetSection = page.locator('section', { hasText: 'Budget Progress' });
    await expect(budgetSection).toBeVisible();
    await expect(budgetSection.getByText('Groceries')).toBeVisible();
    await expect(budgetSection.getByText(/\$50\.00/)).toBeVisible();
    await expect(budgetSection.getByText(/of \$100\.00/)).toBeVisible();
    
    // Check color class (green for 50%)
    const progressBar = budgetSection.locator('.bg-green-500');
    await expect(progressBar).toBeVisible();
  });

  test('should show red progress bar when over budget', async ({ page }) => {
    await setupBudget(page);

    // 4. Add Transaction (120% of budget)
    await page.goto('/transactions');
    await page.getByRole('button', { name: 'New Transaction' }).click();
    await page.fill('input[type="date"]', format(new Date(), 'yyyy-MM-01')); // Use start of month to be safe
    await page.getByPlaceholder('e.g. Starbucks Coffee').fill('Big Shop');
    await page.locator('select').first().selectOption({ label: 'Checking' });
    await page.locator('select').nth(1).selectOption({ label: 'Groceries' });
    await page.getByPlaceholder('0.00').fill('120');
    await page.getByRole('button', { name: 'Save Transaction' }).click();
    await expect(page.getByRole('heading', { name: 'New Transaction' })).not.toBeVisible();

    // 5. Verify on Dashboard
    await page.goto('/');
    const budgetSection = page.locator('section', { hasText: 'Budget Progress' });
    const progressBar = budgetSection.locator('.bg-red-500');
    await expect(progressBar).toBeVisible();
  });
});
