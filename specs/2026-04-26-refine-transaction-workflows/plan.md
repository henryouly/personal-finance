# Plan: Refine Transaction Editing and Deletion Workflows

## Phase 1: Backend Implementation (tRPC)
1. **Update `transactionsRouter` in `src/server/routers/transactions.ts`**:
    - Add an `update` procedure:
        - Input: Transaction ID + updated fields (date, description, entries).
        - Logic:
            - Validate the new entries using `validateTransaction`.
            - Wrap in `db.transaction`.
            - Update the `transactions` record.
            - Delete existing `journal_entries` for this transaction.
            - Insert new `journal_entries`.
    - Verify `delete` procedure:
        - Ensure it works as expected (cascade delete should handle entries).

## Phase 2: Frontend Implementation (React)
1. **Enhance `Transactions.tsx` Component**:
    - **State Management**:
        - Add `editingTransaction` state to track if we are in edit mode.
        - Update `formData` to initialize from the transaction being edited.
    - **Delete Logic**:
        - Implement `handleDelete` with a `window.confirm`.
        - Hook up the `delete` icon to `handleDelete`.
    - **Edit Logic**:
        - Add a click handler to transaction rows (or an edit button) to set `editingTransaction` and open the modal.
        - Update `handleSubmit` to switch between `create` and `update` mutations based on `editingTransaction`.
    - **UI Adjustments**:
        - Change modal title and button text dynamically (e.g., "Edit Transaction" vs "New Transaction").
        - Ensure modal resets correctly when closed.

## Phase 3: Verification & Polish
1. **Automated Testing**:
    - Add an integration test in `src/server/router.test.ts` to verify the `update` mutation.
    - Add a test case for invalid (unbalanced) updates.
2. **Manual Verification**:
    - Create a transaction.
    - Edit it (change amount, account, date).
    - Verify balances and list view updates.
    - Delete the transaction.
    - Verify it disappears.
