# Technical Specification: Finance Prototype

## 1. Architectural Overview
The Finance Prototype is a modern, full-stack web application built using Vite for the build system and Hono for the backend framework. It leverages a type-safe architecture from the database to the UI using Drizzle ORM and tRPC.

## 2. Core Technologies

### 2.1 Backend & Data Layer
*   **Hono:** The primary server-side framework, providing fast routing, middleware, and API handling. Built and served using Vite for a unified development experience.
*   **Drizzle ORM:** A lightweight, type-safe TypeScript ORM. It manages the database schema and provides a performant query interface.
    *   **Adapter:** Uses `@libsql/client` for connecting to a local SQLite database file.
    *   **Schema:** Defined in `db/schema.ts` with relationships and enums.
*   **SQLite (libSQL):** A local, single-file relational database for storing accounts, transactions, and budgets. It ensures portability and zero-configuration for local development.

### 2.2 API & Communication
*   **tRPC (v11):** Provides end-to-end type safety for API calls between the Hono backend and the React frontend.
    *   **Routers:** Located in `trpc/routers/`, broken down by domain (accounts, transactions, categories, analytics).
    *   **Procedures:** Standardized procedures for querying and mutating data.
*   **TanStack Query (React Query):** Manages server state on the frontend, providing caching, background updates, and optimistic UI updates.

### 2.3 Frontend & UI
*   **React:** The UI library for building the interactive dashboard and management interfaces.
*   **Vite:** The build tool and development server, providing fast HMR and optimized production builds.
*   **Tailwind CSS 4.x:** A utility-first CSS framework for rapid styling.
*   **shadcn/ui (Radix UI):** High-quality, accessible UI components (Tabs, Dialogs, Cards, Forms).
*   **Recharts:** A composable charting library for data visualization (Spending Trends, Category Analysis).
*   **Lucide React:** Icon library for consistent visual language.
*   **React Hook Form & Zod:** Type-safe form management and validation.

## 3. Database Schema Details
The database schema includes the following primary entities:
*   **Accounts:** Financial accounts (name, type, balance, color).
*   **Categories:** Expense/Income categories (name, color, icon).
*   **Transactions:** Individual financial records linked to an account and category.
*   **Budgets:** Spending targets for specific categories over a period (monthly/yearly).

## 4. Performance & Scalability
*   **Vite Development Server:** Provides extremely fast startup and Hot Module Replacement (HMR) for both frontend and backend code.
*   **Static Asset Optimization:** Vite ensures optimized builds for CSS, images, and JavaScript.
*   **Database Indexing:** Indexes on `transactions.date`, `transactions.category_id`, and `transactions.account_id` for efficient querying.
*   **Edge Compatibility:** The Hono-based backend is designed to be compatible with Edge Runtimes (Vercel, Cloudflare Workers).
