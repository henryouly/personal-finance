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
    
    // Check for chart sections
    await expect(page.getByText('Net Worth Trend')).toBeVisible();
    await expect(page.getByText('Income vs Expenses')).toBeVisible();
    await expect(page.getByText('Savings Rate Trend')).toBeVisible();

    // Check for Net Worth summary card
    await expect(page.getByTestId('summary-net-worth')).toBeVisible();
    
    // Click 3 Months and verify
    await threeMonthBtn.click();
    await expect(threeMonthBtn).toHaveClass(/bg-blue-600/);
    await expect(sixMonthBtn).not.toHaveClass(/bg-blue-600/);
    
    // Verify chart containers exist
    const charts = page.locator('.recharts-responsive-container');
    await expect(charts).toHaveCount(5); // Net Worth, IvE, Savings Rate, Category, Trends
  });

  test('should display category breakdown and spending trends', async ({ page }) => {
    await page.goto('/reports');
    
    await expect(page.getByText('Spending by Category')).toBeVisible();
    await expect(page.getByText('Spending Trends')).toBeVisible();
    await expect(page.getByText('Top Merchants')).toBeVisible();
    
    // Check for central total label (rendered even if 0)
    await expect(page.getByText('Total Spent')).toBeVisible();
  });

  test('should handle zero income and negative savings rate states', async ({ page }) => {
    await page.goto('/reports');
    
    const savingsRateCard = page.getByTestId('summary-savings-rate');
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
