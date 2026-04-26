# Test Plan: Account Balance & Reconciliation

## 1. Automated E2E Tests (Playwright)

### 1.1 Balance Calculation Verification
- **Test:** Create a new account, add two transactions ($50 and $25).
- **Assertion:** The account list shows a total balance of $75.

### 1.2 Cleared Balance Toggling
- **Test:** Mark one $50 transaction as "Cleared".
- **Assertion:** The "Cleared Balance" reflects $50, while "Total Balance" remains $75.

### 1.3 Successful Reconciliation
- **Test:** 
    1. Mark all transactions as "Cleared".
    2. Open "Reconcile" dialog.
    3. Enter statement balance of $75.
    4. Submit.
- **Assertion:** Transactions are now marked as "reconciled" in the UI and variance is zero.

### 1.4 Reconciliation Variance Error
- **Test:** 
    1. Enter a statement balance of $100 (mismatch).
- **Assertion:** The UI shows a variance of -$25 and prevents finalization.

## 2. Running Tests
```bash
pnpm test:e2e
```
