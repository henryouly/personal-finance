# Requirement: Category-wise Spending Breakdown (Donut Chart)

## Objective
Provide a clear visual breakdown of spending by category, allowing users to quickly identify their largest expense areas.

## Functional Requirements
1.  **Donut Visualization**: A donut chart (Pie chart with a hole) showing the distribution of expenses across categories.
2.  **Central Total**: Display the total spending amount in the center of the donut hole.
3.  **Percentage Breakdown**: Include the percentage of total spending for each category in the tooltip and/or legend.
4.  **Interactive Legend**: Labels should be clear, and clicking/hovering should highlight the corresponding slice.
5.  **Dynamic Filtering**: Must respond to the same month/date range selector as the Income vs. Expense chart.
6.  **Color Consistency**: Use account-defined colors where available, otherwise fall back to a standard palette.

## Technical Constraints
*   **Frontend**: Use `recharts` (PieChart, Pie, Cell).
*   **Data**: Leverage the existing `analytics.categorySpending` tRPC procedure.
*   **UI**: Maintain the "Senior Engineer" aesthetic (clean, consistent spacing).

## Clarifications Needed
*   Should we group smaller categories into "Other" if there are too many? (Let's keep it simple for now and show all).
*   Do we want to show Income categories too? (No, the roadmap specifies "spending breakdown").
