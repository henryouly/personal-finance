# Plan: Savings Rate Calculator Widget

## Step 1: Frontend - Dashboard Widget
*   **Modify `src/pages/Dashboard.tsx`**:
    *   Add a fourth summary card for "Savings Rate".
    *   Calculate it using the `ivsE` query data.
    *   Style it to match existing cards, with color-coded text (green for positive, red for negative).

## Step 2: Frontend - Reports Trend Chart
*   **Modify `src/pages/Reports.tsx`**:
    *   Add a new section: "Savings Rate Trend".
    *   Use a `BarChart` or `LineChart` where the data is `(income - expense) / income * 100`.
    *   Add a `ReferenceLine` at `y=0`.
    *   Ensure the chart is responsive and fits the current layout.

## Step 3: Verification
*   **Manual**: Check Dashboard and Reports for the new widget and chart.
*   **E2E Test**: Update `e2e/reports.spec.ts` to verify the savings rate trend chart. Add `e2e/dashboard.spec.ts` (or update existing) to check for the dashboard widget.
