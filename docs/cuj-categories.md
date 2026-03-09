# Critical User Journeys (CUJ): Categories Management

## 1. Overview
Categories allow users to classify their spending and income, enabling detailed analysis of where their money is going.

## 2. User Personas
*   **Organized User:** Wants a granular breakdown of spending (e.g., "Streaming Services" vs "Broadband").
*   **Simple User:** Prefers broad categories (e.g., "Entertainment", "Utilities").

## 3. Critical User Journeys

### 3.1 Adding a New Category
**Goal:** A user wants to create a "Groceries" category to track food spending.
1.  **Entry Point:** Navigate to "Settings" or "Categories" management section.
2.  **Action:** Click "Add Category".
3.  **Input:**
    *   Enter Category Name (e.g., "Groceries").
    *   Select a Color (e.g., Green).
    *   Select an Icon (e.g., a shopping basket).
4.  **Validation:** Name must be unique for the user.
5.  **Submission:** Click "Save".
6.  **Outcome:** The category is now available in the dropdown when creating/editing transactions.

### 3.2 Categorizing Transactions
**Goal:** A user wants to assign a category to an uncategorized transaction.
1.  **Entry Point:** View the Transaction List.
2.  **Action:** Locate an "Uncategorized" transaction and click the category field.
3.  **Selection:** Choose a category from the searchable dropdown list.
4.  **Outcome:** The transaction is updated immediately, and the Dashboard charts (Spending by Category) refresh to reflect the change.

### 3.3 Managing Category Colors and Icons
**Goal:** A user wants to customize the visual representation of their spending.
1.  **Entry Point:** Category list.
2.  **Action:** Edit a category (e.g., "Rent").
3.  **Modification:** Change the color to Red and the icon to a House.
4.  **Submission:** Save changes.
5.  **Outcome:** All charts using this category update their legends and slices to the new color.

### 3.4 Deleting/Merging Categories
**Goal:** A user wants to remove a category they no longer use.
1.  **Entry Point:** Category list.
2.  **Action:** Click "Delete".
3.  **Decision Point:** If transactions exist in this category, the user is asked if they want to:
    *   Mark all as "Uncategorized".
    *   Move all transactions to a different category (Merge).
4.  **Outcome:** The category is removed, and transactions are updated according to the user's choice.

## 4. Success Metrics
*   Zero "Uncategorized" transactions for active users.
*   Visual consistency across all charts and lists using category colors.
