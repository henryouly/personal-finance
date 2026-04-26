# Agent Instructions: Using Specs & Memory

To ensure consistency across sessions, all agents must adhere to the following workflow when working on the Finance Prototype.

## 1. The Source of Truth
- **@specs/**: This directory contains the project's constitution.
    - `goal.md`: Read this to understand **WHY** we are building and **WHAT** defines success.
    - `tech_spec.md`: Read this to understand **HOW** to write code (stack, standards, math).
    - `roadmap.md`: Check this to see **WHERE** we are and what task is next.
- **MEMORY.md**: Read this for a quick high-level index and to see recent context/decisions.

## 2. Agent Workflow
1. **Bootstrap:** Always start by reading `MEMORY.md` and the relevant file in `specs/`.
2. **Consult:** Before making architectural changes, verify they align with `tech_spec.md`.
3. **Update:** When a phase is completed or a major decision is made:
    - Update `specs/roadmap.md` status.
    - Add a brief entry to the "Recent Decisions" in `MEMORY.md`.
4. **Validation:** Ensure all changes maintain the "Double-Entry" and "Integer Cent" mandates defined in the specs.

## 3. Communication
- Keep the `specs/` documents up to date. If the user changes the project's direction, update the docs immediately to prevent future agents from hallucinating old requirements.
