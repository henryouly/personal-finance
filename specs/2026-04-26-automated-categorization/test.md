# Test Plan: Automated Categorization

## 1. Verification Strategy
We will use Playwright E2E tests to verify the end-to-end flow: from typing a merchant name to seeing the category auto-selected.

## 2. Test Cases
### 2.1 History-Based Categorization
- **Setup:** Add a transaction with description "Starbucks" and category "Dining Out".
- **Action:** Open "New Transaction" and type "Starbucks".
- **Expectation:** The "To Account" dropdown should automatically change to "Dining Out".

### 2.2 Partial Match Categorization
- **Setup:** (Same as above).
- **Action:** Type "Starbucks Coffee #1234".
- **Expectation:** The dropdown should still auto-fill to "Dining Out" due to partial/fuzzy matching.

### 2.3 Manual Override
- **Action:** After the category is auto-filled, manually change it to "Groceries".
- **Expectation:** The manual choice should be preserved and not overwritten again unless the description changes significantly.

## 3. Run Commands
```bash
npx playwright test e2e/categorization.spec.ts
```
