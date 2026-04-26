# Plan: Hierarchical Category Management

## Phase 1: Database & Backend
1. **Update Schema (`db/schema.ts`)**:
    - Add `parentId` to `accounts` table.
2. **Apply Database Migration**:
    - Run `pnpm db:push`.
3. **Update `accountsRouter` (`src/server/routers/accounts.ts`)**:
    - Update `create` and `update` to handle `parentId`.
    - Update `list` and `get` to return `parentId`.

## Phase 2: Frontend Infrastructure
1. **New Page `src/pages/Categories.tsx`**:
    - Build a page with a list of categories.
    - Group by `income` and `expense`.
    - Handle nesting (indent child categories).
2. **Update Sidebar (`src/App.tsx`)**:
    - Add "Categories" link.
    - Configure routing for `/categories`.

## Phase 3: UI Integration & Polish
1. **Update Transaction Modal (`src/pages/Transactions.tsx`)**:
    - Modify category dropdown to show hierarchy (e.g., "Food > Groceries").
2. **Polishing**:
    - Add icons and colors to categories in the list.

## Phase 4: Automated Testing
1. **E2E Tests (`e2e/categories.spec.ts`)**:
    - Verify category creation and nesting.
    - Verify selection in transactions.
