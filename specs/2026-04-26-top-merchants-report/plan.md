# Plan: Top Merchants/Payees Report

## Step 1: Backend Implementation
*   **Modify `src/server/routers/analytics.ts`**:
    *   Add `topMerchants` procedure.
    *   Input: `z.object({ startDate: z.string(), endDate: z.string(), limit: z.number().default(10) })`.
    *   Query:
        1.  Select `transactions.description` as `name`.
        2.  Sum `journalEntries.amount` as `total`.
        3.  Count `transactions.id` as `count`.
        4.  Filter by date range and account type 'expense'.
        5.  Group by description.
        6.  Order by `total` descending.

## Step 2: Frontend Implementation
*   **Modify `src/pages/Reports.tsx`**:
    *   Integrate the `topMerchants` query.
    *   Add a new section: "Top Merchants".
    *   Display as a vertical list with progress-bar-like backgrounds (similar to budget bars) to represent relative spending. This is often more readable than a vertical chart for long merchant names.

## Step 3: Verification
*   **Integration Test**: Update `src/server/routers/analytics.test.ts` with a case for `topMerchants`.
*   **E2E Test**: Update `e2e/reports.spec.ts` to verify the Top Merchants section.
