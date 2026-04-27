# Plan: Net Worth Tracking Trend Over Time

## Step 1: Backend Implementation
*   **Modify `src/server/routers/analytics.ts`**:
    *   Add `netWorthHistory` procedure.
    *   Input: `z.object({ months: z.number().default(12) })`.
    *   Query:
        1.  Fetch the starting balance (sum of all entries before the trend window).
        2.  Fetch monthly changes (sum of entries grouped by month) within the trend window for `asset` and `liability` accounts.
        3.  Calculate cumulative running total in JS.
        4.  Return array of `{ month, netWorth, assets, liabilities }`.

## Step 2: Frontend Implementation
*   **Modify `src/pages/Reports.tsx`**:
    *   Add a new section for "Net Worth Trend".
    *   Use `AreaChart` from `recharts` for a nice visual fill.
    *   Integrate the `netWorthHistory` query.
    *   Add a summary card at the top of the report showing "Current Net Worth".

## Step 3: Verification
*   **Integration Test**: Add a test case in `src/server/routers/analytics.test.ts` to verify the cumulative sum math.
*   **E2E Test**: Update `e2e/reports.spec.ts` to check for the Net Worth chart.
