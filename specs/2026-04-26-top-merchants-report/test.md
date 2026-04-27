# Test Plan: Top Merchants/Payees Report

## Automated Tests

### 1. Integration Test (tRPC)
*   **File**: `src/server/routers/analytics.test.ts`
*   **Cases**:
    *   **Aggregation**: Verify that spending from multiple transactions with the same description is summed correctly.
    *   **Filtering**: Ensure only `expense` accounts are counted.
    *   **Count**: Verify the transaction count is accurate.
    *   **Limit**: Ensure the `limit` parameter is respected.

### 2. E2E Test (Playwright)
*   **File**: `e2e/reports.spec.ts`
*   **Steps**:
    1.  Navigate to `/reports`.
    2.  Check for "Top Merchants" heading.
    3.  Verify the list is rendered and shows at least one merchant if data is present.
    4.  Verify the total amount is formatted correctly.

## Manual Verification
1.  Check that the merchant names match exactly what was entered in the transaction description.
2.  Verify the bars (if implemented) represent relative spending correctly.
