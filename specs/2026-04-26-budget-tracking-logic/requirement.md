# Requirement: Budget Creation and Tracking Logic

## 1. Objective
Refine the current budget implementation to support multi-period tracking (monthly/yearly) and ensure accurate spending calculations based on budget start dates.

## 2. Functional Requirements
### 2.1 Period-Specific Tracking
- **Monthly Budgets:** Calculate spending for the current calendar month.
- **Yearly Budgets:** Calculate spending for the current calendar year.
- **Start Date Awareness:** Spending should only include transactions on or after the budget's `startDate`.

### 2.2 Accurate Calculation Logic
- **Signed Amounts:** Expense accounts have positive amounts in `journal_entries` for spending (Wait, let me double check this in `tech_spec.md`). 
- **Filtering:** Exclude `pending` or `reconciled` status if required? (Usually all transactions count for budget tracking).

### 2.3 Budget Management UI
- **Editing:** Ability to edit existing budget limits.
- **Deletion:** Ability to remove a budget.
- **Validation:** Prevent multiple budgets for the same category/account.

## 3. Technical Constraints
- **tRPC:** Logic must be implemented in the `budgets.ts` router.
- **SQL:** Use efficient `strftime` or equivalent SQL functions for date-based grouping and filtering.

## 4. Verification Criteria
- [ ] Monthly budgets correctly sum transactions for the current month.
- [ ] Yearly budgets correctly sum transactions for the current year.
- [ ] Budgets respect the `startDate` and only count subsequent transactions.
- [ ] Users can edit and delete budgets from the UI.
- [ ] E2E tests verify that adding a transaction updates the budget progress.
