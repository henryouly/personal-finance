# Test Plan: Restore Budget Start Date E2E Test

## Automated Tests

### 1. New E2E Test Case
Add the following test to `e2e/budgets.spec.ts`:
- **Name**: `should respect start date for budget`
- **Scenario**:
    1. Create a budget for "Dining Out" today.
    2. Add a transaction for yesterday.
    3. Assert budget shows $0.00 spent.
    4. Add a transaction for today.
    5. Assert budget shows transaction amount spent.

### 2. Execution
```bash
npx playwright test e2e/budgets.spec.ts
```

## Manual Verification
1. Manually follow the steps in the browser to ensure the UI correctly displays the spending after each transaction.
2. Check the "Starts: ..." label on the budget card to ensure it shows today's date.
