import { Category, Transaction, Account } from '@/types';

export const sampleCategories: Category[] = [
  { id: '1', name: 'Housing', color: '#3b82f6', icon: 'home' },
  { id: '2', name: 'Transportation', color: '#ef4444', icon: 'car' },
  { id: '3', name: 'Food', color: '#10b981', icon: 'utensils' },
  { id: '4', name: 'Utilities', color: '#f59e0b', icon: 'bolt' },
  { id: '5', name: 'Entertainment', color: '#8b5cf6', icon: 'film' },
  { id: '6', name: 'Healthcare', color: '#ec4899', icon: 'heart-pulse' },
  { id: '7', name: 'Shopping', color: '#f97316', icon: 'shopping-bag' },
  { id: '8', name: 'Personal', color: '#06b6d4', icon: 'user' },
  { id: '9', name: 'Education', color: '#14b8a6', icon: 'graduation-cap' },
  { id: '10', name: 'Travel', color: '#6366f1', icon: 'plane' },
];

export const sampleAccounts: Account[] = [
  { id: '1', name: 'Chase Checking', balance: 12500, type: 'checking', color: '#1e40af' },
  { id: '2', name: 'Ally Savings', balance: 35000, type: 'savings', color: '#065f46' },
  { id: '3', name: 'Chase Sapphire', balance: -1250, type: 'credit', color: '#1e40af' },
  { id: '4', name: 'Fidelity Investments', balance: 85000, type: 'investment', color: '#7e22ce' },
];

const getRandomAmount = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const getRandomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const descriptions = {
  income: [
    'Salary',
    'Freelance Work',
    'Investment Dividends',
    'Bonus',
    'Tax Refund',
    'Side Hustle',
    'Royalties',
    'Rental Income',
  ],
  expense: [
    'Grocery Store',
    'Restaurant',
    'Gas Station',
    'Amazon',
    'Target',
    'Electric Bill',
    'Internet Bill',
    'Phone Bill',
    'Netflix',
    'Spotify',
    'Gym Membership',
    'Doctor Visit',
    'Pharmacy',
    'Clothing Store',
    'Home Depot',
    'Uber',
    'Airbnb',
    'Flight Tickets',
    'Hotel',
    'Online Course',
  ],
};

export const generateTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const startDate = new Date('2024-01-01');
  const endDate = new Date('2025-05-25');
  const categories = sampleCategories.map(c => c.name);
  const accounts = sampleAccounts.map(a => a.name);

  // Generate income transactions (2-4 per month)
  let id = 1;
  for (let month = 0; month < 17; month++) {
    const monthDate = new Date(2024, 0 + month, 1);
    if (monthDate > endDate) break;

    const numIncomes = getRandomAmount(2, 4);
    for (let i = 0; i < numIncomes; i++) {
      const date = new Date(2024, 0 + month, getRandomAmount(1, 28));
      if (date > endDate) continue;

      transactions.push({
        id: (id++).toString(),
        date: date.toISOString().split('T')[0],
        description: descriptions.income[Math.floor(Math.random() * descriptions.income.length)],
        amount: getRandomAmount(800, 5000),
        category: 'Income',
        type: 'income',
        account: accounts[0], // Primary checking account
      });
    }
  }

  // Generate expense transactions (30-50 per month)
  for (let month = 0; month < 17; month++) {
    const monthDate = new Date(2024, 0 + month, 1);
    if (monthDate > endDate) break;

    const numExpenses = getRandomAmount(30, 50);
    for (let i = 0; i < numExpenses; i++) {
      const date = new Date(2024, 0 + month, getRandomAmount(1, 28));
      if (date > endDate) continue;

      const category = categories[Math.floor(Math.random() * categories.length)];
      let amount = 0;

      // Set realistic amounts based on category
      switch (category) {
        case 'Housing':
          amount = getRandomAmount(1500, 2500);
          break;
        case 'Transportation':
          amount = getRandomAmount(20, 150);
          break;
        case 'Food':
          amount = getRandomAmount(10, 100);
          break;
        case 'Utilities':
          amount = getRandomAmount(50, 200);
          break;
        case 'Entertainment':
          amount = getRandomAmount(10, 100);
          break;
        case 'Healthcare':
          amount = getRandomAmount(20, 500);
          break;
        case 'Shopping':
          amount = getRandomAmount(20, 300);
          break;
        case 'Personal':
          amount = getRandomAmount(10, 100);
          break;
        case 'Education':
          amount = getRandomAmount(50, 500);
          break;
        case 'Travel':
          amount = getRandomAmount(100, 2000);
          break;
        default:
          amount = getRandomAmount(10, 200);
      }

      transactions.push({
        id: (id++).toString(),
        date: date.toISOString().split('T')[0],
        description: descriptions.expense[Math.floor(Math.random() * descriptions.expense.length)],
        amount: amount,
        category: category,
        type: 'expense',
        account: accounts[Math.floor(Math.random() * 3)], // Random account (excluding investment)
      });
    }
  }

  // Add some investment transactions
  for (let i = 0; i < 24; i++) {
    const date = getRandomDate(new Date('2024-01-01'), endDate);
    transactions.push({
      id: (id++).toString(),
      date: date.toISOString().split('T')[0],
      description: 'Investment Return',
      amount: getRandomAmount(100, 2000),
      category: 'Investment',
      type: 'income',
      account: accounts[3], // Investment account
    });
  }

  // Sort transactions by date
  return transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const sampleTransactions = generateTransactions();