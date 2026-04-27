# Requirement: Savings Rate Calculator Widget

## Objective
Provide a dedicated visualization for the "Savings Rate" ( (Income - Expense) / Income ) to help users track how much of their income they are retaining over time.

## Functional Requirements
1.  **Trend Visualization**: A line or bar chart showing the savings rate percentage for each of the last 6-12 months.
2.  **Dashboard Integration**: Add a "Monthly Savings Rate" widget to the main Dashboard for quick reference.
3.  **Color Coding**: 
    *   Positive savings rate (Savings > 0) should be represented in green.
    *   Negative savings rate (Deficit) should be represented in red.
4.  **Reference Line**: Include a 0% reference line to clearly distinguish between saving and overspending.
5.  **Target Line**: (Optional) Allow a visual indicator for a 20% savings target (standard financial advice).

## Technical Constraints
*   **Data**: Reuse the `monthlyIncomeVsExpense` tRPC procedure.
*   **Frontend**: Use `recharts` for the trend chart.
*   **Edge Cases**: Handle `Income = 0` by defaulting the rate to 0.0% to avoid division by zero.

## Clarifications Needed
*   Should this be a separate page or just a widget on Dashboard and Reports? (Focus on Dashboard widget + Reports trend chart).
