# Test Plan: Finance Prototype

## 1. Overview
This test plan defines the unit testing strategy for the Finance Prototype. The primary goal is to verify the mathematical integrity of the double-entry bookkeeping system, the accuracy of financial calculations, and the robustness of the data management modules.

## 2. Testing Environment
- **Framework:** Vitest (or Jest)
- **Database:** In-memory SQLite for repository/database tests.
- **Validation:** Zod schemas.

## 3. Test Suites

### 3.1 Accounting Core (Double-Entry Logic)
Located in the domain logic or database service layer.
- **T1: Zero-Sum Validation**
    - Verify that a transaction with unbalanced journal entries (sum ≠ 0) throws an error.
    - Verify that a valid balanced transaction (e.g., +5000 Debit, -5000 Credit) is accepted.
- **T2: Integer Cent Precision**
    - Verify that amounts are processed as integers.
    - Test edge cases like adding large amounts to ensure no overflow (within `INTEGER` limits).
- **T3: Account Balance Calculation**
    - Verify that `current_balance_cents` is correctly derived from the sum of all associated `journal_entries`.
    - Test across different account types (Asset increases with positive, Expense increases with positive).

### 3.2 Transaction Management
- **T4: Manual Log Validation**
    - Verify that required fields (date, description, account_id, category_id, amount) are validated via Zod.
- **T5: Deduplication Logic (external_id)**
    - Verify that the hashing algorithm correctly generates identical hashes for identical transactions.
    - Verify that the database unique constraint on `external_id` prevents duplicate imports.
- **T6: CSV Import Parser**
    - Verify mapping of various CSV formats to the internal schema.
    - Test "Automated Type Detection" (negative amount -> expense, positive -> income).

### 3.3 Account Management
- **T7: Delete Integrity**
    - Verify that an account with existing `journal_entries` cannot be deleted (throws error or soft-deletes).
- **T8: Type Constraints**
    - Verify that only accounts of type `expense` can be linked to a `budget`.

### 3.4 Budgeting & Analytics
- **T9: Budget Progress Calculation**
    - Verify `spent` vs `limit` logic for a given month.
    - Test rollover logic if applicable, or strict period boundaries (monthly/yearly).
- **T10: Savings Rate Formula**
    - Verify formula: `(Total Income - Total Expenses) / Total Income`.
    - Test scenario with zero income to prevent division by zero errors.
- **T11: Net Worth Aggregation**
    - Verify that Net Worth correctly sums Assets and subtracts Liabilities.
- **T12: Date Range Filtering**
    - Verify that queries for specific date ranges return only transactions within those bounds (inclusive/exclusive checks).

### 3.5 Categorization
- **T13: Category Merge**
    - Verify that when a category is deleted, transactions can be successfully re-assigned to a new target category.

## 4. Test Case Matrix (Sample)

| ID | Module | Case | Input | Expected Output |
| :--- | :--- | :--- | :--- | :--- |
| ACC-01 | Accounting | Unbalanced Entry | `[{acc1, 100}, {acc2, -50}]` | `TransactionBalanceError` |
| TX-01 | Transaction | Deduplication | Same TX data twice | `UniqueConstraintViolation` |
| BGT-01 | Budget | Over-budget Alert | `spent: 110, limit: 100` | `isOverBudget: true` |
| ANL-01 | Analytics | Savings Rate | `inc: 5000, exp: 4000` | `rate: 20%` |

## 5. Automation & CI
- Unit tests should run on every push/PR.
- Coverage threshold: Minimum 80% for core accounting and transaction logic.
