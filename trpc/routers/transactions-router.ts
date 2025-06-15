import { createTRPCRouter } from "../init";
import { baseProcedure } from "../init";
import { z } from 'zod';
import { db } from '@/db/db';
import { transactions } from '@/db/schema';
import { eq, and, desc, gte, lte } from 'drizzle-orm';

const transactionInput = z.object({
  date: z.string().datetime().or(z.date()),
  description: z.string(),
  amount: z.string(),
  type: z.enum(['income', 'expense']),
  categoryId: z.string().uuid().nullable(),
  accountId: z.string().uuid(),
});

export const transactionsRouter = createTRPCRouter({
  // List transactions with filters
  list: baseProcedure
    .input(z.object({
      accountId: z.string().uuid().optional(),
      categoryId: z.string().uuid().optional(),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
      limit: z.coerce.number().int().positive().optional(),
    }))
    .query(async ({ input }) => {
      const { accountId, categoryId, startDate, endDate, limit } = input;

      // Build the where clause based on query params
      const whereClause = and(
        accountId ? eq(transactions.accountId, accountId) : undefined,
        categoryId ? eq(transactions.categoryId, categoryId) : undefined,
        startDate ? gte(transactions.date, new Date(startDate)) : undefined,
        endDate ? lte(transactions.date, new Date(endDate)) : undefined
      );

      // Get transactions with related data
      const allTransactions = await db.query.transactions.findMany({
        where: whereClause,
        with: {
          category: {
            columns: {
              name: true,
              color: true,
            },
          },
          account: {
            columns: {
              name: true,
              color: true,
            },
          },
        },
        orderBy: [desc(transactions.date)],
        limit: limit,
      });

      return { data: allTransactions };
    }),

  // Upload multiple transactions
  upload: baseProcedure
    .input(z.object({
      transactions: z.array(
        z.object({
          date: z.string().or(z.date()),
          description: z.string(),
          amount: z.string(),
          accountId: z.string().uuid(),
          categoryId: z.string().uuid().optional(),
        })
      ).min(1, 'At least one transaction is required')
    }))
    .mutation(async ({ input }) => {
      const { transactions: transactionsToImport } = input;

      // Format transactions data
      const formattedTransactions = transactionsToImport.map((tx: any) => ({
        ...tx,
        date: new Date(tx.date),
        amount: parseFloat(tx.amount).toFixed(2),
        type: parseFloat(tx.amount) < 0 ? 'expense' : 'income',
      }));

      // Insert transactions one by one since transactions aren't supported in the HTTP driver
      const results = [];
      for (const tx of formattedTransactions) {
        try {
          const result = await db.insert(transactions)
            .values(tx)
            .returning();
          results.push(...result);
        } catch (error) {
          console.error('Error inserting transaction:', tx, error);
          throw error; // Stop on first error
        }
      }

      return {
        count: results.length,
        transactions: results
      };
    }),

  // Update a transaction
  update: baseProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: transactionInput.partial()
    }))
    .mutation(async ({ input }) => {
      const { id, data } = input;

      // Check if transaction exists
      const existingTx = await db.query.transactions.findFirst({
        where: eq(transactions.id, id),
      });

      if (!existingTx) {
        throw new Error('Transaction not found');
      }

      // Prepare update data with proper types and handle date conversion
      const { date, ...restData } = data;
      const updatePayload = {
        ...restData,
        ...(date && { date: new Date(date) }),
        updatedAt: new Date()
      };

      // Update the transaction
      const [updatedTx] = await db
        .update(transactions)
        .set(updatePayload)
        .where(eq(transactions.id, id))
        .returning({
          id: transactions.id,
          date: transactions.date,
          description: transactions.description,
          amount: transactions.amount,
          type: transactions.type,
          categoryId: transactions.categoryId,
          accountId: transactions.accountId,
          updatedAt: transactions.updatedAt,
        });

      // Get the updated transaction with related data
      const result = await db.query.transactions.findFirst({
        where: eq(transactions.id, updatedTx.id),
        with: {
          category: {
            columns: {
              name: true,
              color: true,
            },
          },
          account: {
            columns: {
              name: true,
              color: true,
            },
          },
        },
      });

      return { data: result };
    }),
});