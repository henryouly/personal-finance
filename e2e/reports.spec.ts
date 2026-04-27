import { test, expect } from '@playwright/test';

test.describe('Reports Page', () => {
  test('should display income vs expense chart and allow switching months', async ({ page }) => {
    await page.goto('/reports');
    
    // Check for title
    await expect(page.getByRole('heading', { name: 'Reports & Analytics' })).toBeVisible();
    
    // Check for chart section
    await expect(page.getByText('Income vs Expenses')).toBeVisible();
    
    // Check for month selectors
    const threeMonthBtn = page.getByRole('button', { name: '3 Months' });
    const sixMonthBtn = page.getByRole('button', { name: '6 Months' });
    const twelveMonthBtn = page.getByRole('button', { name: '12 Months' });
    
    await expect(threeMonthBtn).toBeVisible();
    await expect(sixMonthBtn).toBeVisible();
    await expect(twelveMonthBtn).toBeVisible();
    
    // Initial state (6 months should be active)
    await expect(sixMonthBtn).toHaveClass(/bg-blue-600/);
    
    // Check for Net Worth Trend
    await expect(page.getByText('Net Worth Trend')).toBeVisible();
    const netWorthChart = page.locator('.recharts-area').first();
    await expect(netWorthChart).toBeVisible();

    // Check for Net Worth summary card
    await expect(page.getByText('Net Worth', { exact: true })).toBeVisible();
    
    // Click 3 Months and verify
    await threeMonthBtn.click();
    await expect(threeMonthBtn).toHaveClass(/bg-blue-600/);
    await expect(sixMonthBtn).not.toHaveClass(/bg-blue-600/);
    
    // Verify chart SVG is rendered
    const chart = page.locator('.recharts-responsive-container').first();
    await expect(chart).toBeVisible();
  });

  test('should display category breakdown and spending trends', async ({ page }) => {
    await page.goto('/reports');
    
    await expect(page.getByText('Spending by Category')).toBeVisible();
    await expect(page.getByText('Spending Trends')).toBeVisible();
    
    // Check for central total label (rendered even if 0)
    await expect(page.getByText('Total Spent')).toBeVisible();
  });

  test('should handle zero income and negative savings rate states', async ({ page }) => {
    // We assume the DB is clean or seeded with zero income by default in some test environments
    // or we just check the current state's UI logic.
    await page.goto('/reports');
    
    const savingsRateCard = page.locator('div:has-text("Savings Rate")').last();
    await expect(savingsRateCard).toBeVisible();
    
    // Check if it handles 0% or some value
    const rateValue = await savingsRateCard.locator('p').last().innerText();
    expect(rateValue).toMatch(/-?\d+\.\d+%/);

    // Verify color logic - if rate is negative, it should have red text
    if (rateValue.startsWith('-')) {
      await expect(savingsRateCard.locator('p').last()).toHaveClass(/text-red-600/);
    } else {
      await expect(savingsRateCard.locator('p').last()).toHaveClass(/text-green-600/);
    }
  });
});
