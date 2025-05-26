import { Hono } from 'hono';
import { db } from '@/db/db';
import { categories } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Define the router
const app = new Hono()
  .get(
    '/',
    async (c) => {
      try {
        // Get all categories
        const allCategories = await db.query.categories.findMany({
          columns: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
          orderBy: (categories, { asc }) => [asc(categories.name)],
        });

        return c.json({
          success: true,
          data: allCategories,
        });
      } catch (error) {
        console.error('Error fetching categories:', error);
        return c.json(
          { success: false, error: 'Failed to fetch categories' },
          500
        );
      }
    }
  );

export default app;
