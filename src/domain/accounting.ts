export interface JournalEntry {
  accountId: string;
  amount: number; // in cents
}

export class AccountingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AccountingError';
  }
}

export function validateTransaction(entries: JournalEntry[]) {
  if (entries.length < 2) {
    throw new AccountingError('A transaction must have at least two journal entries.');
  }

  const sum = entries.reduce((acc, entry) => acc + entry.amount, 0);
  if (sum !== 0) {
    throw new AccountingError(`Transaction is not balanced. Sum of entries is ${sum}, must be 0.`);
  }

  return true;
}

export function calculateBalance(entries: JournalEntry[]) {
  return entries.reduce((acc, entry) => acc + entry.amount, 0);
}

export function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
}
