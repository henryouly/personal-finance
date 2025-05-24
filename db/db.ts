import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, {
  schema,
  logger: process.env.NODE_ENV === 'development',
});

// Utility function to convert account balance from string to number
export function parseAccountBalances<T extends { balance: string | number }>(
  accounts: T[]
): (Omit<T, 'balance'> & { balance: number })[] {
  return accounts.map(account => ({
    ...account,
    balance: typeof account.balance === 'string'
      ? parseFloat(account.balance)
      : account.balance
  } as Omit<T, 'balance'> & { balance: number }));
}
