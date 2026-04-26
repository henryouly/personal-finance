import { db } from '../db/index';
import { journalEntries, transactions, accounts } from '../db/schema';

export async function cleanupDatabase() {
  await db.delete(journalEntries);
  await db.delete(transactions);
  await db.delete(accounts);
  console.log('Database cleaned up for test.');
}
