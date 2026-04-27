# Plan: Budget Progress Visualization ✅

## Phase 1: Shared Components ✅
1. **Create `src/components/BudgetProgress.tsx`**: ✅
    - Extract the progress bar and percentage logic from `Budgets.tsx`. ✅
    - Support props for `currentSpent`, `limitAmount`, `accountName`, and `period`. ✅
    - Ensure consistent styling and color coding (Green/Yellow/Red). ✅

## Phase 2: Dashboard Implementation ✅
1. **Update `src/pages/Dashboard.tsx`**: ✅
    - Import `trpc` and fetch `budgets.list`. ✅
    - Add a "Budget Overview" section below or alongside existing sections. ✅
    - Map through the top budgets (e.g., sorted by percentage descending) and render the `BudgetProgress` component. ✅
    - Wrap items in `Link` from `react-router-dom` to navigate to `/budgets`. ✅

## Phase 3: Refactor Budgets Page ✅
1. **Update `src/pages/Budgets.tsx`**: ✅
    - Replace inline progress bar logic with the new `BudgetProgress` component to ensure consistency. ✅

## Phase 4: Automated Testing ✅
1. **Update E2E Tests**: ✅
    - Create or update a test in `e2e/dashboard.spec.ts` (or a new one) to verify the "Budget Overview" section. ✅
    - Check that it correctly calculates and displays progress. ✅

