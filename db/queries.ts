import { and, eq, gte, lte, sql, sum } from 'drizzle-orm';
import { db } from './db';
import {
  accounts,
  budgets,
  categories,
  transactions,
  type Account,
  type Budget,
  type Category,
  type Transaction,
} from './schema';

// Categories
export async function getAllCategories(): Promise<Category[]> {
  return db.query.categories.findMany({
    orderBy: (categories, { asc }) => [asc(categories.name)],
  });
}

export async function getCategoryById(id: string): Promise<Category> {
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);
  return category;
}

// Accounts
export async function getAllAccounts(): Promise<Account[]> {
  return db.query.accounts.findMany({
    orderBy: (accounts, { asc }) => [asc(accounts.name)],
  });
}

export async function getAccountById(id: string): Promise<Account> {
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
    throw new Error('Account not found');
  }
  return account;
}

export async function getAccountBalance(accountId: string): Promise<string> {
  const [result] = await db
    .select({ balance: accounts.balance })
    .from(accounts)
    .where(eq(accounts.id, accountId));
  return result?.balance || '0';
}

// Budgets
export async function getAllBudgets(period: 'monthly' | 'yearly' = 'monthly'): Promise<Budget[]> {
  return db.query.budgets.findMany({
    with: {
      category: true,
    },
    where: (budgets, { eq }) => eq(budgets.period, period),
  });
}

export async function getBudgetByCategoryId(
  categoryId: string,
  period: 'monthly' | 'yearly' = 'monthly'
): Promise<Budget> {
  const [budget] = await db
    .select()
    .from(budgets)
    .where(
      and(
        eq(budgets.categoryId, categoryId),
        eq(budgets.period, period)
      )
    )
    .limit(1);
  return budget;
}

// Transactions
export async function getRecentTransactions(limit = 10): Promise<Transaction[]> {
  return db.query.transactions.findMany({
    with: {
      category: true,
      account: true,
    },
    orderBy: (transactions, { desc }) => [desc(transactions.date)],
    limit,
  });
}

export async function getTransactionsByAccountId(accountId: string): Promise<Transaction[]> {
  return db.query.transactions.findMany({
    with: {
      category: true,
      account: true,
    },
    where: eq(transactions.accountId, accountId),
    orderBy: (transactions, { desc }) => [desc(transactions.date)],
  });
}

export async function getTransactionsByCategoryId(categoryId: string): Promise<Transaction[]> {
  return db.query.transactions.findMany({
    with: {
      category: true,
      account: true,
    },
    where: eq(transactions.categoryId, categoryId),
    orderBy: (transactions, { desc }) => [desc(transactions.date)],
  });
}

export async function getTransactionsByDateRange(
  startDate: Date,
  endDate: Date
): Promise<Transaction[]> {
  return db.query.transactions.findMany({
    with: {
      category: true,
      account: true,
    },
    where: and(
      gte(transactions.date, startDate),
      lte(transactions.date, endDate)
    ),
    orderBy: (transactions, { desc }) => [desc(transactions.date)],
  });
}

// Analytics
export async function getCategorySpending(
  startDate: Date,
  endDate: Date
): Promise<{ category: string; total: number }[]> {
  return db
    .select({
      category: categories.name,
      total: sum(transactions.amount).mapWith(Number),
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .where(
      and(
        eq(transactions.type, 'expense'),
        gte(transactions.date, startDate),
        lte(transactions.date, endDate)
      )
    )
    .groupBy(categories.name);
}

export interface IncomeVsExpenseData {
  type: 'income' | 'expense';
  total: number;
  month: string;
}

export async function getIncomeVsExpense(
  startDate: Date,
  endDate: Date
): Promise<IncomeVsExpenseData[]> {
  const result = await db
    .select({
      type: sql<string>`${transactions.type}`.as('type'),
      total: sum(transactions.amount).mapWith(Number),
      month: sql<string>`to_char(${transactions.date}, 'YYYY-MM')`.as('month'),
    })
    .from(transactions)
    .where(
      and(
        gte(transactions.date, startDate),
        lte(transactions.date, endDate),
        sql`${transactions.type} IN ('income', 'expense')`
      )
    )
    .groupBy(
      sql`to_char(${transactions.date}, 'YYYY-MM')`,
      transactions.type
    )
    .orderBy(sql`to_char(${transactions.date}, 'YYYY-MM')`);

  // Map the result to the expected type
  return result.map(row => ({
    type: row.type as 'income' | 'expense',
    total: row.total,
    month: row.month,
  }));
}

export async function getMonthlySpending(
  startDate: Date,
  endDate: Date
): Promise<{ month: string; total: number }[]> {
  return db
    .select({
      month: sql<string>`to_char(${transactions.date}, 'YYYY-MM')`.as('month'),
      total: sum(transactions.amount).mapWith(Number),
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.type, 'expense'),
        gte(transactions.date, startDate),
        lte(transactions.date, endDate)
      )
    )
    .groupBy(sql`to_char(${transactions.date}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${transactions.date}, 'YYYY-MM')`);
}
