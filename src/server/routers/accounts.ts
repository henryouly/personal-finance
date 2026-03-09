import { router, publicProcedure } from '../trpc';
import { db } from '../../../db';
import { accounts } from '../../../db/schema';

export const accountsRouter = router({
  list: publicProcedure.query(async () => {
    return await db.select().from(accounts);
  }),
});
