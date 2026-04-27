# Project Goal: Finance Prototype

## 1. Vision & Purpose
The **Finance Prototype** is a high-fidelity personal finance management application designed to provide users with absolute clarity and control over their financial life. Unlike simple expense trackers, this project implements a rigorous **double-entry bookkeeping system** to ensure mathematical integrity and professional-grade financial reporting, while maintaining a modern, consumer-grade user experience.

The product exists to solve the "where did my money go?" problem by offering:
- **Accuracy:** Zero-sum accounting means every cent is accounted for.
- **Insight:** Visualized trends and category breakdowns that inform better spending habits.
- **Simplicity:** Intuitive manual entry and powerful bulk import capabilities.

## 2. Successful Critical User Journeys (CUJs)

### 2.1 Healthy Account Onboarding
Users can set up their financial ecosystem (checking, savings, credit cards) and initial balances within minutes, creating a baseline for tracking.
- **Success Criteria:** A user can create an account and see it reflected in the global net worth immediately.

### 2.2 Frictionless Transaction Logging
Whether it's a manual coffee purchase or a monthly salary deposit, logging transactions should be fast and require minimal mental overhead.
- **Success Criteria:** Manual entry takes less than 15 seconds.

### 2.3 Comprehensive Financial Audit (Reporting)
Users can look back at any period (month, quarter, year) and see exactly how their net worth changed, where they overspent, and their savings rate.
- **Success Criteria:** Reports load in <500ms and match the sum of individual transactions perfectly.

### 2.4 Multi-Period Proactive Budgeting
Users set spending caps on categories for specific timeframes (Monthly or Yearly). The system intelligently calculates progress by only considering transactions on or after the budget's specified start date.
- **Success Criteria:** Budget progress bars update in real-time, accurately handle timezone-safe local dates, and differentiate between monthly and yearly goals.

### 2.5 Bulk Data Management (CSV Import)
Transitioning from a bank portal to the app should be seamless through a robust CSV import workflow that handles deduplication.
- **Success Criteria:** Importing a month's worth of bank data (50+ rows) takes less than 1 minute of user interaction.

## 3. User Interaction Model
- **Dashboard First:** The primary view features a "Financial Overview" of high-level balances and a **"Budget Progress" overview** that highlights at-risk spending categories.
- **Contextual Actions:** "New Transaction" and "Import" are globally accessible or prominent on the primary view.
- **Visual Feedback:** Color coding (Green for income/under-budget, Red for expenses/over-budget) is used consistently to provide immediate subconscious status updates.
- **Drill-Down Navigation:** Users can click on a budget overview item, chart slice, or account card to see the underlying transaction list filtered to that specific context.
- **Seamless Flow:** Navigation is connected across domains (e.g., clicking a "Target" icon on a Category instantly opens the Budget configuration for that specific account).
