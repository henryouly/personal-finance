import { test, expect, Page } from '@playwright/test';
import { cleanupDatabase } from './utils';

test.describe('Automated Categorization', () => {
  test.beforeEach(async () => {
    await cleanupDatabase();
  });

  async function setupCategorization(page: Page) {
    // 1. Create Checking Account
    await page.goto('/accounts');
    await page.getByRole('button', { name: 'New Account' }).click();
    await page.getByLabel('Name').fill('Checking');
    await page.getByLabel('Type').selectOption('asset');
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByRole('heading', { name: 'Checking' })).toBeVisible();

    // 2. Create Dining Out Category
    await page.goto('/categories');
    await page.getByRole('button', { name: 'New Category' }).click();
    await page.getByLabel('Category Name').fill('Dining Out');
    await page.getByLabel('Type').selectOption('expense');
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByText('Dining Out', { exact: true })).toBeVisible();

    // 3. Create Software Category
    await page.getByRole('button', { name: 'New Category' }).click();
    await page.getByLabel('Category Name').fill('Software/Services');
    await page.getByLabel('Type').selectOption('expense');
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByText('Software/Services', { exact: true })).toBeVisible();
  }

  test('should auto-fill category based on history', async ({ page }) => {
    await setupCategorization(page);

    // 1. Add a transaction for Starbucks
    await page.goto('/transactions');
    await page.getByRole('button', { name: 'New Transaction' }).click();
    await page.getByPlaceholder('e.g. Starbucks Coffee').fill('Starbucks');
    await page.locator('select').first().selectOption({ label: 'Checking' });
    await page.locator('select').nth(1).selectOption({ label: 'Dining Out' });
    await page.getByPlaceholder('0.00').fill('5.50');
    await page.getByRole('button', { name: 'Save Transaction' }).click();
    await expect(page.getByRole('heading', { name: 'New Transaction' })).not.toBeVisible();

    // 2. Start a new transaction and type Starbucks
    await page.getByRole('button', { name: 'New Transaction' }).click();
    await page.getByPlaceholder('e.g. Starbucks Coffee').fill('Starbucks');
    
    // Blur to trigger prediction
    await page.getByPlaceholder('e.g. Starbucks Coffee').blur();

    // 3. Verify category auto-fills (wait for it)
    const categorySelect = page.locator('select').nth(1);
    await expect(categorySelect).not.toHaveValue(''); 
    const selectedText = await categorySelect.evaluate((sel: HTMLSelectElement) => sel.options[sel.selectedIndex].text);
    expect(selectedText).toContain('Dining Out');
    
    // Verify visual feedback
    await expect(page.getByText('Suggested')).toBeVisible();
  });

  test('should auto-fill category based on keywords (AI fallback)', async ({ page }) => {
    await setupCategorization(page);

    await page.goto('/transactions');
    await page.getByRole('button', { name: 'New Transaction' }).click();
    
    // Type Netflix (known keyword for Software/Services)
    await page.getByPlaceholder('e.g. Starbucks Coffee').fill('Netflix Subscription');
    await page.getByPlaceholder('e.g. Starbucks Coffee').blur();

    // Verify category auto-fills to Software
    const categorySelect = page.locator('select').nth(1);
    await expect(categorySelect).not.toHaveValue('');
    const selectedText = await categorySelect.evaluate((sel: HTMLSelectElement) => sel.options[sel.selectedIndex].text);
    expect(selectedText).toContain('Software/Services');
    await expect(page.getByText('Suggested')).toBeVisible();
  });

  test('should support fuzzy matching for history', async ({ page }) => {
    await setupCategorization(page);

    // 1. Add a transaction for Amazon
    await page.goto('/transactions');
    await page.getByRole('button', { name: 'New Transaction' }).click();
    await page.getByPlaceholder('e.g. Starbucks Coffee').fill('Amazon.com');
    await page.locator('select').first().selectOption({ label: 'Checking' });
    await page.locator('select').nth(1).selectOption({ label: 'Software/Services' });
    await page.getByPlaceholder('0.00').fill('25');
    await page.getByRole('button', { name: 'Save Transaction' }).click();

    // 2. Type a variation
    await page.getByRole('button', { name: 'New Transaction' }).click();
    await page.getByPlaceholder('e.g. Starbucks Coffee').fill('Amazon Pay');
    await page.getByPlaceholder('e.g. Starbucks Coffee').blur();

    // 3. Verify it matches Amazon.com history
    const categorySelect = page.locator('select').nth(1);
    await expect(categorySelect).not.toHaveValue('');
    const selectedText = await categorySelect.evaluate((sel: HTMLSelectElement) => sel.options[sel.selectedIndex].text);
    expect(selectedText).toContain('Software/Services');
  });

  test('should not overwrite manual selection', async ({ page }) => {
    await setupCategorization(page);

    await page.goto('/transactions');
    await page.getByRole('button', { name: 'New Transaction' }).click();
    
    // 1. Manually select Dining Out
    await page.locator('select').nth(1).selectOption({ label: 'Dining Out' });
    
    // 2. Type Netflix (which would normally suggest Software)
    await page.getByPlaceholder('e.g. Starbucks Coffee').fill('Netflix');
    await page.getByPlaceholder('e.g. Starbucks Coffee').blur();

    // 3. Verify it's STILL Dining Out (not overwritten)
    const categorySelect = page.locator('select').nth(1);
    const selectedText = await categorySelect.evaluate((sel: HTMLSelectElement) => sel.options[sel.selectedIndex].text);
    expect(selectedText).toContain('Dining Out');
    await expect(page.getByText('Suggested')).not.toBeVisible();
  });
});
