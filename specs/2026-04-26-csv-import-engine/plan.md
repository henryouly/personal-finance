# Plan: CSV Import Engine

## Step 1: Backend Setup
*   **Install Dependency**: Add `papaparse` to the project.
*   **Modify `src/server/routers/transactions.ts`**:
    *   Add `parseCSV` procedure:
        *   Accept base64 or string CSV data.
        *   Return headers and first few rows for mapping.
    *   Add `previewImport` procedure:
        *   Accept column mappings.
        *   Perform full parse + auto-categorization + duplicate detection.
        *   Return list of `ImportRow` (with status like `duplicate`, `suggested`).
    *   Add `bulkCreate` procedure:
        *   Accept final list of transactions and commit them in a single database transaction.

## Step 2: Frontend Implementation (Wizard)
*   **Create `src/components/CSVImportModal.tsx`**:
    *   **Phase 1: Upload**: File dropzone.
    *   **Phase 2: Mapping**: Dropdowns to select which CSV column matches `date`, `description`, and `amount`.
    *   **Phase 3: Preview**: A table with:
        *   Checkboxes for selection.
        *   Category dropdowns (pre-filled by AI).
        *   Warning icons for duplicates.
    *   **Phase 4: Finish**: Success summary.
*   **Update `src/pages/Transactions.tsx`**:
    *   Hook up the "Import CSV" button to open the modal.

## Step 3: Logic Refinement
*   **Duplicate Detection**: Implement a helper in `src/domain/transactions.ts` that checks for similar descriptions and exact amounts within a 3-day window.
*   **Auto-Categorization**: Ensure the `previewImport` loop calls the existing prediction logic.

## Step 4: Verification
*   **Integration Test**: Verify the parsing logic with sample bank CSVs (Chase, Amex formats).
*   **E2E Test**: `e2e/import.spec.ts` to simulate the full upload-map-confirm flow.
