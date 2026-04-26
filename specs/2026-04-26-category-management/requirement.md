# Requirement: Hierarchical Category Management

## 1. Objective
Provide a dedicated interface for users to organize their income and expenses into a hierarchical structure (e.g., "Food" > "Groceries").

## 2. Functional Requirements
### 2.1 Category Hierarchy
- **Parent-Child Relationships:** Categories can be nested. Every category can optionally have one parent category.
- **Root Categories:** Categories without a parent are considered top-level categories.
- **Account Types:** Both `income` and `expense` account types should support hierarchy.

### 2.2 Category Management UI
- **Dedicated Page:** A new "Categories" page accessible via the sidebar.
- **Nested List View:** Display categories in a way that reflects their hierarchy.
- **CRUD Operations:**
    - Create categories with optional parent selection.
    - Edit category name, type, color, and parent.
    - Delete categories (with cascade or move logic).

### 2.3 Integration
- **Transaction Entry:** The category selector in the transaction modal should show the hierarchy path (e.g., "Food > Groceries").

## 3. Technical Constraints
- **Schema:** Add `parentId` text field to the `accounts` table.
- **E2E Testing:** Verify the end-to-end flow of creating and nesting categories.

## 4. Verification Criteria
- [ ] Users can create a sub-category under a parent.
- [ ] The Categories page correctly displays the nested structure.
- [ ] The transaction modal dropdown reflects the hierarchy.
- [ ] Automated E2E tests confirm the logic.
