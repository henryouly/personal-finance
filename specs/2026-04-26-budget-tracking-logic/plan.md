# Plan: Budget Creation and Tracking Logic

## Phase 1: Backend Refinement (tRPC) ✅
1. **Update `budgetsRouter` (`src/server/routers/budgets.ts`)**:
    - Modify the `list` procedure to handle different periods: ✅
        - For `monthly`: Filter by `strftime('%Y-%m', date)`. ✅
        - For `yearly`: Filter by `strftime('%Y', date)`. ✅
    - Add a filter for `transactions.date >= budgets.startDate`. ✅
    - Ensure `Math.abs` or proper sign handling for expense accounts (Debits are positive for expenses). ✅
2. **Add Validation**:
    - In the `create` mutation, check if a budget already exists for the given `accountId` and `period`. ✅

## Phase 2: Frontend Implementation (React) ✅
1. **Update `Budgets.tsx`**:
    - **Edit Mode**: Add an edit button to each budget card to update the `limitAmount`. ✅
    - **Delete Mode**: Add a delete button with a confirmation dialog. ✅
    - **Display Improvements**: Show the `startDate` and the specific period date range (e.g., "This Month", "2026"). ✅
2. **Integration**:
    - Ensure `Categories.tsx` or `Accounts.tsx` can link to setting a budget for a category. ✅

## Phase 3: Automated Testing ✅
1. **E2E Tests (`e2e/budgets.spec.ts`)**:
    - Test creating a monthly budget and adding a transaction. ✅
    - Test creating a yearly budget and adding a transaction. ✅
    - Test that transactions before `startDate` are ignored. ✅
    - Test editing and deleting a budget. ✅

