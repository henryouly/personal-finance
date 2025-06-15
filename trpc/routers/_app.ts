import { createTRPCRouter } from '../init';
import { transactionsRouter } from './transactions-router';
import { analyticsRouter } from './analytics-router';
import { accountsRouter } from './accounts-router';
import { categoriesRouter } from './categories-router';

export const appRouter = createTRPCRouter({
  categories: categoriesRouter,
  accounts: accountsRouter,
  transactions: transactionsRouter,
  analytics: analyticsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
