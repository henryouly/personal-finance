import { describe, it, expect } from 'vitest';
import app from './index';
import { db } from '../../db';
import { accounts } from '../../db/schema';

describe('tRPC Router Integration', () => {
  it('should return an empty list of accounts initially', async () => {
    // Clear the db first for consistent results
    await db.delete(accounts);
    
    const res = await app.request('/trpc/accounts.list');
    expect(res.status).toBe(200);
    const json = await res.json();
    // For single query, tRPC returns result object directly
    expect(json.result.data).toEqual([]);
  });

  it('should return a list of accounts after adding one', async () => {
    const id = crypto.randomUUID();
    await db.insert(accounts).values({
      id,
      name: 'Test Account',
      type: 'asset',
    });

    const res = await app.request('/trpc/accounts.list');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.result.data).toContainEqual(
      expect.objectContaining({ id, name: 'Test Account' })
    );
  });

  it('should create, update, and delete a transaction', async () => {
    // 1. Setup accounts
    const accountA = crypto.randomUUID();
    const accountB = crypto.randomUUID();
    await db.insert(accounts).values([
      { id: accountA, name: 'Checking', type: 'asset' },
      { id: accountB, name: 'Groceries', type: 'expense' },
    ]);

    // 2. Create transaction
    const createRes = await app.request('/trpc/transactions.create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: '2026-04-26',
        description: 'Initial Tx',
        entries: [
          { accountId: accountA, amount: -1000 },
          { accountId: accountB, amount: 1000 },
        ]
      })
    });
    expect(createRes.status).toBe(200);
    const txId = (await createRes.json()).result.data;

    // 3. Update transaction
    const updateRes = await app.request('/trpc/transactions.update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: txId,
        date: '2026-04-27',
        description: 'Updated Tx',
        entries: [
          { accountId: accountA, amount: -2000 },
          { accountId: accountB, amount: 2000 },
        ]
      })
    });
    expect(updateRes.status).toBe(200);

    // 4. Verify update
    const listRes = await app.request('/trpc/transactions.list');
    const listJson = await listRes.json();
    const updatedTx = listJson.result.data.find((t: any) => t.id === txId);
    expect(updatedTx.description).toBe('Updated Tx');
    expect(updatedTx.date).toBe('2026-04-27');
    expect(updatedTx.entries).toHaveLength(2);
    expect(updatedTx.entries.find((e: any) => e.accountId === accountA).amount).toBe(-2000);

    // 5. Delete transaction
    const deleteRes = await app.request('/trpc/transactions.delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(txId)
    });
    expect(deleteRes.status).toBe(200);

    // 6. Verify deletion
    const finalRes = await app.request('/trpc/transactions.list');
    const finalJson = await finalRes.json();
    expect(finalJson.result.data.find((t: any) => t.id === txId)).toBeUndefined();
  });
});
