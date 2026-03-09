# Critical User Journeys (CUJ): Transactions Management

## 1. Overview
Transaction management is the core of the application, involving the recording, importing, and reviewing of every financial movement.

## 2. User Personas
*   **Manual Tracker:** Enters every coffee and purchase as they happen.
*   **Batch Tracker:** Monthly uploader who exports CSVs from their bank and imports them all at once.

## 3. Critical User Journeys

### 3.1 Manually Logging a Transaction
**Goal:** Record a $4.50 coffee purchase.
1.  **Entry Point:** Click "New Transaction" button on the Dashboard.
2.  **Input:**
    *   **Date:** Select today's date.
    *   **Description:** "Starbucks Coffee".
    *   **Amount:** "-4.50" (or "4.50" and select "Expense").
    *   **Account:** Select "Checking Account".
    *   **Category:** Select "Dining & Drinks".
3.  **Submission:** Click "Save".
4.  **Outcome:** The transaction appears at the top of the transaction list, and the "Checking Account" balance decreases by $4.50.

### 3.2 Bulk Import via CSV
**Goal:** Import 50 transactions from a bank statement.
1.  **Entry Point:** Navigate to `/dashboard/transactions/upload`.
2.  **Action:** Select or drag-and-drop a CSV file.
3.  **Mapping Phase:**
    *   Select which account these transactions belong to.
    *   Map CSV columns to app fields: "Transaction Date" -> Date, "Payee" -> Description, "Transaction Amount" -> Amount.
4.  **Preview Phase:** View a table of the parsed transactions.
    *   The app automatically flags rows as "Income" or "Expense".
    *   User can manually adjust individual rows before final import.
5.  **Final Action:** Click "Import All".
6.  **Outcome:** Transactions are batch-inserted. A summary shows "Successfully imported 48 transactions, 2 skipped (duplicates)".

### 3.3 Filtering and Searching Transactions
**Goal:** Find how much was spent on "Amazon" in the last 3 months.
1.  **Entry Point:** Transaction list.
2.  **Actions:**
    *   **Search:** Type "Amazon" in the search bar.
    *   **Date Filter:** Select "Last 90 Days" in the Date Range Picker.
3.  **Display:** The list updates in real-time to show only matching rows.
4.  **Summary:** The total amount for the filtered view is displayed at the bottom or top of the list.

### 3.4 Editing/Deleting Transactions
**Goal:** Fix a typo in a description or delete a duplicate.
1.  **Action:** Click on a transaction row to open the edit dialog.
2.  **Update:** Change the amount or category.
3.  **Delete:** Click the trash icon for a specific row.
4.  **Outcome:** Immediate update to the database and UI.

## 4. Success Metrics
*   Bulk import takes less than 1 minute for a file with 100 rows.
*   Search results return in under 200ms.
