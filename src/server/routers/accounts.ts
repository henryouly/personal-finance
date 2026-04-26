import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { db } from '../../../db';
import { accounts, journalEntries, transactions } from '../../../db/schema';
import { eq, sql, and, lte } from 'drizzle-orm';

export const accountsRouter = router({
  list: publicProcedure
    .input(z.object({ 
      classification: z.enum(['asset', 'liability', 'equity', 'income', 'expense']).optional() 
    }).optional())
    .query(async ({ input }) => {
      const query = db.select({
        id: accounts.id,
        name: accounts.name,
        type: accounts.type,
        color: accounts.color,
        icon: accounts.icon,
        isActive: accounts.isActive,
        totalBalance: sql<number>`COALESCE(SUM(${journalEntries.amount}), 0)`,
        clearedBalance: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.status} IN ('cleared', 'reconciled') THEN ${journalEntries.amount} ELSE 0 END), 0)`,
      })
      .from(accounts)
      .leftJoin(journalEntries, eq(accounts.id, journalEntries.accountId))
      .leftJoin(transactions, eq(journalEntries.transactionId, transactions.id))
      .groupBy(accounts.id);

      if (input?.classification) {
        return await query.where(eq(accounts.type, input.classification));
      }
      return await query;
    }),

  get: publicProcedure.input(z.string()).query(async ({ input }) => {
    const [result] = await db.select({
      id: accounts.id,
      name: accounts.name,
      type: accounts.type,
      color: accounts.color,
      icon: accounts.icon,
      isActive: accounts.isActive,
      totalBalance: sql<number>`COALESCE(SUM(${journalEntries.amount}), 0)`,
      clearedBalance: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.status} IN ('cleared', 'reconciled') THEN ${journalEntries.amount} ELSE 0 END), 0)`,
    })
    .from(accounts)
    .leftJoin(journalEntries, eq(accounts.id, journalEntries.accountId))
    .leftJoin(transactions, eq(journalEntries.transactionId, transactions.id))
    .where(eq(accounts.id, input))
    .groupBy(accounts.id);
    
    return result;
  }),

  reconcile: publicProcedure
    .input(z.object({
      accountId: z.string(),
      statementDate: z.string(), // ISO date
      statementBalance: z.number().int(), // cents
    }))
    .mutation(async ({ input }) => {
      await db.transaction(async (tx) => {
        // 1. Calculate cleared balance as of statement date
        const [res] = await tx.select({
          clearedBalance: sql<number>`COALESCE(SUM(${journalEntries.amount}), 0)`,
        })
        .from(journalEntries)
        .innerJoin(transactions, eq(journalEntries.transactionId, transactions.id))
        .where(and(
          eq(journalEntries.accountId, input.accountId),
          lte(transactions.date, input.statementDate),
          sql`${transactions.status} IN ('cleared', 'reconciled')`
        ));

        if (res.clearedBalance !== input.statementBalance) {
          throw new Error(`Reconciliation failed: Variance of ${(res.clearedBalance - input.statementBalance) / 100}`);
        }

        // 2. Mark all 'cleared' transactions as 'reconciled'
        await tx.update(transactions)
          .set({ status: 'reconciled' })
          .where(and(
            eq(transactions.status, 'cleared'),
            lte(transactions.date, input.statementDate),
            sql`EXISTS (
              SELECT 1 FROM ${journalEntries} 
              WHERE ${journalEntries.transactionId} = ${transactions.id} 
              AND ${journalEntries.accountId} = ${input.accountId}
            )`
          ));
      });
    }),
  create: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      type: z.enum(['asset', 'liability', 'equity', 'income', 'expense']),
      color: z.string().optional(),
      icon: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = crypto.randomUUID();
      await db.insert(accounts).values({
        id,
        ...input,
      });
      return id;
    }),
  update: publicProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1),
      type: z.enum(['asset', 'liability', 'equity', 'income', 'expense']),
      color: z.string().optional(),
      icon: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.update(accounts).set(data).where(eq(accounts.id, id));
    }),
  delete: publicProcedure.input(z.string()).mutation(async ({ input }) => {
    // Check for existing journal entries (soft-delete logic)
    const [entry] = await db.select().from(journalEntries).where(eq(journalEntries.accountId, input)).limit(1);
    if (entry) {
      await db.update(accounts).set({ isActive: false }).where(eq(accounts.id, input));
    } else {
      await db.delete(accounts).where(eq(accounts.id, input));
    }
  }),
});
