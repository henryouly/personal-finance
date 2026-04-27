# Test Plan: Fix Transaction Default Date Timezone Issue

## Automated Tests

### 1. Existing E2E Tests
Run existing Playwright tests to ensure that transaction creation and budgets still work correctly.
```bash
npx playwright test
```

### 2. Regression Check
Since the change affects how default dates are generated, we should ensure that the `yyyy-MM-dd` format is exactly what the HTML5 date input expects.

## Manual Verification

### 1. Transaction Form Default Date
1. Open the application in a browser.
2. Navigate to the **Transactions** page.
3. Click **Add Transaction** (if the form is not already visible).
4. Observe the **Date** field. It should match your system's current local date.
5. Change your system timezone to one that is currently on a different day than UTC (if possible) and refresh. Verify the date updates accordingly.

### 2. Reconcile Dialog Default Date
1. On the **Transactions** page, click **Reconcile**.
2. Observe the **Statement Date** field. It should match your system's current local date.

### 3. Form Reset
1. Fill out and save a new transaction.
2. Verify that after the transaction is saved, the form resets and the **Date** field is again set to today's local date.

## Edge Cases
- **Leap Years**: Ensure formatting works on Feb 29th (not applicable today but good for general robustness).
- **Year End/Start**: Ensure formatting works correctly across year boundaries.
