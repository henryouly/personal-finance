# Plan: Fix Transaction Default Date Timezone Issue

## Implementation Steps

### 1. Update `src/pages/Transactions.tsx`
- Identify all occurrences of `new Date().toISOString().split('T')[0]`.
- Replace them with a more robust local date formatting method.
- Since `date-fns` is already imported as `format`, I can use `format(new Date(), 'yyyy-MM-dd')`.

#### Specific locations in `src/pages/Transactions.tsx`:
- Line 78: Initial `formData` state.
- Line 87: Initial `reconcileData` state.
- Line 115: Inside `createTransaction.onSuccess` when resetting the form.

### 2. Verify other occurrences (Optional but recommended)
- Check `src/pages/Budgets.tsx` and other files found in the research phase to see if they should also be updated for consistency.

### 3. Update E2E Tests
- `e2e/budgets.spec.ts` uses the same pattern. Update it to ensure tests are consistent with the application's behavior.

## Verification Plan
- Manually verify that the "Date" field in the transaction form defaults to today's local date.
- Manually verify that the "Statement Date" in the reconcile dialog defaults to today's local date.
- Run existing E2E tests to ensure no regressions.
