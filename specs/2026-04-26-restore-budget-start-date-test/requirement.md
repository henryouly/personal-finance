# Requirement: Restore Budget Start Date E2E Test

## Objective
Add an E2E test to verify that the budget tracking logic correctly respects the budget's `startDate`. Transactions dated before the `startDate` should not be counted towards the budget's current spending.

## Context
The budget tracking logic in `src/server/routers/budgets.ts` includes a filter `transactions.date >= budgets.startDate`. However, this behavior is not currently verified by any automated tests in `e2e/budgets.spec.ts`.

## Functional Requirements
1. The system must support a `startDate` for each budget (already implemented).
2. The system must only aggregate transaction amounts where the transaction date is on or after the budget's `startDate`.
3. An E2E test must be added to `e2e/budgets.spec.ts` to verify this behavior.

## Acceptance Criteria
- Create a category and a budget with `startDate` set to today.
- Add a transaction for that category dated *yesterday*.
- Verify the budget spending shows $0.00.
- Add a transaction for that category dated *today*.
- Verify the budget spending shows the amount of the *today's* transaction only.
