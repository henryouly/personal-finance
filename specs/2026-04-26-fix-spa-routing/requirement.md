# Requirement: Fix SPA Routing 404 on Refresh

## 1. Objective
Ensure that refreshing the browser on any client-side route (e.g., `/transactions`, `/accounts`) does not result in a "404 Not Found" error.

## 2. Functional Requirements
- **Route Handling:** The server must distinguish between API requests (tRPC) and client-side page routes.
- **Fallthrough behavior:** If a request is not for a known API endpoint or a static asset, the server (or development proxy) must serve `index.html` to allow the client-side router (React Router) to take over.
- **Preserve API functionality:** tRPC requests to `/trpc/*` must continue to be handled by the Hono backend.

## 3. Technical Constraints
- The fix must work in the Vite development environment using `@hono/vite-dev-server`.
- The fix should be compatible with future production builds (where Hono might serve static files).

## 4. Verification Criteria
- [ ] Navigating to `/transactions` and refreshing the page loads the Transactions page correctly.
- [ ] Navigating to `/accounts` and refreshing the page loads the Accounts page correctly.
- [ ] tRPC requests still work as expected.
- [ ] Root path `/` still works as expected.
