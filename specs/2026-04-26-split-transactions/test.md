# Test Plan: Split Transactions

## 1. Automated E2E Tests (Playwright)

### 1.1 Simple 3-Way Split
- **Setup:** Create 3 accounts (Checking, Groceries, Household).
- **Test:** Create a transaction with:
    - Entry 1: Checking (-$100.00)
    - Entry 2: Groceries ($70.00)
    - Entry 3: Household ($30.00)
- **Assertion:** 
    - Transaction is saved successfully.
    - Checking balance decreases by 100.
    - Groceries balance increases by 70.
    - Household balance increases by 30.

### 1.2 Unbalanced Prevention
- **Test:** Try to save a split with:
    - Checking (-$100.00)
    - Groceries ($50.00)
- **Assertion:** "Save" button is disabled or shows variance warning.

### 1.3 Edit Split
- **Test:** Open an existing 3-way split and change an amount.
- **Assertion:** System allows saving only if the new total still equals zero.

## 2. Running Tests
```bash
pnpm test:e2e
```
