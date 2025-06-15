import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { getAllCategories, getAllAccounts, getIncomeVsExpense, getAccountById } from '@/db/queries';
export const appRouter = createTRPCRouter({
  getAllCategories: baseProcedure.query(getAllCategories),
  getAllAccounts: baseProcedure.query(getAllAccounts),
  getAccountById: baseProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .query(({ input }) => getAccountById(input.id)),
  getIncomeVsExpense: baseProcedure
    .input(z.object({ startDate: z.date(), endDate: z.date() }))
    .query(({ input }) => getIncomeVsExpense(input.startDate, input.endDate)),
});
// export type definition of API
export type AppRouter = typeof appRouter;
