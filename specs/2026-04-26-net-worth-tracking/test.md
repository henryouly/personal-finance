# Test Plan: Net Worth Tracking Trend Over Time

## Automated Tests

### 1. Integration Test (tRPC)
*   **File**: `src/server/routers/analytics.test.ts`
*   **Cases**:
    *   **Cumulative Math**: Verify that net worth correctly sums historical transactions + monthly changes.
    *   **Account Types**: Ensure only `asset` and `liability` accounts are included (exclude `income`/`expense`).
    *   **Signage**: Verify that asset increases (Debit) and liability increases (Credit) are handled correctly.

### 2. E2E Test (Playwright)
*   **File**: `e2e/reports.spec.ts`
*   **Steps**:
    1.  Navigate to `/reports`.
    2.  Check for "Net Worth Trend" heading.
    3.  Verify the AreaChart is rendered.
    4.  Verify the "Current Net Worth" summary card matches the latest data point in the chart.

## Manual Verification
1.  Add a large asset transaction and verify net worth increases.
2.  Add a large liability transaction and verify net worth decreases.
3.  Check the chart across different month ranges (3, 6, 12).
