# Product Requirements Document (PRD): Finance Prototype

## 1. Project Overview
The **Finance Prototype** is a web-based personal finance management application designed to help users track their income, expenses, and budgets across multiple accounts. It provides a visual dashboard and detailed reports to give users insights into their financial health.

## 2. Target Audience
- Individuals looking to manage their personal finances.
- Users who want to track spending across multiple accounts (checking, savings, credit, etc.).
- People who prefer a simple, clean interface for budgeting and transaction tracking.

## 3. Key Features

### 3.1 Dashboard
- **Financial Overview:** A central hub showing account balances and summaries.
- **Quick Navigation:** Easy access to transactions, budgets, and reports.

### 3.2 Account Management
- **Multiple Accounts:** Support for checking, savings, credit, and investment accounts.
- **Account Customization:** Assign names, colors, and types to accounts.
- **Balance Tracking:** Real-time view of account balances based on transactions.
- **CUJ:** [Detailed Accounts Management](./cuj-accounts.md)

### 3.3 Transaction Tracking & Categorization
- **Income & Expense Logging:** Record manual transactions with descriptions, amounts, dates, and categories.
- **Categorization:** Assign transactions to predefined or custom categories for better organization.
- **Account Linking:** Every transaction is linked to a specific account.
- **Search & Filter:** Filter transactions by date range, category, or account.
- **CUJ:** [Detailed Transactions Management](./cuj-transactions.md), [Detailed Categories Management](./cuj-categories.md)

### 3.4 Bulk Import (CSV Upload)
- **Transaction Upload:** Ability to upload CSV files containing multiple transactions.
- **Data Mapping:** Simple mapping of CSV columns to transaction fields (Date, Description, Amount).
- **Automated Type Detection:** Automatic classification as "income" or "expense" based on the amount.
- **Note:** Covered in [Detailed Transactions Management](./cuj-transactions.md)

### 3.5 Budgeting
- **Category-Based Budgets:** Set spending limits for specific categories (e.g., Groceries, Rent, Entertainment).
- **Budget Periods:** Support for monthly and yearly budget cycles.
- **Progress Tracking:** Visual indicators showing how much of the budget has been spent.
- **CUJ:** [Detailed Budget Management](./cuj-budgets.md)

### 3.6 Analytics & Reporting
- **Spending Trends:** Line/Bar charts showing monthly spending patterns.
- **Category Breakdown:** Pie/Donut charts illustrating spending distribution across categories.
- **Income vs. Expense:** Comparison charts to track net savings or deficits over time.
- **Date Range Filtering:** Ability to filter all reports by specific time periods.
- **CUJ:** [Detailed Analytics & Reporting](./cuj-analytics.md)

## 4. Technical Stack
- **Frontend:** Vite, React 19, Tailwind CSS 4, shadcn/ui.
- **Backend:** Hono, tRPC.
- **Database:** SQLite, Drizzle ORM.

## 5. Success Metrics
- High user engagement with the dashboard.
- Reduction in "Uncategorized" transactions via intuitive UI.
- Positive feedback on the bulk CSV import workflow.
