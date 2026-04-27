# Test Plan: Income vs. Expense Monthly Comparison Chart

## Automated Tests

### 1. Integration Test (tRPC)
*   **File**: `src/server/routers/analytics.test.ts`
*   **New Robust Cases**:
    *   **Refund Logic**: Verify that an "Expense" account with a negative amount (refund) reduces the total `expense` for that month rather than increasing it.
    *   **Boundary Dates**: Insert transactions on the 1st and last day of a month to ensure `strftime` captures them correctly in the expected month.
    *   **Future Transactions**: Ensure that transactions dated in the future do not skew the "Last 6 Months" report averages (or are handled explicitly).
    *   **Split Transactions**: Verify that a single transaction split across multiple categories/types is correctly aggregated.

### 2. E2E Test (Playwright)
*   **File**: `e2e/reports.spec.ts`
*   **Steps**:
    *   **Zero Income State**: Verify that the "Savings Rate" displays `0.0%` (or handles division by zero) when income is $0.
    *   **Negative Savings**: Verify that the "Savings Rate" card turns red when expenses exceed income.

## Manual Verification
1.  Add a high-value Income transaction and an Expense transaction in the same month.
2.  Navigate to Reports and verify the bars reflect these additions.
3.  Verify the "Net Savings" value in the tooltip matches the expected difference.
4.  Check responsiveness by resizing the browser window.

## Commands
```bash
# Run unit/integration tests
pnpm test

# Run E2E tests
pnpm exec playwright test e2e/reports.spec.ts
```
