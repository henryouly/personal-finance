# Requirement: Account Balance Calculation & Reconciliation

## 1. Objective
Implement a robust mechanism to calculate account balances and provide a workflow for reconciling accounts against real-world bank statements.

## 2. Functional Requirements
### 2.1 Balance Calculation
- **Total Balance:** Every account must show its current balance, calculated as the sum of all associated `journal_entries.amount`.
- **Cleared Balance:** Accounts should show a "Cleared Balance" which is the sum of entries for transactions with status `cleared` or `reconciled`.
- **Performance:** Balance calculations should be performed on the server side using SQL aggregations.

### 2.2 Reconciliation Workflow
- **Status Toggling:** Users can toggle individual transactions between `pending` and `cleared`.
- **Reconciliation Finalization:** A "Reconcile" interface where users provide a statement date and ending balance.
- **Verification:** The system confirms that `Cleared Balance` matches `Statement Balance`.
- **Status Update:** Upon successful reconciliation, all `cleared` transactions for that account up to the statement date are marked as `reconciled`.

## 3. Technical Constraints
- **tRPC:** Use `sql` helper from `drizzle-orm` for efficient aggregations.
- **E2E Testing:** All core workflows must be covered by Playwright tests.

## 4. Verification Criteria
- [ ] Account balances correctly reflect the sum of journal entries.
- [ ] Toggling a transaction status immediately updates the cleared balance in the UI.
- [ ] A reconciliation flow completes only when the variance is zero.
- [ ] Automated E2E tests confirm the end-to-end flow.
