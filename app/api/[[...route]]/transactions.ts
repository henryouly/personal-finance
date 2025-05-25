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
  );

export default app;
