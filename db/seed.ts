import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq } from 'drizzle-orm';
import { Pool } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import {
  categories,
  accounts,
  budgets,
  transactions,
  type NewCategory,
  type NewAccount,
  type NewBudget,
  type NewTransaction,
} from './schema';
import { sampleBudgets } from '../data/sampleData';
import { sampleCategories, sampleAccounts, sampleTransactions } from './sampleData';

// Load environment variables
dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data (be careful with this in production!)
    console.log('🧹 Clearing existing data...');
    await db.delete(transactions);
    await db.delete(budgets);
    await db.delete(accounts);
    await db.delete(categories);

    // Insert categories
    console.log('📝 Inserting categories...');
    const categoryMap = new Map<string, string>();
    for (const category of sampleCategories) {
      const newCategory: NewCategory = {
        name: category.name,
        color: category.color,
        icon: category.icon,
      };
      const [inserted] = await db.insert(categories).values(newCategory).returning();
      categoryMap.set(category.name, inserted.id);
    }

    // Insert accounts
    console.log('💳 Inserting accounts...');
    const accountMap = new Map<string, string>();
    for (const account of sampleAccounts) {
      const newAccount: NewAccount = {
        name: account.name,
        balance: account.balance.toString(),
        type: account.type,
        color: account.color,
      };
      const [inserted] = await db.insert(accounts).values(newAccount).returning();
      accountMap.set(account.name, inserted.id);
    }

    // Insert budgets
    console.log('💰 Inserting budgets...');
    for (const budget of sampleBudgets) {
      const categoryId = categoryMap.get(budget.category);
      if (!categoryId) {
        console.warn(`Category ${budget.category} not found, skipping budget`);
        continue;
      }

      const newBudget: NewBudget = {
        categoryId,
        amount: budget.amount.toString(),
        spent: budget.spent.toString(),
        period: budget.period as 'monthly' | 'yearly',
      };
      await db.insert(budgets).values(newBudget);
    }

    // Insert transactions
    console.log('💸 Inserting transactions...');
    for (const tx of sampleTransactions) {
      const categoryId = tx.category ? categoryMap.get(tx.category) : null;
      const accountId = accountMap.get(tx.account);

      if (!accountId) {
        console.warn(`Account ${tx.account} not found, skipping transaction: ${tx.description}`);
        continue;
      }

      const newTx: NewTransaction = {
        date: new Date(tx.date),
        description: tx.description,
        amount: tx.amount.toString(),
        type: tx.type as 'income' | 'expense',
        categoryId: categoryId || null,
        accountId,
      };
      await db.insert(transactions).values(newTx);
    }

    console.log('✅ Database seeded successfully!');
    console.log(`   Categories: ${sampleCategories.length}`);
    console.log(`   Accounts: ${sampleAccounts.length}`);
    console.log(`   Budgets: ${sampleBudgets.length}`);
    console.log(`   Transactions: ${sampleTransactions.length}`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

seedDatabase();
