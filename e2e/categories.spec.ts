import { test, expect } from '@playwright/test';
import { cleanupDatabase } from './utils';

test.describe('Hierarchical Categories', () => {
  test.beforeEach(async () => {
    await cleanupDatabase();
  });

  test('should create parent and child categories', async ({ page }) => {
    await page.goto('/categories');

    // 1. Create Parent Category
    await page.getByRole('button', { name: 'New Category' }).click();
    await page.getByPlaceholder('e.g. Groceries').fill('Food');
    await page.getByLabel('Type').selectOption('expense');
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByText('Food', { exact: true })).toBeVisible();

    // 2. Create Child Category
    const foodRow = page.locator('div.group', { has: page.getByText('Food', { exact: true }) }).first();
    await foodRow.hover();
    await foodRow.getByTitle('Add Sub-category').click();
    
    await expect(page.getByText('Parent: Food')).toBeVisible();
    await page.getByPlaceholder('e.g. Groceries').fill('Groceries');
    await page.getByRole('button', { name: 'Create' }).click();

    // 3. Verify Nesting (Chevron appears when children exist)
    const chevron = page.locator('.lucide-chevron-right').first();
    await chevron.click();
    await expect(page.getByText('Groceries', { exact: true })).toBeVisible();

    // 4. Verify in Transactions
    await page.goto('/transactions');
    await page.getByRole('button', { name: 'New Transaction' }).click();
    const categorySelect = page.locator('select').nth(1);
    // Check for existence of the option text instead of visibility
    const options = await categorySelect.innerText();
    expect(options).toContain('Food > Groceries');
  });

  test('should edit and delete categories', async ({ page }) => {
    await page.goto('/categories');

    // Setup: Create a category
    await page.getByRole('button', { name: 'New Category' }).click();
    await page.getByPlaceholder('e.g. Groceries').fill('Utilities');
    await page.getByRole('button', { name: 'Create' }).click();

    const row = page.locator('div.group', { has: page.getByText('Utilities', { exact: true }) }).first();
    
    // Edit
    await row.hover();
    await row.getByTitle('Edit').click();
    await page.getByPlaceholder('e.g. Groceries').fill('Bills');
    await page.getByRole('button', { name: 'Update' }).click();
    await expect(page.getByText('Bills', { exact: true })).toBeVisible();

    // Delete
    page.on('dialog', dialog => dialog.accept());
    const updatedRow = page.locator('div.group', { has: page.getByText('Bills', { exact: true }) }).first();
    await updatedRow.hover();
    await updatedRow.getByTitle('Delete').click();
    await expect(page.getByText('Bills', { exact: true })).not.toBeVisible();
  });
});
