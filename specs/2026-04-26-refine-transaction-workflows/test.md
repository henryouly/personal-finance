# Testing: Refine Transaction Editing and Deletion Workflows

## 1. Automated Tests
### 1.1 tRPC Router Tests (`src/server/router.test.ts`)
- **Test Case: Update Transaction**
    - Create an account.
    - Create a transaction.
    - Call `update` with modified description and amount.
    - Verify the transaction in the DB has the new values.
    - Verify the journal entries have been updated correctly.
- **Test Case: Update Transaction Validation**
    - Call `update` with unbalanced entries.
    - Expect a validation error.
- **Test Case: Delete Transaction**
    - Create a transaction.
    - Call `delete`.
    - Verify the transaction is gone from the DB.
    - Verify the journal entries are gone (cascade check).

### 1.2 Running Tests
```bash
pnpm test
```

## 2. Manual Verification Steps
### 2.1 Editing Flow
1. Open the application.
2. Navigate to the **Transactions** page.
3. Locate an existing transaction in the list.
4. Click on the transaction row.
5. In the modal, change the **Description** to "Updated Test".
6. Change the **Amount** to a different value.
7. Click **Save Transaction**.
8. **Verification:** The list should reflect "Updated Test" and the new amount.

### 2.2 Deletion Flow
1. Locate a transaction in the list.
2. Click the **Trash** icon.
3. In the confirmation dialog, click **OK**.
4. **Verification:** The transaction should immediately disappear from the list.

### 2.3 Edge Cases
- **Unbalanced Update:** Try to edit a transaction and manually set amounts that don't sum to zero (if the UI allows it, or by manipulating state). The system should prevent saving.
- **Empty Fields:** Try to save with missing description or date. Zod validation should catch this.
