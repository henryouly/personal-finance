# Test Plan: Hierarchical Category Management

## 1. Automated E2E Tests (Playwright)

### 1.1 Category Creation & Nesting
- **Test:**
    1. Navigate to /categories.
    2. Create a top-level category "Food".
    3. Create a sub-category "Groceries" and select "Food" as parent.
- **Assertion:**
    - "Groceries" appears indented or clearly under "Food".

### 1.2 Hierarchy in Transactions
- **Test:**
    1. Navigate to /transactions.
    2. Open New Transaction.
    3. Check the category dropdown.
- **Assertion:**
    - The dropdown shows "Food > Groceries".

## 2. Running Tests
```bash
pnpm test:e2e
```
