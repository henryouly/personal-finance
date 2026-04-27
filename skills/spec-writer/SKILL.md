---
name: spec-writer
description: "Automates the creation of a task specification folder in @specs/ using the YYYY-MM-DD-<task-name> format. Use this skill whenever a new feature, bug fix, or technical task needs a structured plan, requirements, and test strategy before implementation."
---

# Spec Writer

This skill automates the creation of structured specification folders for new tasks. It ensures consistency across the project by following a standardized directory and file structure.

## Workflow

1.  **Gather Information**: Identify the task name and its core requirements.
2.  **Create Folder**: Create a folder inside `specs/` named `YYYY-MM-DD-<task-name>`.
3.  **Generate Files**: Create the following three files inside that folder:
    *   `requirement.md`: Define verifiable requirements. Use `ask_user` to clarify scope or technical decisions.
    *   `plan.md`: A detailed, step-by-step implementation plan (files to edit, tests to update).
    *   `test.md`: A verification plan (automated and manual tests).
4.  **Reference Project Memory**: Ensure the new spec aligns with `MEMORY.md`, `specs/goal.md`, and `specs/tech_spec.md`.

## File Content Guidelines

### 1. requirement.md
*   **Objective**: What is the primary goal?
*   **Functional Requirements**: List specific, verifiable behaviors.
*   **Technical Constraints**: Mention specific libraries, architectures, or performance needs.
*   **Clarification**: If the task is underspecified, you **MUST** use the `ask_user` tool to clarify:
    *   The scope of the project.
    *   Any key technical decisions (e.g., "Should we use a new table or add a column?").

### 2. plan.md
*   **Step-by-Step**: Break the implementation into logical phases (e.g., Backend, Frontend, Testing).
*   **Specifics**: Name the files that will be modified.
*   **Integrity**: Include steps for updating or creating unit/E2E tests.

### 3. test.md
*   **Verification Strategy**: Explain how the work will be verified against the requirements.
*   **Test Cases**: Describe specific automated tests (e.g., Playwright, Vitest) and manual steps.
*   **Run Commands**: Provide the exact shell commands to execute the tests (e.g., `pnpm test:e2e`).

## Example Structure
```
specs/
└── 2026-04-26-new-feature-name/
    ├── requirement.md
    ├── plan.md
    └── test.md
```
