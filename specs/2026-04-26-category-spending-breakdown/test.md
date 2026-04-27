# Test Plan: Category-wise Spending Breakdown

## Automated Tests

### 1. E2E Test (Playwright)
*   **File**: `e2e/reports.spec.ts`
*   **New Cases**:
    *   **Check Total Label**: Verify that a text element containing the formatted total spending is present.
    *   **Tooltip Content**: Hover over a pie slice and verify the tooltip contains a percentage (`%`).
    *   **Empty State**: (Already covered, but ensure no crash if no spending).

## Manual Verification
1.  Check that categories with specific colors assigned in "Accounts" use those colors in the donut.
2.  Resize the window to ensure the donut and legend remain readable.
3.  Verify the percentages change when switching between 3, 6, and 12 months.
