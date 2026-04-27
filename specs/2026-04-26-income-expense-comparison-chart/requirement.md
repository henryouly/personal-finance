# Requirement: Income vs. Expense Monthly Comparison Chart

## Objective
Provide users with a clear, multi-month visualization of their financial health by comparing total income against total expenses over time. This helps in tracking savings rates and identifying seasonal spending patterns.

## Functional Requirements
1.  **Multi-Month Visualization**: Display a grouped bar chart showing "Income" and "Expense" side-by-side for each month.
2.  **Historical Depth**: Show data for the last 6 months by default, with an option to select different ranges (e.g., 3, 6, 12 months).
3.  **Net Savings Tracking**: Calculate and display the "Net Savings" (Income - Expense) for each month, potentially as a line overlay or a separate summary.
4.  **Responsive Chart**: The chart must scale correctly on mobile and desktop devices.
5.  **Accurate Double-Entry Logic**: 
    *   Income entries (Credits) must be displayed as positive values.
    *   Expense entries (Debits) must be displayed as positive values for comparison.
    *   Net Savings = |Income| - Expense.

## Technical Constraints
*   **Backend**: Extend `analyticsRouter` in tRPC to support monthly grouped data for both income and expenses.
*   **Frontend**: Use `recharts` for the grouped bar chart.
*   **Performance**: Ensure the database query is efficient by using proper grouping and aggregation in SQL.

## Clarifications Needed
*   Should we include a "Net Savings" line on the same chart, or as a separate trend line?
*   Should the date range be a fixed selector (3m, 6m, 1y) or a custom date picker?
