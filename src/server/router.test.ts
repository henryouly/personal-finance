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
});
