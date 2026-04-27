# Requirement: Budget Progress Visualization

## 1. Objective
Provide users with an immediate, high-level understanding of their spending progress against set budgets directly from the Dashboard.

## 2. Functional Requirements
### 2.1 Dashboard "Budget Overview"
- **Visibility:** A new "Budget Overview" section on the Dashboard.
- **Content:** List top active budgets (e.g., those closest to or over their limits).
- **Visuals:** 
    - Progress bars for each budget.
    - Color coding: 
        - Green: < 80% spent.
        - Yellow: 80-100% spent.
        - Red: > 100% spent.
    - Amount spent vs. Limit amount.
- **Interactivity:** Clicking a budget card should navigate to the Budgets page.

### 2.2 Reusable Progress Component
- Refactor the progress bar logic into a shared component if beneficial, or ensure consistent styling between the Budgets page and the Dashboard.

## 3. Technical Constraints
- **Data Source:** Use the `budgets.list` tRPC procedure.
- **Styling:** Follow existing Tailwind patterns and Lucide icons.
- **Performance:** Ensure the Dashboard remains responsive by efficiently fetching budget data.

## 4. Verification Criteria
- [x] Dashboard displays a "Budget Overview" section.
- [x] Progress bars correctly reflect spending percentages.
- [x] Color coding changes based on spending levels.
- [x] Clicking a budget item navigates to `/budgets`.
- [x] E2E tests verify the presence and accuracy of the dashboard budget summary.
