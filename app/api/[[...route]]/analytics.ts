import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { getCategorySpending } from '@/db/queries';

const app = new Hono()
  .get(
    '/category-spending',
    zValidator(
      'query',
      z.object({
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
      })
    ),
    async (c) => {
      const { startDate, endDate } = c.req.valid('query');

      try {
        const now = new Date();
        const defaultStartDate = new Date(now.getFullYear() - 5, now.getMonth(), 1); // Last 6 months by default

        const result = await getCategorySpending(
          startDate ? new Date(startDate) : defaultStartDate,
          endDate ? new Date(endDate) : now
        );

        return c.json({ data: result });
      } catch (error) {
        console.error('Error fetching category spending:', error);
        return c.json({ error: 'Failed to fetch category spending' }, 500);
      }
    }
  );

export default app;
