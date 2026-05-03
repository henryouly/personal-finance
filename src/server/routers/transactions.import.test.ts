import { describe, it, expect, beforeEach } from 'vitest';
import app from '../index';
import { db } from '../../../db';
import { accounts, transactions, journalEntries } from '../../../db/schema';

describe('Transactions Router - CSV Import', () => {
  beforeEach(async () => {
    await db.delete(journalEntries);
    await db.delete(transactions);
    await db.delete(accounts);
  });

  it('should parse CSV headers and preview rows', async () => {
    const csvData = "Date,Description,Amount\n2026-01-01,Starbucks,5.50\n2026-01-02,Rent,1200.00";
    const res = await app.request('/trpc/transactions.parseCSV?batch=1&input={"0":{"csvData":"' + csvData.replace(/\n/g, "\\n") + '"}}');
    expect(res.status).toBe(200);
    const json = await res.json();
    const data = json[0].result.data;

    expect(data.headers).toEqual(["Date", "Description", "Amount"]);
    expect(data.previewRows).toHaveLength(2);
    expect(data.previewRows[0]).toEqual(["2026-01-01", "Starbucks", "5.50"]);
  });

  it('should preview import with mapping and detect duplicates', async () => {
    // 1. Setup
    const checkingId = crypto.randomUUID();
    const starbucksId = crypto.randomUUID();
    await db.insert(accounts).values([
      { id: checkingId, name: 'Checking', type: 'asset' },
      { id: starbucksId, name: 'Dining Out', type: 'expense' },
    ]);

    // 2. Add existing transaction to trigger duplicate detection
    const existingTxId = crypto.randomUUID();
    const date = '2026-01-01';
    await db.insert(transactions).values({ id: existingTxId, date, description: 'Starbucks' });
    await db.insert(journalEntries).values([
      { id: crypto.randomUUID(), transactionId: existingTxId, accountId: checkingId, amount: -550 },
      { id: crypto.randomUUID(), transactionId: existingTxId, accountId: starbucksId, amount: 550 },
    ]);

    // 3. Preview
    const csvData = "Date,Payee,Value\n2026-01-01,Starbucks,5.50\n2026-01-02,New Place,10.00";
    const input = {
      csvData,
      mapping: { date: 0, description: 1, amount: 2 },
      targetAccountId: checkingId
    };

    const res = await app.request('/trpc/transactions.previewImport?batch=1&input={"0":' + JSON.stringify(input) + '}');
    expect(res.status).toBe(200);
    const json = await res.json();
    const data = json[0].result.data;

    expect(data).toHaveLength(2);
    expect(data[0].description).toBe('Starbucks');
    expect(data[0].isDuplicate).toBe(true);
    expect(data[0].suggestedAccountId).toBe(starbucksId);

    expect(data[1].description).toBe('New Place');
    expect(data[1].isDuplicate).toBe(false);
  });

  it('should bulk create transactions', async () => {
    const checkingId = crypto.randomUUID();
    const foodId = crypto.randomUUID();
    await db.insert(accounts).values([
      { id: checkingId, name: 'Checking', type: 'asset' },
      { id: foodId, name: 'Food', type: 'expense' },
    ]);

    const input = {
      targetAccountId: checkingId,
      transactions: [
        { date: '2026-01-01', description: 'Item 1', amountCents: 1000, accountId: foodId },
        { date: '2026-01-02', description: 'Item 2', amountCents: 2000, accountId: foodId },
      ]
    };

    const res = await app.request('/trpc/transactions.bulkCreate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    expect(res.status).toBe(200);

    const listRes = await app.request('/trpc/transactions.list');
    const listData = (await listRes.json()).result.data;
    expect(listData).toHaveLength(2);
    expect(listData[0].source).toBe('csv_import');
  });

  it('should handle the specific problematic CSV content', async () => {
    const checkingId = crypto.randomUUID();
    await db.insert(accounts).values({ id: checkingId, name: 'Checking', type: 'asset' });

    const csvData = `"Date","Transaction","Name","Memo","Amount"
"2026-05-01","DEBIT","SQ *RODRIGUES STRAWBER Saratoga      CA","24692166120405004523203; 05499; ; ; ;","-7.00"
"2026-05-01","DEBIT","ORDER.MEALKEYWAY.COM   ORDER.MEALKEY CA","24000776120100036277414; 05812; ; ; ;","-26.40"`;

    const input = {
      csvData,
      mapping: { date: 0, description: 2, amount: 4 },
      targetAccountId: checkingId
    };

    const res = await app.request('/trpc/transactions.previewImport?batch=1&input={"0":' + JSON.stringify(input) + '}');
    expect(res.status).toBe(200);
    const json = await res.json();
    const data = json[0].result.data;

    expect(data).toHaveLength(2);
    expect(data[0].amountCents).toBe(-700);
    expect(data[0].description).toBe("SQ *RODRIGUES STRAWBER Saratoga      CA");
  });
});
