import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { db } from '../../../db';
import { transactions, journalEntries, accounts } from '../../../db/schema';
import { eq, desc, and, gte, lte, like, sql, count, or } from 'drizzle-orm';
import { validateTransaction } from '../../domain/accounting';
import Papa from 'papaparse';

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Dining Out': ['starbucks', 'mcdonalds', 'restaurant', 'cafe', 'pub', 'pizza', 'taco bell', 'burger king'],
  'Groceries': ['walmart', 'costco', 'safeway', 'kroger', 'target', 'trader joe', 'whole foods', 'supermarket'],
  'Software/Services': ['apple', 'google', 'netflix', 'spotify', 'aws', 'github', 'openai', 'microsoft'],
  'Transportation': ['uber', 'lyft', 'gas', 'shell', 'chevron', 'parking', 'transit', 'subway'],
};

async function predictAccountId(description: string) {
  const normalizedInput = description.trim().toLowerCase();
  if (!normalizedInput || normalizedInput.length < 2) return null;

  // 1. History-based match
  const words = normalizedInput.split(/\s+/).filter(w => w.length > 2);
  const historyMatchQuery = db
    .select({
      accountId: journalEntries.accountId,
    })
    .from(transactions)
    .innerJoin(journalEntries, eq(transactions.id, journalEntries.transactionId))
    .innerJoin(accounts, eq(journalEntries.accountId, accounts.id))
    .where(and(
      eq(accounts.type, 'expense'),
      or(
        like(sql`lower(${transactions.description})`, `%${normalizedInput}%`),
        ...words.map(w => like(sql`lower(${transactions.description})`, `%${w}%`))
      )
    ))
    .groupBy(journalEntries.accountId)
    .orderBy(desc(count()))
    .limit(1);

  const [historyMatch] = await historyMatchQuery;
  if (historyMatch) return historyMatch.accountId;

  // 2. Keyword-based "AI" fallback
  for (const [categoryName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(k => normalizedInput.includes(k))) {
      const [account] = await db
        .select({ id: accounts.id })
        .from(accounts)
        .where(and(
          eq(accounts.type, 'expense'),
          like(sql`lower(${accounts.name})`, `%${categoryName.toLowerCase()}%`)
        ))
        .limit(1);

      if (account) return account.id;
    }
  }

  return null;
}

export const transactionsRouter = router({
  predictCategory: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      return await predictAccountId(input);
    }),

  parseCSV: publicProcedure
    .input(z.object({ csvData: z.string() }))
    .query(async ({ input }) => {
      const results = Papa.parse(input.csvData, {
        header: false,
        skipEmptyLines: true,
      });

      const data = results.data as string[][];
      const headers = data[0] || [];
      const rows = data.slice(1, 6); // First 5 rows for preview/mapping

      return { headers, previewRows: rows };
    }),

  previewImport: publicProcedure
    .input(z.object({
      csvData: z.string(),
      mapping: z.object({
        date: z.number(),
        description: z.number(),
        amount: z.number(),
      }),
      targetAccountId: z.string(),
    }))
    .query(async ({ input }) => {
      const results = Papa.parse(input.csvData, {
        header: false,
        skipEmptyLines: true,
      });

      const rawRows = (results.data as string[][]).slice(1); // Skip header row

      const previewRows = await Promise.all(rawRows.map(async (row) => {
        try {
          const date = row[input.mapping.date];
          const description = row[input.mapping.description] || 'Unknown';
          const rawAmount = row[input.mapping.amount] || '0';

          // Basic amount cleaning (strip currency symbols and commas)
          const amountCents = Math.round(parseFloat(rawAmount.replace(/[$,]/g, '')) * 100);

          // Predict category
          const suggestedAccountId = await predictAccountId(description);

          // Duplicate detection
          let isDuplicate = false;
          if (date && !isNaN(Date.parse(date))) {
            const [duplicate] = await db
              .select({ id: transactions.id })
              .from(transactions)
              .innerJoin(journalEntries, eq(transactions.id, journalEntries.transactionId))
              .where(and(
                eq(journalEntries.accountId, input.targetAccountId),
                eq(journalEntries.amount, -amountCents),
                gte(transactions.date, sql`date(${date}, '-3 days')`),
                lte(transactions.date, sql`date(${date}, '+3 days')`),
                like(sql`lower(${transactions.description})`, `%${description.trim().toLowerCase()}%`)
              ))
              .limit(1);
            isDuplicate = !!duplicate;
          }

          return {
            date,
            description,
            amountCents,
            suggestedAccountId,
            isDuplicate,
          };
        } catch (err) {
          console.error('Error processing row:', err);
          return {
            date: 'Error',
            description: 'Error',
            amountCents: 0,
            suggestedAccountId: null,
            isDuplicate: false,
          };
        }
      }));

      console.log('Backend previewImport returning rows:', previewRows.length);
      return previewRows;
    }),

  bulkCreate: publicProcedure
    .input(z.object({
      targetAccountId: z.string(),
      transactions: z.array(z.object({
        date: z.string(),
        description: z.string(),
        amountCents: z.number().int(),
        accountId: z.string(),
      })),
    }))
    .mutation(async ({ input }) => {
      await db.transaction(async (tx) => {
        for (const item of input.transactions) {
          // Simple date normalization
          let normalizedDate = item.date;
          if (normalizedDate.includes('/')) {
            const parts = normalizedDate.split('/');
            if (parts.length === 3) {
              // Assume MM/DD/YYYY or similar
              const [m, d, y] = parts;
              normalizedDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            }
          }

          const txId = crypto.randomUUID();
          await tx.insert(transactions).values({
            id: txId,
            date: normalizedDate,
            description: item.description,
            source: 'csv_import',
          });

          await tx.insert(journalEntries).values([
            {
              id: crypto.randomUUID(),
              transactionId: txId,
              accountId: input.targetAccountId,
              amount: item.amountCents, // e.g. -700 for expense
            },
            {
              id: crypto.randomUUID(),
              transactionId: txId,
              accountId: item.accountId,
              amount: -item.amountCents, // e.g. 700 for expense
            }
          ]);

        }
      });
      return true;
    }),

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
