# Requirement: CSV Import Engine

## Objective
Enable users to bulk-import transactions from bank statements (CSV) to reduce manual data entry effort and improve accuracy.

## Functional Requirements
1.  **Drag-and-Drop Upload**: A dedicated modal or zone in the Transactions tab to upload CSV files.
2.  **Column Mapping**: A step where users map CSV columns (e.g., "Transaction Date", "Payee", "Amount") to system fields (`date`, `description`, `amount`).
3.  **Backend Parsing**: CSV processing must happen on the backend to ensure consistency and handle potential large files.
4.  **Interactive Preview**: A grid showing parsed transactions before they are committed to the database.
5.  **Smart Auto-Categorization**: 
    *   Leverage existing `predictCategory` logic to suggest categories for each imported row.
    *   Allow users to override suggestions in the preview grid.
6.  **Fuzzy Duplicate Detection**:
    *   Flag transactions that likely already exist in the database (Fuzzy description match + exact amount/date).
    *   Allow users to skip or force-import flagged rows.
7.  **Bulk Commit**: A single action to save all approved transactions.

## Technical Constraints
*   **Library**: Use `PapaParse` or similar for robust CSV parsing on the server.
*   **API**: Extend tRPC with `parseCSV` and `commitImport` procedures.
*   **Validation**: Ensure all imported rows are valid transactions (balanced entries).

## User Decisions (Clarified)
*   **Parsing**: Backend-heavy logic.
*   **Duplicates**: Fuzzy matching enabled.
*   **AI**: Auto-categorization enabled during preview.
