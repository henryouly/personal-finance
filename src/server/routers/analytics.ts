import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { db } from '../../../db';
import { transactions, journalEntries, accounts } from '../../../db/schema';
import { eq, and, gte, lte, sum, sql } from 'drizzle-orm';

export const analyticsRouter = router({
  categorySpending: publicProcedure
    .input(z.object({
      startDate: z.string(),
      endDate: z.string(),
    }))
    .query(async ({ input }) => {
      // Get sum of entries for accounts of type 'expense'
      const results = await db
        .select({
          categoryId: accounts.id,
          categoryName: accounts.name,
          color: accounts.color,
          total: sum(journalEntries.amount).mapWith(Number),
        })
        .from(journalEntries)
        .innerJoin(transactions, eq(journalEntries.transactionId, transactions.id))
        .innerJoin(accounts, eq(journalEntries.accountId, accounts.id))
        .where(
          and(
            eq(accounts.type, 'expense'),
            gte(transactions.date, input.startDate),
            lte(transactions.date, input.endDate)
          )
        )
        .groupBy(accounts.id);
      
      return results;
    }),

  incomeVsExpense: publicProcedure
    .input(z.object({
      startDate: z.string(),
      endDate: z.string(),
    }))
    .query(async ({ input }) => {
      const results = await db
        .select({
          type: accounts.type,
          total: sum(journalEntries.amount).mapWith(Number),
        })
        .from(journalEntries)
        .innerJoin(transactions, eq(journalEntries.transactionId, transactions.id))
        .innerJoin(accounts, eq(journalEntries.accountId, accounts.id))
        .where(
          and(
            sql`${accounts.type} IN ('income', 'expense')`,
            gte(transactions.date, input.startDate),
            lte(transactions.date, input.endDate)
          )
        )
        .groupBy(accounts.type);
      
      const income = results.find(r => r.type === 'income')?.total || 0;
      const expense = results.find(r => r.type === 'expense')?.total || 0;
      
      // Income entries are usually negative in double-entry (Credit) if increase, 
      // but let's assume they are stored such that sum > 0 for increase in some contexts.
      // Actually, in our double-entry:
      // Asset Increase = Debit (+)
      // Expense Increase = Debit (+)
      // Income Increase = Credit (-)
      // Liability Increase = Credit (-)
      // So Income should be negative. We take absolute for reporting.
      
      return {
        income: Math.abs(income),
        expense: Math.abs(expense),
      };
    }),

  monthlySpending: publicProcedure
    .input(z.object({
      months: z.number().default(6),
    }))
    .query(async ({ input: _input }) => {
      // Simplified monthly grouping
      const results = await db
        .select({
          month: sql<string>`strftime('%Y-%m', ${transactions.date})`,
          total: sum(journalEntries.amount).mapWith(Number),
        })
        .from(journalEntries)
        .innerJoin(transactions, eq(journalEntries.transactionId, transactions.id))
        .innerJoin(accounts, eq(journalEntries.accountId, accounts.id))
        .where(eq(accounts.type, 'expense'))
        .groupBy(sql`strftime('%Y-%m', ${transactions.date})`)
        .orderBy(sql`strftime('%Y-%m', ${transactions.date})`);
      
      return results;
    }),
});
