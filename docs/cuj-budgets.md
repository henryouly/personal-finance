# Critical User Journeys (CUJ): Budget Management

## 1. Overview
Budget management helps users set financial goals and stay within their spending limits for specific categories.

## 2. User Personas
*   **Goal-Oriented User:** Wants to save money by capping spending on non-essentials.
*   **Budgeter:** Monitors their "Groceries" and "Utilities" spending strictly every month.

## 3. Critical User Journeys

### 3.1 Setting a Monthly Budget
**Goal:** Limit "Dining Out" spending to $200 per month.
1.  **Entry Point:** Navigate to the "Budgets" tab on the Dashboard.
2.  **Action:** Click "Create Budget".
3.  **Input:**
    *   **Category:** Select "Dining Out".
    *   **Period:** Select "Monthly".
    *   **Limit Amount:** Enter "200.00".
4.  **Submission:** Click "Set Budget".
5.  **Outcome:** A new budget card appears showing "$0 of $200 spent (0%)".

### 3.2 Monitoring Budget Progress
**Goal:** Check if there is still money left for "Entertainment" this month.
1.  **Entry Point:** View the Dashboard "Budget Overview" section.
2.  **Visuals:**
    *   A progress bar for "Entertainment" shows 75% full.
    *   Text indicates "$150 spent of $200".
    *   Color coding: Green (<80%), Yellow (80-100%), Red (>100%).
3.  **Context:** The app calculates "spent" by summing all "Expense" transactions in the "Entertainment" category for the current month.

### 3.3 Adjusting a Budget
**Goal:** Increase the "Utilities" budget due to seasonal changes.
1.  **Entry Point:** Budgets tab.
2.  **Action:** Click "Edit" on the "Utilities" budget.
3.  **Input:** Change the limit from "$100" to "$150".
4.  **Submission:** Save.
5.  **Outcome:** The progress bar adjusts its percentage based on the new limit.

### 3.4 Reviewing Past Budgets
**Goal:** See how well budgets were followed last month.
1.  **Entry Point:** Reports or Budgets section.
2.  **Action:** Change the global Date Range Picker to "Last Month".
3.  **Display:** The budget overview shows the final "spent" vs "limit" for the selected period.
4.  **Insight:** Shows a summary like "You stayed under budget in 4/5 categories last month".

## 4. Success Metrics
*   User receives a visual warning when a budget category exceeds 100%.
*   Budget calculations are always in sync with the latest transactions.
