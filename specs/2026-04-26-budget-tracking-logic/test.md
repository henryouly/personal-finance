# Test Plan: Budget Creation and Tracking Logic

## 1. Automated E2E Tests (Playwright)

### 1.1 Monthly Budget Tracking
- **Test**:
    1. Create a "Dining Out" category.
    2. Set a monthly budget of $200.
    3. Add a transaction for $50 in the current month.
- **Assertion**:
    - Budget card shows $50 spent (25%).
    - "Remaining" shows $150.

### 1.2 Yearly Budget Tracking
- **Test**:
    1. Create a "Travel" category.
    2. Set a yearly budget of $2000.
    3. Add a transaction for $500.
- **Assertion**:
    - Budget card shows $500 spent (25%).

### 1.3 Start Date Filtering
- **Test**:
    1. Create a budget with a `startDate` of today.
    2. Add a transaction with a date of *yesterday*.
- **Assertion**:
    - Budget card shows $0 spent.

### 1.4 CRUD Operations
- **Test**: Edit a budget limit and delete a budget.
- **Assertion**: UI updates immediately and persistence is confirmed.

## 2. Running Tests
```bash
pnpm test:e2e
```
