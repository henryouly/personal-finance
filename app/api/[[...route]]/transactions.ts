import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '@/db/db';
import { transactions, accounts, categories } from '@/db/schema';
import { eq, and, desc, gte, lte } from 'drizzle-orm';

// Define the router
const app = new Hono()
  .get(
    '/',
    zValidator(
      'query',
      z.object({
        accountId: z.string().uuid().optional(),
        categoryId: z.string().uuid().optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        limit: z.coerce.number().int().positive().optional(),
      })
    ),
    async (c) => {
      const { accountId, categoryId, startDate, endDate, limit } = c.req.valid('query');

      try {
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

        return c.json({
          success: true,
          data: allTransactions,
        });
      } catch (error) {
        console.error('Error fetching transactions:', error);
        return c.json(
          { success: false, error: 'Failed to fetch transactions' },
          500
        );
      }
    }
  )
  .get(
    '/:id',
    zValidator(
      'param',
      z.object({
        id: z.string().uuid(),
      })
    ),
    async (c) => {
      const { id } = c.req.valid('param');

      try {
        const transaction = await db.query.transactions.findFirst({
          where: eq(transactions.id, id),
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

        if (!transaction) {
          return c.json(
            { success: false, error: 'Transaction not found' },
            404
          );
        }


        return c.json({
          success: true,
          data: transaction,
        });
      } catch (error) {
        console.error('Error fetching transaction:', error);
        return c.json(
          { success: false, error: 'Failed to fetch transaction' },
          500
        );
      }
    }
  )
  .post(
    '/upload',
    zValidator(
      'json',
      z.object({
        transactions: z.array(
          z.object({
            date: z.string().or(z.date()),
            description: z.string(),
            amount: z.string(),
            accountId: z.string().uuid(),
            categoryId: z.string().uuid().optional(),
          })
        ).min(1, 'At least one transaction is required')
      })
    ),
    async (c) => {
      try {
        const { transactions: transactionsToImport } = c.req.valid('json');

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

        return c.json({
          success: true,
          count: results.length,
          transactions: results
        });
      } catch (error) {
        console.error('Error importing transactions:', error);
        return c.json(
          {
            success: false,
            error: 'Failed to import transactions',
            details: error instanceof Error ? error.message : 'Unknown error'
          },
          500
        );
      }
    }
  )

export default app;
