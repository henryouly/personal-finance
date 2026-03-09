# Critical User Journeys (CUJ): Accounts Management

## 1. Overview
Account management allows users to define and organize their various financial sources, such as bank accounts, credit cards, and investment funds.

## 2. User Personas
*   **New User:** Needs to set up their initial accounts to start tracking.
*   **Active User:** Needs to add new accounts (e.g., a new credit card) or adjust existing account details.

## 3. Critical User Journeys

### 3.1 Creating a New Account
**Goal:** A user wants to add a new "Savings" account with an initial balance.
1.  **Entry Point:** Navigate to the Accounts section or click "Add Account" from the Dashboard.
2.  **Action:** Open the "New Account" dialog/form.
3.  **Input:**
    *   Enter Account Name (e.g., "Ally Savings").
    *   Select Account Type (Checking, Savings, Credit, or Investment).
    *   Enter Initial Balance (e.g., "5000.00").
    *   Select a Theme Color (for visual distinction in charts).
4.  **Validation:** Ensure name is provided and balance is a valid number.
5.  **Submission:** Click "Save".
6.  **Outcome:** The account is created in the database, and the user is redirected or the list is updated via React Query.

### 3.2 Viewing Account Summary
**Goal:** A user wants to see the current balance of all their accounts at a glance.
1.  **Entry Point:** Open the Dashboard.
2.  **Display:** The "Account Summary" section displays a grid of cards, each representing an account.
3.  **Details:** Each card shows the account name, type, and current balance (formatted as currency).
4.  **Interaction:** Clicking a card filters the main transaction list to only show transactions for that account.

### 3.3 Editing an Existing Account
**Goal:** A user wants to rename an account or change its color.
1.  **Entry Point:** Go to the Accounts list.
2.  **Action:** Click "Edit" on a specific account row/card.
3.  **Input:** Modify the name, type, or color.
4.  **Submission:** Click "Update".
5.  **Outcome:** The account details are updated, and all associated transactions reflect the change (if applicable).

### 3.4 Deleting an Account
**Goal:** A user wants to remove an old or closed account.
1.  **Entry Point:** Edit view of the account.
2.  **Action:** Click "Delete Account".
3.  **Warning:** A confirmation dialog appears, warning that all associated transactions will also be deleted (cascade delete).
4.  **Confirmation:** User confirms the deletion.
5.  **Outcome:** The account and its transactions are removed from the database.

## 4. Success Metrics
*   Users can successfully create their first account within 30 seconds of landing on the dashboard.
*   Account balances accurately reflect the sum of all linked transactions plus the initial balance.
