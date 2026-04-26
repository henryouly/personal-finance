import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { db } from '../../../db';
import { accounts, journalEntries, transactions } from '../../../db/schema';
import { eq, sql, and, lte } from 'drizzle-orm';

export const accountsRouter = router({
  list: publicProcedure
    .input(z.object({ 
      classification: z.enum(['asset', 'liability', 'equity', 'income', 'expense']).optional(),
      includeInactive: z.boolean().optional().default(false),
    }).optional())
    .query(async ({ input }) => {
      const query = db.select({
        id: accounts.id,
        name: accounts.name,
        type: accounts.type,
        parentId: accounts.parentId,
        color: accounts.color,
        icon: accounts.icon,
        isActive: accounts.isActive,
        totalBalance: sql<number>`COALESCE(SUM(${journalEntries.amount}), 0)`,
        clearedBalance: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.status} IN ('cleared', 'reconciled') THEN ${journalEntries.amount} ELSE 0 END), 0)`,
      })
      .from(accounts)
      .leftJoin(journalEntries, eq(accounts.id, journalEntries.accountId))
      .leftJoin(transactions, eq(journalEntries.transactionId, transactions.id))
      .groupBy(accounts.id)
      .$dynamic();

      const filters = [];
      if (!input?.includeInactive) {
        filters.push(eq(accounts.isActive, true));
      }
      if (input?.classification) {
        filters.push(eq(accounts.type, input.classification));
      }

      if (filters.length > 0) {
        return await query.where(and(...filters));
      }
      
      return await query;
    }),

  get: publicProcedure.input(z.string()).query(async ({ input }) => {
    const [result] = await db.select({
      id: accounts.id,
      name: accounts.name,
      type: accounts.type,
      parentId: accounts.parentId,
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
      parentId: z.string().optional().nullable(),
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
      parentId: z.string().optional().nullable(),
      color: z.string().optional(),
      icon: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.update(accounts).set(data).where(eq(accounts.id, id));
    }),
  delete: publicProcedure.input(z.string()).mutation(async ({ input }) => {
    await db.transaction(async (tx) => {
      // 1. Ensure "Uncategorized" system category exists
      let [uncategorized] = await tx.select()
        .from(accounts)
        .where(and(eq(accounts.name, 'Uncategorized'), eq(accounts.isSystem, true)))
        .limit(1);

      if (!uncategorized) {
        const id = crypto.randomUUID();
        await tx.insert(accounts).values({
          id,
          name: 'Uncategorized',
          type: 'expense',
          isSystem: true,
          color: '#94a3b8', // Slate-400
        });
        [uncategorized] = await tx.select().from(accounts).where(eq(accounts.id, id)).limit(1);
      }

      // 2. Update all journal entries pointing to the deleted account
      await tx.update(journalEntries)
        .set({ accountId: uncategorized.id })
        .where(eq(journalEntries.accountId, input));

      // 3. Reassign child categories to parent or make them top-level
      const [deletedAccount] = await tx.select().from(accounts).where(eq(accounts.id, input)).limit(1);
      await tx.update(accounts)
        .set({ parentId: deletedAccount?.parentId || null })
        .where(eq(accounts.parentId, input));

      // 4. Finally delete the account
      await tx.delete(accounts).where(eq(accounts.id, input));
    });
  }),
});
