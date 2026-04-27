import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { db } from '../../../db';
import { transactions, journalEntries, accounts } from '../../../db/schema';
import { eq, and, gte, lte, sum, sql } from 'drizzle-orm';
import { format, subMonths, startOfMonth } from 'date-fns';

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
      
      return {
        income: Math.abs(income),
        expense: Math.abs(expense),
      };
    }),

  monthlyIncomeVsExpense: publicProcedure
    .input(z.object({
      months: z.number().default(6),
    }))
    .query(async ({ input }) => {
      const startDate = format(subMonths(startOfMonth(new Date()), input.months - 1), 'yyyy-MM-dd');
      
      const rawResults = await db
        .select({
          month: sql<string>`strftime('%Y-%m', ${transactions.date})`,
          type: accounts.type,
          total: sum(journalEntries.amount).mapWith(Number),
        })
        .from(journalEntries)
        .innerJoin(transactions, eq(journalEntries.transactionId, transactions.id))
        .innerJoin(accounts, eq(journalEntries.accountId, accounts.id))
        .where(
          and(
            sql`${accounts.type} IN ('income', 'expense')`,
            gte(transactions.date, startDate)
          )
        )
        .groupBy(
          sql`strftime('%Y-%m', ${transactions.date})`,
          accounts.type
        )
        .orderBy(sql`strftime('%Y-%m', ${transactions.date})`);

      // Transform into a pivoted format: { month, income, expense, net }
      const monthsMap: Record<string, { month: string, income: number, expense: number, net: number }> = {};
      
      // Initialize months for the requested range to ensure no gaps
      for (let i = 0; i < input.months; i++) {
        const date = subMonths(new Date(), i);
        const monthKey = format(date, 'yyyy-MM');
        monthsMap[monthKey] = { month: monthKey, income: 0, expense: 0, net: 0 };
      }

      rawResults.forEach(row => {
        if (!monthsMap[row.month]) {
          monthsMap[row.month] = { month: row.month, income: 0, expense: 0, net: 0 };
        }
        
        if (row.type === 'income') {
          monthsMap[row.month].income = Math.abs(row.total);
        } else if (row.type === 'expense') {
          monthsMap[row.month].expense = Math.abs(row.total);
        }
        monthsMap[row.month].net = monthsMap[row.month].income - monthsMap[row.month].expense;
      });

      return Object.values(monthsMap).sort((a, b) => a.month.localeCompare(b.month));
    }),

  monthlySpending: publicProcedure
    .input(z.object({
      months: z.number().default(6),
    }))
    .query(async ({ input }) => {
      const startDate = format(subMonths(startOfMonth(new Date()), input.months - 1), 'yyyy-MM-dd');

      const results = await db
        .select({
          month: sql<string>`strftime('%Y-%m', ${transactions.date})`,
          total: sum(journalEntries.amount).mapWith(Number),
        })
        .from(journalEntries)
        .innerJoin(transactions, eq(journalEntries.transactionId, transactions.id))
        .innerJoin(accounts, eq(journalEntries.accountId, accounts.id))
        .where(
          and(
            eq(accounts.type, 'expense'),
            gte(transactions.date, startDate)
          )
        )
        .groupBy(sql`strftime('%Y-%m', ${transactions.date})`)
        .orderBy(sql`strftime('%Y-%m', ${transactions.date})`);
      
      const monthsMap: Record<string, { month: string, total: number }> = {};
      for (let i = 0; i < input.months; i++) {
        const date = subMonths(new Date(), i);
        const monthKey = format(date, 'yyyy-MM');
        monthsMap[monthKey] = { month: monthKey, total: 0 };
      }

      results.forEach(row => {
        if (monthsMap[row.month]) {
          monthsMap[row.month].total = Math.abs(row.total);
        }
      });

      return Object.values(monthsMap).sort((a, b) => a.month.localeCompare(b.month));
    }),
});
