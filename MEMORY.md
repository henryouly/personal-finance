# Long-Term Memory: Finance Prototype

This file serves as the index for the project's state and long-term context.

## 📌 Project Constitution
- **Product Goal & CUJs:** See [specs/goal.md](specs/goal.md)
- **Technical Stack & Decisions:** See [specs/tech_spec.md](specs/tech_spec.md)
- **Current Progress & Plans:** See [specs/roadmap.md](specs/roadmap.md)

## 🧠 Key Context
- **Accounting Logic:** Rigorous double-entry system. Balance is sum of `journal_entries`.
- **Precision:** All currency is stored as `INTEGER` cents.
- **Database:** Local SQLite using Drizzle ORM.
- **Architecture:** Hono (Backend) + React (Frontend) unified via tRPC and Vite.

## 📝 Recent Decisions
- *2026-04-26*: Initialized specs folder to consolidate PRD, Technical Spec, and Roadmap.
- *2026-04-26*: Established `specs/` as the source of truth for all agent-led development.
