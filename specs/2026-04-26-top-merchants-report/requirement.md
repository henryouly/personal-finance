# Requirement: Top Merchants/Payees Report

## Objective
Provide users with insights into their spending habits by identifying the merchants or payees where they spend the most money.

## Functional Requirements
1.  **Top Spending List**: A list or horizontal bar chart showing the top 10 merchants by total spending amount.
2.  **Merchant Identification**: For now, treat the unique strings in `transactions.description` as the merchant name.
3.  **Expense Filtering**: Only include transactions that involve an "expense" account.
4.  **Time-Based Filtering**: The report must respect the same month/date range selector as other charts in the Reports page.
5.  **Transaction Count**: Display the number of transactions per merchant alongside the total amount spent.
6.  **Interactive Detail**: (Optional) Allow clicking a merchant to see a filtered list of transactions.

## Technical Constraints
*   **Backend**: Add a new procedure `topMerchants` in `analyticsRouter`.
*   **Data Logic**:
    *   Join `transactions`, `journalEntries`, and `accounts`.
    *   Filter by `accounts.type = 'expense'`.
    *   Group by `transactions.description`.
    *   Sum `journalEntries.amount` (taking the absolute value).
    *   Order by total amount descending.
*   **Frontend**: Use a horizontal bar chart from `recharts` (BarChart with `layout="vertical"`) or a clean styled list.

## Clarifications Needed
*   Since descriptions can vary (e.g., "Starbucks #123" vs "Starbucks #456"), should we attempt fuzzy matching? (Let's stick to exact string matching for now, as fuzzy matching is complex without a dedicated merchant table).
