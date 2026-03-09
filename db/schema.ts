import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const accountTypeEnum = ['asset', 'liability', 'equity', 'income', 'expense'] as const;
export type AccountType = (typeof accountTypeEnum)[number];

export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type', { enum: accountTypeEnum }).notNull(),
  color: text('color'),
  icon: text('icon'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  isSystem: integer('is_system', { mode: 'boolean' }).default(false),
});

export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  date: text('date').notNull(), // ISO 8601 string
  description: text('description').notNull(),
  status: text('status', { enum: ['pending', 'cleared', 'reconciled'] }).default('pending'),
  source: text('source', { enum: ['manual', 'csv_import', 'api_sync'] }).default('manual'),
  externalId: text('external_id').unique(),
});

export const journalEntries = sqliteTable('journal_entries', {
  id: text('id').primaryKey(),
  transactionId: text('transaction_id')
    .notNull()
    .references(() => transactions.id, { onDelete: 'cascade' }),
  accountId: text('account_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(), // Signed cents
  memo: text('memo'),
});

export const budgets = sqliteTable('budgets', {
  id: text('id').primaryKey(),
  accountId: text('account_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  limitAmount: integer('limit_amount').notNull(), // Cents
  period: text('period', { enum: ['monthly', 'yearly'] }).notNull(),
  startDate: text('start_date').notNull(), // ISO 8601 string
});
