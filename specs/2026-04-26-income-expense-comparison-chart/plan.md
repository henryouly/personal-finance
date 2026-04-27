# Plan: Income vs. Expense Monthly Comparison Chart

## Step 1: Backend Implementation
*   **Modify `src/server/routers/analytics.ts`**:
    *   Add a new tRPC procedure `monthlyIncomeVsExpense`.
    *   Input: `z.object({ months: z.number().default(6) })`.
    *   Query: 
        1.  Select month using `strftime('%Y-%m', date)`.
        2.  Filter for accounts of type 'income' or 'expense'.
        3.  Group by month and account type.
        4.  Pivot/transform results so each month has an `income`, `expense`, and `net` property.
        5.  Ensure income is returned as a positive number (absolute value of Credit entries).

## Step 2: Frontend Implementation
*   **Modify `src/pages/Reports.tsx`**:
    *   Replace the single-month `ivsEData` logic with the new `monthlyIncomeVsExpense` query.
    *   Update the `BarChart` to use `monthly` data:
        *   XAxis: `month`
        *   Bars: Two `<Bar />` components, one for `income` (green) and one for `expense` (red).
    *   Add a toggle or dropdown to select the number of months (3, 6, 12).
    *   Add a summary section showing the average monthly savings rate.

## Step 3: UI Polish
*   Ensure tooltips show the Net Savings for each month.
*   Check colors and labels for consistency with the rest of the app.

## Step 4: Verification
*   Create a test script or manual verification steps to ensure the math matches the transactions in the database.
*   Update E2E tests to check for the presence of the chart and the multi-month bars.
