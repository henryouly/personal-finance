import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '@/db/db';
import { accounts } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Define the router
const app = new Hono()
  .get(
    '/',
    zValidator(
      'query',
      z.object({
        // Add any query parameters here if needed
      })
    ),
    async (c) => {
      try {
        // Get all accounts with their balances
        const allAccounts = await db.query.accounts.findMany({
          columns: {
            id: true,
            name: true,
            balance: true,
            type: true,
            color: true,
          },
          orderBy: (accounts, { asc }) => [asc(accounts.name)],
        });

        // Calculate total balance
        const totalBalance = allAccounts.reduce(
          (sum, account) => sum + Number(account.balance),
          0
        );

        return c.json({
          success: true,
          data: {
            accounts: allAccounts,
            total: totalBalance.toFixed(2),
          },
        });
      } catch (error) {
        console.error('Error fetching accounts:', error);
        return c.json(
          { success: false, error: 'Failed to fetch accounts' },
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
        const account = await db.query.accounts.findFirst({
          where: (accounts, { eq }) => eq(accounts.id, id),
          columns: {
            id: true,
            name: true,
            balance: true,
            type: true,
            color: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        if (!account) {
          return c.json(
            { success: false, error: 'Account not found' },
            404
          );
        }

        return c.json({
          success: true,
          data: account,
        });
      } catch (error) {
        console.error(`Error fetching account ${id}:`, error);
        return c.json(
          { success: false, error: 'Failed to fetch account' },
          500
        );
      }
    }
  );

export default app;