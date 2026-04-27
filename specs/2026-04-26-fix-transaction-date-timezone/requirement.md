# Requirement: Fix Transaction Default Date Timezone Issue

## Objective
Ensure that the default date for new transactions and reconciliation statement dates correctly reflects the user's local date, rather than the UTC date.

## Context
Currently, the application uses `new Date().toISOString().split('T')[0]` to set the default date for new transactions. `toISOString()` always returns the time in UTC, which can result in the date being "tomorrow" or "yesterday" depending on the user's local timezone and the time of day.

## Functional Requirements
1. When a user opens the "Add Transaction" form, the "Date" field must default to the user's current local date in `YYYY-MM-DD` format.
2. When a user clicks "Duplicate" on a transaction, the default date for the new (duplicated) transaction should be the current local date (as it currently resets to "today").
3. When a user opens the "Reconcile" dialog, the "Statement Date" field must default to the user's current local date in `YYYY-MM-DD` format.
4. The date format must remain compatible with `<input type="date" />`, which is `YYYY-MM-DD`.

## Technical Constraints
- Use the `date-fns` library (already present in the project) to handle date formatting if it simplifies the implementation.
- The solution should be consistent across the `Transactions.tsx` page.
- Avoid introducing new dependencies.

## Acceptance Criteria
- In a timezone like New York (UTC-4), if it is 10 PM on April 26, `new Date().toISOString().split('T')[0]` would return `2026-04-27`. The fixed implementation must return `2026-04-26`.
- The fix must apply to:
    - Initial state of `formData` for new transactions.
    - Resetting `formData` after a successful create.
    - Initial state of `reconcileData`.
