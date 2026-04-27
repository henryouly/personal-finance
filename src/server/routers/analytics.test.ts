import { describe, it, expect, beforeEach } from 'vitest';
import app from '../index';
import { db } from '../../../db';
import { accounts, transactions, journalEntries } from '../../../db/schema';
import { format, subMonths, startOfMonth } from 'date-fns';

describe('Analytics Router', () => {
  beforeEach(async () => {
    // Clean up
    await db.delete(journalEntries);
    await db.delete(transactions);
    await db.delete(accounts);
  });

  it('should return pivoted monthly income vs expense data', async () => {
    const incomeAccId = crypto.randomUUID();
    const expenseAccId = crypto.randomUUID();
    const assetAccId = crypto.randomUUID();

    await db.insert(accounts).values([
      { id: incomeAccId, name: 'Salary', type: 'income' },
      { id: expenseAccId, name: 'Rent', type: 'expense' },
      { id: assetAccId, name: 'Checking', type: 'asset' },
    ]);

    const currentMonth = format(new Date(), 'yyyy-MM');
    const lastMonth = format(subMonths(new Date(), 1), 'yyyy-MM');

    // Salary: Income (Credit -5000), Asset (Debit +5000)
    const tx1Id = crypto.randomUUID();
    await db.insert(transactions).values({ id: tx1Id, date: format(new Date(), 'yyyy-MM-dd'), description: 'Salary' });
    await db.insert(journalEntries).values([
      { id: crypto.randomUUID(), transactionId: tx1Id, accountId: incomeAccId, amount: -500000 },
      { id: crypto.randomUUID(), transactionId: tx1Id, accountId: assetAccId, amount: 500000 },
    ]);

    // Rent: Expense (Debit +2000), Asset (Credit -2000)
    const tx2Id = crypto.randomUUID();
    await db.insert(transactions).values({ id: tx2Id, date: format(new Date(), 'yyyy-MM-dd'), description: 'Rent' });
    await db.insert(journalEntries).values([
      { id: crypto.randomUUID(), transactionId: tx2Id, accountId: expenseAccId, amount: 200000 },
      { id: crypto.randomUUID(), transactionId: tx2Id, accountId: assetAccId, amount: -200000 },
    ]);

    const res = await app.request('/trpc/analytics.monthlyIncomeVsExpense?batch=1&input={"0":{"months":3}}');
    const json = await res.json();
    const data = json[0].result.data;

    const currentMonthData = data.find((d: any) => d.month === currentMonth);
    expect(currentMonthData.income).toBe(500000);
    expect(currentMonthData.expense).toBe(200000);
  });

  it('should handle refunds and boundary dates correctly', async () => {
    const incomeAccId = crypto.randomUUID();
    const expenseAccId = crypto.randomUUID();
    const assetAccId = crypto.randomUUID();

    await db.insert(accounts).values([
      { id: incomeAccId, name: 'Salary', type: 'income' },
      { id: expenseAccId, name: 'Rent', type: 'expense' },
      { id: assetAccId, name: 'Checking', type: 'asset' },
    ]);

    // 1. Refund: Negative expense should reduce total expense
    const tx1Id = crypto.randomUUID();
    await db.insert(transactions).values({ id: tx1Id, date: format(new Date(), 'yyyy-MM-dd'), description: 'Rent Refund' });
    await db.insert(journalEntries).values([
      { id: crypto.randomUUID(), transactionId: tx1Id, accountId: expenseAccId, amount: -10000 },
      { id: crypto.randomUUID(), transactionId: tx1Id, accountId: assetAccId, amount: 10000 },
    ]);

    const res = await app.request('/trpc/analytics.monthlyIncomeVsExpense?batch=1&input={"0":{"months":1}}');
    const json = await res.json();
    const data = json[0].result.data;

    const currentMonthData = data.find((d: any) => d.month === format(new Date(), 'yyyy-MM'));
    expect(currentMonthData.expense).toBe(10000); // Absolute value for reporting
  });

  it('should calculate net worth history correctly', async () => {
    const assetAccId = crypto.randomUUID();
    const liabilityAccId = crypto.randomUUID();
    const incomeAccId = crypto.randomUUID();

    await db.insert(accounts).values([
      { id: assetAccId, name: 'Bank', type: 'asset' },
      { id: liabilityAccId, name: 'Loan', type: 'liability' },
      { id: incomeAccId, name: 'Salary', type: 'income' },
    ]);

    // 1. Transaction 2 months ago (Initial Balance)
    const twoMonthsAgo = format(subMonths(new Date(), 2), 'yyyy-MM-dd');
    const tx1Id = crypto.randomUUID();
    await db.insert(transactions).values({ id: tx1Id, date: twoMonthsAgo, description: 'Initial' });
    await db.insert(journalEntries).values([
      { id: crypto.randomUUID(), transactionId: tx1Id, accountId: assetAccId, amount: 100000 }, // +$1000
      { id: crypto.randomUUID(), transactionId: tx1Id, accountId: incomeAccId, amount: -100000 },
    ]);

    // 2. Transaction last month
    const lastMonth = format(subMonths(new Date(), 1), 'yyyy-MM-dd');
    const tx2Id = crypto.randomUUID();
    await db.insert(transactions).values({ id: tx2Id, date: lastMonth, description: 'Loan' });
    await db.insert(journalEntries).values([
      { id: crypto.randomUUID(), transactionId: tx2Id, accountId: assetAccId, amount: 50000 },  // +$500
      { id: crypto.randomUUID(), transactionId: tx2Id, accountId: liabilityAccId, amount: -50000 }, // -$500 (Credit = increase liability)
    ]);

    // 3. Query last 2 months
    const res = await app.request('/trpc/analytics.netWorthHistory?batch=1&input={"0":{"months":2}}');
    const json = await res.json();
    const data = json[0].result.data;

    expect(data).toHaveLength(2);

    // Oldest month in the 2-month window (last month)
    // Starting balance should include tx1 (+$1000)
    // Month 1 change (tx2): asset +$500, liability +$500 (Credit)
    // Assets = 1000 (start) + 500 = 1500
    // Liabilities = 0 (start) + 500 = 500
    // Net Worth = 1500 - 500 = 1000
    const m1 = data[0];
    expect(m1.assets).toBe(150000);
    expect(m1.liabilities).toBe(50000);
    expect(m1.netWorth).toBe(100000);

    // Current month (no changes)
    const m2 = data[1];
    expect(m2.netWorth).toBe(100000);
  });
});
