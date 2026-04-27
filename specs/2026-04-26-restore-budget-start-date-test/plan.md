# Plan: Restore Budget Start Date E2E Test

## Implementation Steps

### 1. Update `e2e/budgets.spec.ts`
- Add a new test case: `test('should respect start date for budget', async ({ page }) => { ... })`.
- Use the existing `setupAccounts` helper.
- Implementation details:
    - Go to `/budgets`.
    - Create a budget for "Dining Out" with a limit of $100. (The UI defaults `startDate` to today's local date).
    - Go to `/transactions`.
    - Create a transaction dated yesterday (e.g., use `subDays(new Date(), 1)` and `format` to get the date).
    - Verify budget spending is still $0.00.
    - Create a transaction dated today.
    - Verify budget spending updates to reflect today's transaction.

### 2. Verification
- Run the specific test using Playwright.
- Run all tests to ensure no regressions.

## Verification Plan
```bash
npx playwright test e2e/budgets.spec.ts
```
