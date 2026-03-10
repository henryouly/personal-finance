import { router } from './trpc';
import { accountsRouter } from './routers/accounts';
import { transactionsRouter } from './routers/transactions';
import { budgetsRouter } from './routers/budgets';
import { analyticsRouter } from './routers/analytics';

export const appRouter = router({
  accounts: accountsRouter,
  transactions: transactionsRouter,
  budgets: budgetsRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;
