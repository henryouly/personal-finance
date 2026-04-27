# Test Plan: Savings Rate Calculator Widget

## Automated Tests

### 1. E2E Test (Playwright)
*   **Files**: `e2e/reports.spec.ts`, `e2e/dashboard.spec.ts`
*   **Cases**:
    *   **Dashboard**: Verify "Savings Rate" card is visible and has the correct color.
    *   **Reports**: Verify "Savings Rate Trend" chart exists.
    *   **Calculation**: (Manual check) Verify `(Income: 1000, Expense: 800) -> 20.0%`.

## Manual Verification
1.  Verify that if Income is $0, the rate displays `0.0%`.
2.  Verify that if Expense > Income, the rate is negative and red.
3.  Check the "Savings Rate Trend" chart for consistency across month ranges.
