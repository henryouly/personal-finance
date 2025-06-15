import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { getAllCategories, getAllAccounts, getIncomeVsExpense, getAccountById } from '@/db/queries';
import { transactionsRouter } from './transactions-router';
import { analyticsRouter } from './analytics-router';

export const appRouter = createTRPCRouter({
  getAllCategories: baseProcedure.query(getAllCategories),
  getAllAccounts: baseProcedure.query(getAllAccounts),
  getAccountById: baseProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .query(({ input }) => getAccountById(input.id)),
  transactions: transactionsRouter,
  analytics: analyticsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
