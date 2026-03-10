import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { db } from '../../../db';
import { budgets, accounts, journalEntries, transactions } from '../../../db/schema';
import { eq, and, gte, lte, sum, sql } from 'drizzle-orm';

export const budgetsRouter = router({
  list: publicProcedure.query(async () => {
    const results = await db
      .select({
        id: budgets.id,
        accountId: budgets.accountId,
        accountName: accounts.name,
        limitAmount: budgets.limitAmount,
        period: budgets.period,
        startDate: budgets.startDate,
      })
      .from(budgets)
      .innerJoin(accounts, eq(budgets.accountId, accounts.id));
    
    // For each budget, calculate current spending
    const budgetsWithProgress = await Promise.all(results.map(async (b) => {
      // Assuming monthly for now (current month)
      const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
      const [spending] = await db
        .select({
          total: sum(journalEntries.amount).mapWith(Number),
        })
        .from(journalEntries)
        .innerJoin(transactions, eq(journalEntries.transactionId, transactions.id))
        .where(
          and(
            eq(journalEntries.accountId, b.accountId),
            sql`strftime('%Y-%m', ${transactions.date}) = ${currentMonth}`
          )
        );
      
      return {
        ...b,
        currentSpent: Math.abs(spending?.total || 0),
      };
    }));
    
    return budgetsWithProgress;
  }),

  create: publicProcedure
    .input(z.object({
      accountId: z.string(),
      limitAmount: z.number().int(),
      period: z.enum(['monthly', 'yearly']),
      startDate: z.string(),
    }))
    .mutation(async ({ input }) => {
      const id = crypto.randomUUID();
      await db.insert(budgets).values({
        id,
        ...input,
      });
      return id;
    }),

  update: publicProcedure
    .input(z.object({
      id: z.string(),
      limitAmount: z.number().int(),
    }))
    .mutation(async ({ input }) => {
      await db.update(budgets).set({ limitAmount: input.limitAmount }).where(eq(budgets.id, input.id));
    }),

  delete: publicProcedure.input(z.string()).mutation(async ({ input }) => {
    await db.delete(budgets).where(eq(budgets.id, input));
  }),
});
