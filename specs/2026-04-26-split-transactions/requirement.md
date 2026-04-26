# Requirement: Split Transactions (Multiple Entries)

## 1. Objective
Enable users to create and edit transactions with more than two entries while maintaining the mathematical integrity of the double-entry bookkeeping system.

## 2. Functional Requirements
### 2.1 Split Entry UI
- **Toggle split mode:** Users can switch between a "Simple" view (2 entries) and a "Split" view (N entries).
- **Dynamic rows:** In split mode, users can add and remove entry rows.
- **Minimum entries:** A transaction must have at least 2 entries.
- **Account & Amount:** Each entry row requires an account selection and an amount.

### 2.2 Mathematical Validation
- **Zero-sum enforcement:** The sum of all entries in a transaction must equal zero.
- **Visual balance indicator:** The UI must display the current "Out of Balance" amount in real-time.
- **Prevention of invalid saves:** The "Save" button must be disabled or show an error if the transaction is unbalanced.

## 3. Technical Constraints
- **State Management:** The form must handle a variable number of entries.
- **Backend support:** The tRPC router must validate and persist multi-entry transactions atomically.

## 4. Verification Criteria
- [ ] Users can create a transaction with 3 or more entries.
- [ ] Users can edit a split transaction and add/remove entries.
- [ ] Attempting to save an unbalanced split transaction shows a clear error message.
- [ ] Balances of all accounts involved in a split are updated correctly.
