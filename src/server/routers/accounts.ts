import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { db } from '../../../db';
import { accounts, journalEntries } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export const accountsRouter = router({
  list: publicProcedure
    .input(z.object({ 
      classification: z.enum(['asset', 'liability', 'equity', 'income', 'expense']).optional() 
    }).optional())
    .query(async ({ input }) => {
      if (input?.classification) {
        return await db.select().from(accounts).where(eq(accounts.type, input.classification));
      }
      return await db.select().from(accounts);
    }),
  get: publicProcedure.input(z.string()).query(async ({ input }) => {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, input));
    return account;
  }),
  create: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      type: z.enum(['asset', 'liability', 'equity', 'income', 'expense']),
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
      color: z.string().optional(),
      icon: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.update(accounts).set(data).where(eq(accounts.id, id));
    }),
  delete: publicProcedure.input(z.string()).mutation(async ({ input }) => {
    // Check for existing journal entries (soft-delete logic)
    const [entry] = await db.select().from(journalEntries).where(eq(journalEntries.accountId, input)).limit(1);
    if (entry) {
      await db.update(accounts).set({ isActive: false }).where(eq(accounts.id, input));
    } else {
      await db.delete(accounts).where(eq(accounts.id, input));
    }
  }),
});
