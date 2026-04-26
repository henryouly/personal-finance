import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { db } from '../../../db';
import { transactions, journalEntries } from '../../../db/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';
import { validateTransaction } from '../../domain/accounting';

export const transactionsRouter = router({
  list: publicProcedure
    .input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      accountId: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      let query = db.select({
        id: transactions.id,
        date: transactions.date,
        description: transactions.description,
        status: transactions.status,
        source: transactions.source,
      }).from(transactions);

      const conditions = [];
      if (input?.startDate) conditions.push(gte(transactions.date, input.startDate));
      if (input?.endDate) conditions.push(lte(transactions.date, input.endDate));
      
      if (conditions.length > 0) {
        // @ts-expect-error - complex drizzle conditions
        query = query.where(and(...conditions));
      }

      const results = await query.orderBy(desc(transactions.date));
      
      // Fetch entries for each transaction
      const txsWithEntries = await Promise.all(results.map(async (tx) => {
        const entries = await db.select().from(journalEntries).where(eq(journalEntries.transactionId, tx.id));
        return { ...tx, entries };
      }));

      // Filter by accountId if provided
      if (input?.accountId) {
        return txsWithEntries.filter(tx => tx.entries.some(e => e.accountId === input.accountId));
      }

      return txsWithEntries;
    }),

  create: publicProcedure
    .input(z.object({
      date: z.string(),
      description: z.string(),
      entries: z.array(z.object({
        accountId: z.string(),
        amount: z.number().int(), // Cents
      })).min(2),
    }))
    .mutation(async ({ input }) => {
      validateTransaction(input.entries);
      
      const txId = crypto.randomUUID();
      await db.transaction(async (tx) => {
        await tx.insert(transactions).values({
          id: txId,
          date: input.date,
          description: input.description,
        });

        for (const entry of input.entries) {
          await tx.insert(journalEntries).values({
            id: crypto.randomUUID(),
            transactionId: txId,
            accountId: entry.accountId,
            amount: entry.amount,
          });
        }
      });
      return txId;
    }),

  delete: publicProcedure.input(z.string()).mutation(async ({ input }) => {
    await db.delete(transactions).where(eq(transactions.id, input));
  }),

  update: publicProcedure
    .input(z.object({
      id: z.string(),
      date: z.string(),
      description: z.string(),
      entries: z.array(z.object({
        accountId: z.string(),
        amount: z.number().int(), // Cents
      })).min(2),
    }))
    .mutation(async ({ input }) => {
      validateTransaction(input.entries);
      
      await db.transaction(async (tx) => {
        // Update transaction header
        await tx.update(transactions)
          .set({
            date: input.date,
            description: input.description,
          })
          .where(eq(transactions.id, input.id));

        // Replace journal entries
        // Delete old ones
        await tx.delete(journalEntries).where(eq(journalEntries.transactionId, input.id));

        // Insert new ones
        for (const entry of input.entries) {
          await tx.insert(journalEntries).values({
            id: crypto.randomUUID(),
            transactionId: input.id,
            accountId: entry.accountId,
            amount: entry.amount,
          });
        }
      });
      return input.id;
    }),

  updateStatus: publicProcedure
    .input(z.object({
      id: z.string(),
      status: z.enum(['pending', 'cleared', 'reconciled']),
    }))
    .mutation(async ({ input }) => {
      await db.update(transactions)
        .set({ status: input.status })
        .where(eq(transactions.id, input.id));
    }),
});
