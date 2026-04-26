# Technical Specification: Finance Prototype

## 1. Technology Stack

### 1.1 Core Architecture
- **Runtime:** Node.js (Edge-compatible).
- **Backend Framework:** **Hono** (Fast, lightweight routing).
- **Frontend Framework:** **React 19** (Leveraging latest features like `use` and improved hydration).
- **API Layer:** **tRPC v11** (End-to-end type safety without manual schema synchronization).
- **Build Tool:** **Vite** (Unified development server for both frontend and Hono backend).

### 1.2 Data & Storage
- **Database:** **SQLite (via libSQL)** (Local-first, single-file reliability).
- **ORM:** **Drizzle ORM** (Type-safe SQL dialect, lightweight).
- **State Management:** **TanStack Query (React Query)** (Server state management, caching, and optimistic updates).

### 1.3 Styling & UI
- **CSS:** **Tailwind CSS 4.0** (Utility-first styling with the latest engine).
- **Components:** **shadcn/ui** (Built on Radix UI primitives for accessibility).
- **Visuals:** **Recharts** (Declarative charts) and **Lucide React** (Consistent iconography).

## 2. Key Technical Decisions

### 2.1 Double-Entry Bookkeeping
To ensure data integrity, the system uses a double-entry model. Every `Transaction` is a container for at least two `JournalEntries`. The sum of all entries in a transaction must equal zero ($ \sum amount = 0 $).
- **Asset/Expense Accounts:** Debit increases balance (+), Credit decreases (-).
- **Liability/Income Accounts:** Credit increases balance (+), Debit decreases (-).

### 2.2 Integer Cent Precision
All monetary values are stored and calculated as **Integers** representing cents (e.g., $10.50 is stored as `1050`). This completely avoids floating-point rounding errors (e.g., `0.1 + 0.2 !== 0.3`).

### 2.3 Local-First Portability
By using SQLite/libSQL, the application is zero-config for developers and can be easily backed up or migrated. The architecture is designed to eventually support syncing to a remote Turso database.

### 2.4 End-to-End Type Safety
The use of tRPC ensures that changes in the database schema or backend logic are immediately caught by the TypeScript compiler in the frontend, preventing runtime API mismatches.

## 3. Database Schema Overview

### 3.1 Core Entities
- `accounts`: Stores real bank accounts and virtual categories (Nominal accounts).
- `transactions`: Header information for financial events (Date, Description).
- `journal_entries`: The actual movement of value between accounts.
- `budgets`: Spending limits tied to specific `expense` type accounts.

### 3.2 Deduplication Strategy
Transactions include an `external_id` (a hash of date, amount, and description) to prevent duplicate records during CSV imports.

## 4. Testing & Validation
- **Domain Logic:** Mathematical validation of transactions (zero-sum) is encapsulated in a domain layer, tested with Vitest.
- **Form Validation:** All inputs are validated via **Zod** schemas shared between the frontend and the tRPC router.
