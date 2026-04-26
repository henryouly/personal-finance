# Plan: Split Transactions (Multiple Entries)

## Phase 1: Frontend Implementation
1. **Update `Transactions.tsx` state**:
    - Replace the fixed `fromAccountId`, `toAccountId`, and `amount` in `formData` with a dynamic `entries` array.
    - Add `isSplitMode` state.
2. **Refactor Transaction Modal**:
    - If `!isSplitMode`, show the current 2-column simplified view.
    - If `isSplitMode`, show a list of rows with account selectors and amount inputs.
    - Add buttons to "Add Entry" and "Remove" (if entries > 2).
    - Implement real-time balance calculation for the visual indicator.
3. **Update Submit Logic**:
    - Map the dynamic `entries` array to the tRPC payload.
    - Ensure cents conversion is handled correctly for all entries.

## Phase 2: Backend Verification
1. **Verify `transactions.ts` router**:
    - Ensure `create` and `update` correctly handle N entries.
    - Confirm `validateTransaction` (sum == 0) is correctly enforced for any number of entries.

## Phase 3: Automated Testing
1. **E2E Tests (`e2e/splits.spec.ts`)**:
    - Test Case: Create a 3-entry split transaction and verify account balances.
    - Test Case: Edit a split transaction, add a 4th entry, and verify.
    - Test Case: Verify that saving an unbalanced split is blocked.
