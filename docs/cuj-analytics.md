# Critical User Journeys (CUJ): Analytics & Reporting

## 1. Overview
Analytics and reporting provide users with a high-level view of their financial health, enabling them to identify spending patterns, track savings, and make informed financial decisions.

## 2. User Personas
*   **The Reviewer:** Wants to see how much they spent on "Dining Out" vs. "Groceries" last month.
*   **The Planner:** Monitors long-term trends to see if their net worth or savings rate is increasing.
*   **The Optimizer:** Looks for spikes in monthly spending to find areas where they can cut back.

## 3. Critical User Journeys

### 3.1 Analyzing Spending by Category
**Goal:** Understand the distribution of expenses across different categories.
1.  **Entry Point:** Navigate to the "Reports" tab on the Dashboard.
2.  **Display:** The "Category Analysis" chart (Donut/Pie chart) shows a breakdown of spending for the selected period.
3.  **Interaction:**
    *   Hover over a slice to see the exact amount spent in that category.
    *   The legend displays the percentage of total spending for each category.
4.  **Context:** The app aggregates all transactions marked as "Expense" and groups them by their assigned category.

### 3.2 Monitoring Income vs. Expenses
**Goal:** Compare total money coming in versus money going out over several months.
1.  **Entry Point:** View the "Income vs. Expenses" chart in the Reports section.
2.  **Display:** A multi-bar chart comparing Income (positive) and Expenses (negative/absolute) side-by-side for each month.
3.  **Insight:**
    *   If Income bars are consistently higher than Expense bars, the user is building savings.
    *   If Expenses exceed Income, the bar chart visually highlights a deficit.
4.  **Data Source:** Transactions are grouped by month and type (`income` vs `expense`).

### 3.3 Visualizing Spending Trends
**Goal:** See how total spending fluctuates over a 6-month or 1-year period.
1.  **Entry Point:** View the "Spending Trends" chart.
2.  **Display:** A line or area chart showing total monthly expense amounts.
3.  **Interaction:** Identify "spikes" in the line chart and correlate them with specific life events or high-cost transactions.
4.  **Outcome:** The user gains awareness of seasonal spending peaks (e.g., holiday season, vacations).

### 3.4 Filtering Reports by Date Range
**Goal:** Drill down into a specific time frame, such as "Last 30 Days" or a custom date range.
1.  **Entry Point:** Locate the Date Range Picker in the top right of the Reports section.
2.  **Action:** Select a predefined range (e.g., "This Month", "Last Quarter") or pick a custom Start and End date.
3.  **Synchronization:**
    *   The `categorySpending` query is re-executed with the new dates.
    *   The `incomeVsExpense` and `monthlySpending` charts refresh immediately.
4.  **Outcome:** All charts and summaries now reflect only the data within the selected window.

### 3.5 Net Worth Tracking
**Goal:** Visualize the growth of total wealth (Assets - Liabilities) over time.
1.  **Entry Point:** Navigate to the "Net Worth" section of the Reports tab.
2.  **Display:** An area chart showing the aggregate balance of all accounts (Checking + Savings + Investments - Credit Card Debt) over the last 12 months.
3.  **Insight:** Helps users see if their overall financial position is improving regardless of monthly fluctuations.

### 3.6 Savings Rate Analysis
**Goal:** Determine what percentage of monthly income is being saved.
1.  **Entry Point:** View the "Savings Rate" widget.
2.  **Calculation:** `(Total Income - Total Expenses) / Total Income * 100`.
3.  **Display:** A gauge or percentage indicator for the current month vs. the previous 3-month average.
4.  **Outcome:** The user can quickly assess if they are meeting their savings goals (e.g., the "20%" rule).

### 3.7 Recurring Expenses (Subscription) Audit
**Goal:** Identify and review all recurring monthly or yearly commitments.
1.  **Entry Point:** Navigate to "Subscription Audit" report.
2.  **Logic:** The system identifies transactions with similar descriptions and amounts that occur at regular intervals.
3.  **Display:** A list of detected subscriptions (e.g., Netflix, Gym, Insurance) with their monthly cost and total annual impact.
4.  **Action:** User can flag a subscription for cancellation or "ignore" if it's a false positive.

### 3.8 Top Merchants/Payees
**Goal:** Identify specific businesses or entities receiving the most money.
1.  **Entry Point:** View the "Top Merchants" list.
2.  **Display:** A ranked list of payees by total amount spent (e.g., 1. Amazon, 2. Landlord, 3. Whole Foods).
3.  **Outcome:** Helps users identify specific spending habits that might be obscured by broad categories (e.g., multiple "Shopping" categories all going to one merchant).

## 4. Success Metrics
*   Charts load in under 500ms even with thousands of transactions.
*   The sum of values in the category breakdown matches the total expenses for the selected period.
*   Users can switch between date ranges and see instant updates without a full page reload.
