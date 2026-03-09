import { describe, it, expect } from 'vitest';
import { validateTransaction, AccountingError, calculateBalance } from './accounting';

describe('Accounting Core (Double-Entry Logic)', () => {
  it('T1: should accept a balanced transaction (sum = 0)', () => {
    const entries = [
      { accountId: 'acc1', amount: 5000 }, // Debit +$50.00
      { accountId: 'acc2', amount: -5000 }, // Credit -$50.00
    ];
    expect(validateTransaction(entries)).toBe(true);
  });

  it('T1: should throw error for unbalanced transaction (sum ≠ 0)', () => {
    const entries = [
      { accountId: 'acc1', amount: 5000 },
      { accountId: 'acc2', amount: -4000 },
    ];
    expect(() => validateTransaction(entries)).toThrow(AccountingError);
    expect(() => validateTransaction(entries)).toThrow('Transaction is not balanced');
  });

  it('T1: should throw error for single entry transaction', () => {
    const entries = [{ accountId: 'acc1', amount: 5000 }];
    expect(() => validateTransaction(entries)).toThrow('at least two journal entries');
  });

  it('T2: should correctly calculate account balance from entries', () => {
    const entries = [
      { accountId: 'acc1', amount: 5000 },
      { accountId: 'acc1', amount: -2000 },
      { accountId: 'acc1', amount: 3500 },
    ];
    expect(calculateBalance(entries)).toBe(6500);
  });
});
