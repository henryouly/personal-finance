# Plan: Automated Categorization ✅

## Phase 1: Backend Prediction Logic ✅
1. **New tRPC Procedure (`transactions.predictCategory`)**: ✅
    - **Input:** `description` (string). ✅
    - **Logic:**
        - Search for existing transactions where the description is similar (SQL `LIKE %description%`). ✅
        - If matches are found, return the most frequently used `accountId` for those matches. ✅
        - **"AI" Enhancement:** If no exact or partial history match is found, implement a simple keyword mapper (e.g., "Apple", "Google" -> "Entertainment/Software"). ✅
2. **Update `transactionsRouter`**: Add the `predictCategory` query. ✅

## Phase 2: Frontend Integration ✅
1. **Update `Transactions.tsx`**:
    - Add a `onBlur` or `onChange` (debounced) handler to the "Description" field in the transaction modal. ✅
    - When triggered, call `trpc.transactions.predictCategory.useQuery` (as a lazy query/mutation or `useMutation`). ✅
    - If a result is returned, update the `formData.entries[1].accountId` state. ✅
2. **Visual Feedback:** Briefly highlight the auto-filled field (e.g., a subtle blue pulse or a "Suggested" badge) to inform the user. ✅

## Phase 3: Verification ✅
1. **E2E Tests (`e2e/categorization.spec.ts`)**:
    - Create a test that adds a transaction for "Starbucks". ✅
    - Create another transaction, type "Starbucks #123", and verify the category auto-fills. ✅
2. **Manual Testing:** Test with various keywords and partial strings. ✅

