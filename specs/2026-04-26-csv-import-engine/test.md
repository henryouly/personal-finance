# Test Plan: CSV Import Engine

## Automated Tests

### 1. Integration Test (tRPC)
*   **File**: `src/server/routers/transactions.import.test.ts`
*   **Cases**:
    *   **Parsing**: Verify headers are extracted correctly from a raw CSV string.
    *   **Mapping**: Ensure data is transformed accurately based on user mappings.
    *   **Duplicate Detection**: Verify that identical transactions are flagged as duplicates.
    *   **AI Categorization**: Ensure the preview returns suggested account IDs for known descriptions.

### 2. E2E Test (Playwright)
*   **File**: `e2e/import.spec.ts`
*   **Steps**:
    1.  Click "Import CSV".
    2.  Upload a dummy CSV file.
    3.  Select column mappings.
    4.  Verify preview rows appear.
    5.  Change a category in the preview.
    6.  Click "Import All".
    7.  Verify transactions appear in the main list.

## Manual Verification
1.  Try importing a CSV with a header row and one without.
2.  Import with negative amounts (typical for expenses in bank exports) and verify signage.
3.  Test fuzzy matching by importing a transaction that already exists with a slightly different name (e.g., "STBK" vs "STARBUCKS").
