import { db } from './index';
import { accounts } from './schema';

async function seed() {
  console.log('Seeding initial categories...');

  const initialAccounts = [
    { id: crypto.randomUUID(), name: 'Chase Checking', type: 'asset' as const, color: '#3b82f6' },
    { id: crypto.randomUUID(), name: 'AMEX Gold', type: 'liability' as const, color: '#f59e0b' },
    { id: crypto.randomUUID(), name: 'Salary', type: 'income' as const, color: '#10b981' },
    { id: crypto.randomUUID(), name: 'Groceries', type: 'expense' as const, color: '#10b981' },
    { id: crypto.randomUUID(), name: 'Rent', type: 'expense' as const, color: '#ef4444' },
    { id: crypto.randomUUID(), name: 'Entertainment', type: 'expense' as const, color: '#8b5cf6' },
    { id: crypto.randomUUID(), name: 'Utilities', type: 'expense' as const, color: '#3b82f6' },
  ];

  for (const account of initialAccounts) {
    await db.insert(accounts).values(account);
  }

  console.log('Seed complete.');
}

seed().catch(console.error);
