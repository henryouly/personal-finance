# Requirement: Refine Transaction Editing and Deletion Workflows

## 1. Objective
Enable users to modify and remove existing transactions while maintaining the integrity of the double-entry bookkeeping system.

## 2. Functional Requirements
### 2.1 Transaction Editing
- **Entry Point:** Users can click on a transaction in the list to open the editing interface.
- **UI:** Reuse the existing "New Transaction" modal for editing.
- **Data Persistence:** Updates must modify both the `transactions` table (date, description) and the `journal_entries` table (amounts, accounts).
- **Validation:** The zero-sum rule ($ \sum amount = 0 $) must be enforced for the updated transaction.
- **Atomic Operation:** The update must be performed as a single database transaction to ensure consistency.

### 2.2 Transaction Deletion
- **Entry Point:** A delete icon/button on each transaction row.
- **Confirmation:** A browser-native or custom confirmation modal must appear before the deletion is executed.
- **Cascading Delete:** Associated journal entries must be removed automatically (handled by DB schema cascade).
- **Refetching:** The transaction list and account balances should update immediately after deletion.

## 3. Technical Constraints
- **tRPC:** Implement an `update` procedure in the `transactions` router.
- **Drizzle ORM:** Use `db.transaction` for the update logic.
- **React Query:** Use `refetch` or optimistic updates to keep the UI in sync.
- **Precision:** Ensure integer cent precision is maintained during updates.

## 4. Verification Criteria
- [ ] A transaction can be updated: changing the date, description, or amounts reflects correctly in the list.
- [ ] An updated transaction still satisfies the zero-sum accounting rule.
- [ ] Deleting a transaction removes it from the list and the database.
- [ ] Deleting a transaction also removes its journal entries (verified via DB check or absence in reports).
- [ ] Attempting to save an unbalanced transaction returns a validation error and prevents the update.
