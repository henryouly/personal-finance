# Test Plan: Budget Progress Visualization

## 1. Verification Strategy
The feature will be verified through a combination of manual visual inspection and automated E2E tests using Playwright.

## 2. Automated Tests
### 2.1 Dashboard Budget Summary (`e2e/dashboard.spec.ts`)
- **Test Setup:**
    - Create a checking account and an expense category.
    - Create a budget for that category.
    - Add a transaction that consumes 50% of the budget.
- **Test Case:**
    - Navigate to the Dashboard.
    - Verify that the "Budget Overview" section exists.
    - Verify that the specific budget is listed with "50% remaining" (or 50% spent).
    - Verify the progress bar color is green.
- **Test Case (Over Budget):**
    - Add another transaction that puts the budget over 100%.
    - Verify the progress bar color turns red on the Dashboard.

## 3. Manual Verification
- Navigate between Dashboard and Budgets pages to ensure consistency in data and styling.
- Verify that clicking a budget overview item on the Dashboard correctly navigates to the Budgets page.

## 4. Run Commands
```bash
npx playwright test e2e/dashboard.spec.ts
```
