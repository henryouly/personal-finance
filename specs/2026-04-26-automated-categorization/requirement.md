# Requirement: Automated Categorization

## 1. Objective
Reduce user friction during manual transaction entry by automatically predicting and filling the "To Account / Category" field based on the merchant name (description).

## 2. Functional Requirements
### 2.1 AI-Driven Categorization
- **Mechanism:** Use an AI-based approach (or simulated AI logic for the prototype) to map a transaction description to the most likely category.
- **Trigger:** Categorization should trigger as soon as the user finishes typing or leaves the "Description" field.
- **Behavior:** If a confident match is found, auto-fill the "To Account" dropdown in the transaction form.

### 2.2 Sophisticated Matching
- **Fuzzy Matching:** Support partial matches (e.g., "Amazon.com*123" should map to "Shopping").
- **History Integration:** The model should prioritize categories previously assigned to similar descriptions in the user's history.

## 3. Technical Constraints
- **Frontend/Backend:** Decision needed on whether to perform this via a tRPC procedure (server-side AI/Logic) or client-side. Given the "AI" requirement, a server-side procedure is preferred.
- **Performance:** The prediction should return in <200ms to maintain a "frictionless" experience.

## 4. Verification Criteria
- [x] Entering a known merchant name auto-fills the category.
- [x] Partial matches (e.g., "Starbucks #555") correctly map to the "Dining Out" or equivalent category.
- [x] The user can still manually override the auto-filled category.
- [x] E2E tests verify that typing a description triggers the categorization.
