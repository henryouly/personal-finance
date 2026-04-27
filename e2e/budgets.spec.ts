import { test, expect, Page } from '@playwright/test';
import { cleanupDatabase } from './utils';
import { format, subDays } from 'date-fns';

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
    
    const localDate = format(new Date(), 'yyyy-MM-dd');
    await page.fill('input[type="date"]', localDate);
    await page.getByPlaceholder('e.g. Starbucks Coffee').fill('Dinner');
    
    await fromSelect.selectOption({ label: 'Checking' });
    await toSelect.selectOption({ label: 'Dining Out' });
    
    await page.getByPlaceholder('0.00').fill('50');
    await page.getByRole('button', { name: 'Save Transaction' }).click();
    
    // Check if modal closed
    await expect(page.getByRole('heading', { name: 'New Transaction' })).not.toBeVisible();

    // Go back to budgets and check progress
    await page.goto('/budgets');
    await expect(page.getByText(/\$50\.00 spent/)).toBeVisible();
    await expect(page.getByText(/75% remaining/)).toBeVisible();
  });

  test('should respect start date for budget', async ({ page }) => {
    await setupAccounts(page);

    // 1. Create a budget starting today
    await page.goto('/budgets');
    await page.getByRole('button', { name: 'Set Budget' }).first().click();
    await expect(page.getByLabel('Category')).not.toContainText('Loading categories...');
    await page.getByLabel('Category').selectOption({ label: 'Dining Out' });
    await page.getByLabel('Limit Amount ($)').fill('100');
    
    // Explicitly set start date to today to ensure yesterday's transaction is ignored
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    await page.getByLabel('Start Date').fill(todayStr);
    
    await page.locator('form').getByRole('button', { name: 'Set Budget' }).click();
    await expect(page.getByRole('heading', { name: 'Dining Out', exact: true })).toBeVisible();

    // 2. Add a transaction dated YESTERDAY
    await page.goto('/transactions');
    await page.getByRole('button', { name: 'New Transaction' }).click();
    
    const fromSelect = page.locator('select').first();
    const toSelect = page.locator('select').nth(1);
    await expect(fromSelect).not.toContainText('Loading accounts...');
    
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    await page.fill('input[type="date"]', yesterday);
    await page.getByPlaceholder('e.g. Starbucks Coffee').fill('Yesterday Dinner');
    await fromSelect.selectOption({ label: 'Checking' });
    await toSelect.selectOption({ label: 'Dining Out' });
    await page.getByPlaceholder('0.00').fill('40');
    await page.getByRole('button', { name: 'Save Transaction' }).click();
    await expect(page.getByRole('heading', { name: 'New Transaction' })).not.toBeVisible();

    // 3. Verify budget still shows $0.00 spent
    await page.goto('/budgets');
    await expect(page.getByText(/\$0\.00 spent/)).toBeVisible();

    // 4. Add a transaction dated TODAY
    await page.goto('/transactions');
    await page.getByRole('button', { name: 'New Transaction' }).click();
    await expect(fromSelect).not.toContainText('Loading accounts...');
    
    const today = format(new Date(), 'yyyy-MM-dd');
    await page.fill('input[type="date"]', today);
    await page.getByPlaceholder('e.g. Starbucks Coffee').fill('Today Lunch');
    await fromSelect.selectOption({ label: 'Checking' });
    await toSelect.selectOption({ label: 'Dining Out' });
    await page.getByPlaceholder('0.00').fill('25');
    await page.getByRole('button', { name: 'Save Transaction' }).click();
    await expect(page.getByRole('heading', { name: 'New Transaction' })).not.toBeVisible();

    // 5. Verify budget shows $25.00 spent
    await page.goto('/budgets');
    await expect(page.getByText(/\$25\.00 spent/)).toBeVisible();
    await expect(page.getByText(/75% remaining/)).toBeVisible();
  });

  test('should track yearly budget progress', async ({ page }) => {
    await setupAccounts(page);

    await page.goto('/budgets');
    
    // Create a yearly budget
    await page.getByRole('button', { name: 'Set Budget' }).first().click();
    await expect(page.getByLabel('Category')).not.toContainText('Loading categories...');
    await page.getByLabel('Category').selectOption({ label: 'Dining Out' });
    
    await page.getByRole('button', { name: 'Yearly' }).click();
    await page.getByLabel('Limit Amount ($)').fill('1200');
    
    await page.locator('form').getByRole('button', { name: 'Set Budget' }).click();

    // Verify initial state
    await expect(page.getByText('Yearly limit')).toBeVisible();
    await expect(page.getByText(/\$0\.00 spent/)).toBeVisible();

    // Add a transaction
    await page.goto('/transactions');
    await page.getByRole('button', { name: 'New Transaction' }).click();
    
    const fromSelect = page.locator('select').first();
    const toSelect = page.locator('select').nth(1);
    await expect(fromSelect).not.toContainText('Loading accounts...');
    
    const today = format(new Date(), 'yyyy-MM-dd');
    await page.fill('input[type="date"]', today);
    await page.getByPlaceholder('e.g. Starbucks Coffee').fill('Big Party');
    await fromSelect.selectOption({ label: 'Checking' });
    await toSelect.selectOption({ label: 'Dining Out' });
    await page.getByPlaceholder('0.00').fill('120');
    await page.getByRole('button', { name: 'Save Transaction' }).click();

    // Check if modal closed
    await expect(page.getByRole('heading', { name: 'New Transaction' })).not.toBeVisible();

    // Go back to budgets and check progress
    await page.goto('/budgets');
    await expect(page.getByText(/\$120\.00 spent/)).toBeVisible();
    await expect(page.getByText(/of \$1,200\.00/)).toBeVisible();
    await expect(page.getByText(/90% remaining/)).toBeVisible();
  });

  test('should allow setting a budget from the categories page', async ({ page }) => {
    await setupAccounts(page);

    await page.goto('/categories');
    
    // Find "Dining Out" expense category row
    const categoryRow = page.locator('div.group', { hasText: 'Dining Out' }).first();
    await categoryRow.hover();
    
    // Click "Set Budget" target icon link
    await categoryRow.locator('a[title="Set Budget"]').click();
    
    // Should be on /budgets with accountId in URL
    await expect(page).toHaveURL(/\/budgets\?accountId=/);
    
    // Modal should be open with Dining Out selected
    await expect(page.getByRole('heading', { name: 'Set Category Budget' })).toBeVisible();
    await expect(page.getByLabel('Category')).toHaveValue(/./); // Has some value (the id)
    
    // Finish setting the budget
    await page.getByLabel('Limit Amount ($)').fill('300');
    await page.locator('form').getByRole('button', { name: 'Set Budget' }).click();
    
    // Verify budget card exists
    await expect(page.getByRole('heading', { name: 'Dining Out', exact: true })).toBeVisible();
    await expect(page.getByText(/of \$300\.00/)).toBeVisible();
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
