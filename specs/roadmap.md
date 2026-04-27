# Project Roadmap: Finance Prototype

## Phase 1: Foundation (Completed ✅)
- [x] Project scaffolding (Vite + Hono + tRPC).
- [x] Database schema design for double-entry bookkeeping.
- [x] Drizzle ORM integration and migrations.
- [x] Core domain logic for transaction validation.
- [x] Basic tRPC routers for Accounts and Transactions.

## Phase 2: Account & Transaction Management (In Progress 🚧)
- [x] Account creation and listing UI.
- [x] Manual transaction entry with dual-account selection.
- [x] Transaction list view with basic filtering.
- [x] Refine transaction editing and deletion workflows. ✅
- [x] Fix SPA routing 404 on page refresh. ✅
- [x] Implement account balance calculation logic (reconciliation). ✅
- [x] Add support for multiple entries per transaction (split transactions). ✅

## Phase 3: Budgeting & Categories (In Progress 🚧)
- [x] Database schema for budgets.
- [x] Implementation of Category management UI. ✅
- [ ] Budget creation and tracking logic. 🚧
- [ ] Progress visualization for category spending limits.
- [ ] Automated categorization based on merchant history.

## Phase 4: Analytics & Reporting (Planned 📅)
- [ ] Income vs. Expense monthly comparison chart.
- [ ] Category-wise spending breakdown (Donut chart).
- [ ] Net worth tracking trend over time.
- [ ] Savings rate calculator widget.
- [ ] Top merchants/payees report.

## Phase 5: Bulk Operations & Advanced Features (Planned 📅)
- [ ] **CSV Import Engine:** Drag-and-drop bank statement processing.
- [ ] Column mapping and preview before import.
- [ ] Duplicate detection and fuzzy matching for manual transactions.
- [ ] Data export (JSON/CSV).
- [ ] Dark mode support and mobile-responsive polish.

