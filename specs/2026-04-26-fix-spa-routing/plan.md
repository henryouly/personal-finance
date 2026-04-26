# Plan: Fix SPA Routing 404 on Refresh

## 1. Research
- Analyze `vite.config.ts` and `src/server/index.ts`.
- Confirm how `@hono/vite-dev-server` interacts with Vite's SPA fallback.

## 2. Implementation
### 2.1 Update `vite.config.ts`
- Modify the `exclude` option of the `devServer` plugin.
- Exclude all paths that do not start with `/trpc` to allow Vite's SPA fallback to handle them.
- Ensure static assets (assets, public, etc.) are still excluded.

## 3. Verification
### 3.1 Manual Verification
- Open the app, go to `/transactions`, and refresh.
- Open the app, go to `/accounts`, and refresh.
- Perform a tRPC action (e.g., create an account) to ensure API connectivity is preserved.
