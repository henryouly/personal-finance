import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '@/db/db';
import { transactions, accounts, categories } from '@/db/schema';
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';

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
        offset: z.coerce.number().int().min(0).default(0),
        limit: z.coerce.number().int().min(1).max(100).default(10),
      })
    ),
    async (c) => {
      const { accountId, categoryId, startDate, endDate, offset, limit } = c.req.valid('query');

      try {
        // Build the where clause based on query params
        const whereClause = and(
          accountId ? eq(transactions.accountId, accountId) : undefined,
          categoryId ? eq(transactions.categoryId, categoryId) : undefined,
          startDate ? gte(transactions.date, new Date(startDate)) : undefined,
          endDate ? lte(transactions.date, new Date(endDate)) : undefined
        );

        // Get total count for pagination
        // Get total count for pagination
        const totalCountResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(transactions)
          .where(whereClause);
        
        const total = Number(totalCountResult[0].count);
        const totalPages = Math.ceil(total / limit);

        // Get paginated transactions with related data
        const paginatedTransactions = await db.query.transactions.findMany({
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
          offset: offset,
        });

        return c.json({
          success: true,
          data: {
            items: paginatedTransactions,
            pagination: {
              page: Math.floor(offset / limit) + 1,
              pageSize: limit,
              total: total,
              totalPages: totalPages,
              hasNextPage: offset + limit < total,
              hasPreviousPage: offset > 0,
            },
          },
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

  .patch(
    '/:id',
    zValidator(
      'param',
      z.object({
        id: z.string().uuid(),
      })
    ),
    zValidator(
      'json',
      z.object({
        id: z.string().uuid().optional(),
        date: z.string().datetime().or(z.date()),
        description: z.string(),
        amount: z.string(),
        type: z.enum(['income', 'expense']),
        categoryId: z.string().uuid().nullable(),
        accountId: z.string().uuid(),
      }).partial()
    ),
    async (c) => {
      const { id } = c.req.valid('param');
      const updateData = c.req.valid('json');

      try {
        // Check if transaction exists
        const existingTx = await db.query.transactions.findFirst({
          where: eq(transactions.id, id),
        });

        if (!existingTx) {
          return c.json(
            { success: false, error: 'Transaction not found' },
            404
          );
        }

        // Prepare update data with proper types and handle date conversion
        const { date, ...restData } = updateData;
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

        return c.json({
          success: true,
          data: result,
        });
      } catch (error) {
        console.error('Error updating transaction:', error);
        return c.json(
          { success: false, error: 'Failed to update transaction' },
          500
        );
      }
    }
  );

export default app;
