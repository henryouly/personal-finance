# Test: Fix SPA Routing 404 on Refresh

## 1. Manual Test Cases

### 1.1 Refresh Transactions Page
1. Start the dev server: `pnpm dev`.
2. Navigate to `http://localhost:3000/transactions`.
3. Press the browser's refresh button.
4. **Expected Result:** The page reloads and displays the Transactions page (not a 404).

### 1.2 Refresh Accounts Page
1. Navigate to `http://localhost:3000/accounts`.
2. Press the browser's refresh button.
3. **Expected Result:** The page reloads and displays the Accounts page (not a 404).

### 1.3 tRPC Functional Check
1. Go to the Accounts page.
2. Create a new test account.
3. **Expected Result:** The account is created successfully (proves Hono still handles `/trpc/*` correctly).

### 1.4 Static Asset Check
1. Verify that icons (Lucide) and styles (Tailwind) are still loading correctly.
2. **Expected Result:** No broken images or styles.
