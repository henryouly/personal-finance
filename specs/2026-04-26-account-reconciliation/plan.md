# Plan: Account Balance Calculation & Reconciliation

## Phase 1: Backend Implementation (tRPC)
1. **Update `accountsRouter` (`src/server/routers/accounts.ts`)**:
    - Modify `list` and `get` to join with `journal_entries` and `transactions`.
    - Use SQL `SUM` to calculate `totalBalance` and `clearedBalance` per account.
    - Add a `reconcile` mutation:
        - Input: `accountId`, `statementDate`, `statementBalance`.
        - Logic: Verify the calculated cleared balance matches the provided balance, then update transaction statuses from `cleared` to `reconciled`.

2. **Update `transactionsRouter` (`src/server/routers/transactions.ts`)**:
    - Add `updateStatus` mutation:
        - Input: `transactionId`, `status`.
        - Logic: Update the `status` of the specified transaction.

## Phase 2: Frontend Implementation (React)
1. **Accounts Page (`src/pages/Accounts.tsx`)**:
    - Update the UI to display "Total Balance" and "Cleared Balance" for each account.
2. **Transactions Page (`src/pages/Transactions.tsx`)**:
    - Add a status toggle (e.g., a checkbox or a clickable icon) for each transaction row.
    - Add a "Reconcile" button that opens a dialog.
    - Implement the reconciliation dialog:
        - Inputs for Statement Date and Ending Balance.
        - Real-time variance calculation.
        - Call the `reconcile` mutation upon submission.

## Phase 3: Automated Testing
1. **E2E Tests (`e2e/reconciliation.spec.ts`)**:
    - Test navigating to an account.
    - Adding a transaction and verifying balance update.
    - Toggling transaction status and verifying cleared balance update.
    - Completing a reconciliation and verifying status changes to 'reconciled'.
