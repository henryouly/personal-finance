import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { db } from '../../../db';
import { budgets, accounts, journalEntries, transactions } from '../../../db/schema';
import { eq, and, sum, sql } from 'drizzle-orm';
import { format } from 'date-fns';

export const budgetsRouter = router({
  list: publicProcedure.query(async () => {
    const now = new Date();
    const currentMonth = format(now, 'yyyy-MM');
    const currentYear = format(now, 'yyyy');

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
    
    // We still need to respect the budget-specific startDate and period, 
    // so we'll do the final aggregation per budget.
    const budgetsWithProgress = await Promise.all(results.map(async (b) => {
      const dateFilter = b.period === 'monthly' 
        ? sql`strftime('%Y-%m', ${transactions.date}) = ${currentMonth}`
        : sql`strftime('%Y', ${transactions.date}) = ${currentYear}`;

      const [spending] = await db
        .select({
          total: sum(journalEntries.amount).mapWith(Number),
        })
        .from(journalEntries)
        .innerJoin(transactions, eq(journalEntries.transactionId, transactions.id))
        .where(
          and(
            eq(journalEntries.accountId, b.accountId),
            dateFilter,
            sql`${transactions.date} >= ${b.startDate}`
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
      // Check if budget already exists
      const existing = await db
        .select()
        .from(budgets)
        .where(
          and(
            eq(budgets.accountId, input.accountId),
            eq(budgets.period, input.period)
          )
        )
        .limit(1);
      
      if (existing.length > 0) {
        throw new Error('A budget already exists for this category and period');
      }

      const id = crypto.randomUUID();
      await db.insert(budgets).values({
        id,
        ...input,
        startDate: input.startDate.substring(0, 10), // Ensure YYYY-MM-DD
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
