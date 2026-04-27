# Plan: Category-wise Spending Breakdown

## Step 1: Frontend Refinement
*   **Modify `src/pages/Reports.tsx`**:
    *   Calculate the grand total of spending from `categorySpending.data`.
    *   Update the `PieChart` to include a central label using `recharts` custom content or a positioned div.
    *   Enhance the `Tooltip` to show: `Amount (Percentage%)`.
    *   Update `Cell` to use `account.color` if it exists.
    *   Add a list view below or beside the chart for a more detailed breakdown if the legend gets too crowded.

## Step 2: UI Polish
*   Ensure the donut hole size is aesthetically pleasing (`innerRadius` vs `outerRadius`).
*   Check that "0" spending categories are handled gracefully (usually excluded).

## Step 3: Verification
*   Manual check: Ensure percentages sum to 100%.
*   E2E test: Verify the "Total Spending" text is visible in the center of the chart.
