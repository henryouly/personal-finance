# Requirement: Net Worth Tracking Trend Over Time

## Objective
Provide users with a long-term view of their financial progress by tracking the trend of their net worth (Assets - Liabilities) over time.

## Functional Requirements
1.  **Trend Visualization**: A line chart showing the monthly net worth over a period of time (default last 12 months).
2.  **Asset vs Liability Stack**: (Optional/Nice-to-have) Ability to see the breakdown of Assets and Liabilities that make up the net worth. For now, focus on the Net Worth line.
3.  **Historical Accuracy**: The balance for any given month must be the cumulative sum of all transactions up to the end of that month.
4.  **Responsive Chart**: The chart must be readable on all device sizes.
5.  **Hover Tooltip**: Show the exact net worth amount and the month when hovering over data points.

## Technical Constraints
*   **Backend**: Add a new procedure `netWorthHistory` in `analyticsRouter`.
*   **Data Logic**: 
    *   Include accounts of type `asset` and `liability`.
    *   Assets increase with Debits (+), Liabilities increase with Credits (-).
    *   Net Worth = Sum(Asset entries) + Sum(Liability entries). *Note: Liabilities are stored as negative values if they decrease net worth, so simple addition works if the signage is consistent with accounting rules.*
    *   *Signage Check*: Asset Increase = Debit (+), Liability Increase = Credit (-). So Asset - Liability = Debit - Credit? Actually, if we just sum all entries for asset and liability accounts, an asset increase is + and a liability increase is -. So `Total = Assets + Liabilities` (where liabilities are negative) gives the Net Worth.
*   **Frontend**: Use `recharts` (AreaChart or LineChart).

## Clarifications Needed
*   Should we show "Asset" and "Liability" lines separately too? (Let's start with just Net Worth line for simplicity).
