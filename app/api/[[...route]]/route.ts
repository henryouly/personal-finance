import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { HTTPException } from 'hono/http-exception';

import accounts from "./accounts";
import transactions from "./transactions";
import analytics from "./analytics";
import categories from "./categories";
export const runtime = 'edge';

const app = new Hono().basePath('/api');

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  return c.json({ error: "Internal error" }, 500);
});

const routes = app
  .route("/accounts", accounts)
  .route("/transactions", transactions)
  .route("/analytics", analytics)
  .route("/categories", categories);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
