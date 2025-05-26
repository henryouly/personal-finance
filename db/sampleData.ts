import { Transaction, Category, Account, Budget } from '@/types';

export const sampleCategories: Category[] = [
  { id: '1', name: 'Housing', color: '#FF5733', icon: 'home' },
  { id: '2', name: 'Transportation', color: '#33A8FF', icon: 'car' },
  { id: '3', name: 'Food', color: '#33FF57', icon: 'utensils' },
  { id: '4', name: 'Utilities', color: '#F033FF', icon: 'bolt' },
  { id: '5', name: 'Entertainment', color: '#FF33A8', icon: 'film' },
  { id: '6', name: 'Healthcare', color: '#33FFF0', icon: 'medkit' },
  { id: '7', name: 'Shopping', color: '#A833FF', icon: 'shopping-bag' },
  { id: '8', name: 'Personal', color: '#FFC133', icon: 'user' },
  { id: '9', name: 'Salary', color: '#33FF33', icon: 'money-bill' },
  { id: '10', name: 'Investments', color: '#3357FF', icon: 'chart-line' },
];

export const sampleAccounts: Account[] = [
  { id: '1', name: 'Main Checking', balance: 5240.23, type: 'checking', color: '#4CAF50' },
  { id: '2', name: 'Savings', balance: 12750.87, type: 'savings', color: '#2196F3' },
  { id: '3', name: 'Credit Card', balance: -1240.56, type: 'credit', color: '#F44336' },
  { id: '4', name: 'Investment Account', balance: 34567.89, type: 'investment', color: '#9C27B0' },
];

export const sampleTransactions: Transaction[] = [
  // January 2025
  {
    id: 'jan1',
    date: '2025-01-01',
    description: 'Rent Payment',
    amount: 1500,
    category: 'Housing',
    type: 'expense',
    account: 'Main Checking'
  },
  {
    id: 'jan2',
    date: '2025-01-05',
    description: 'Monthly Salary',
    amount: 3800,
    category: 'Salary',
    type: 'income',
    account: 'Main Checking'
  },
  {
    id: 'jan3',
    date: '2025-01-07',
    description: 'Grocery Store',
    amount: 127.45,
    category: 'Food',
    type: 'expense',
    account: 'Credit Card'
  },
  {
    id: 'jan4',
    date: '2025-01-10',
    description: 'Electric Bill',
    amount: 98.75,
    category: 'Utilities',
    type: 'expense',
    account: 'Main Checking'
  },
  {
    id: 'jan5',
    date: '2025-01-15',
    description: 'Transfer to Savings',
    amount: 600,
    category: 'Personal',
    type: 'expense',
    account: 'Main Checking'
  },
  {
    id: 'jan6',
    date: '2025-01-15',
    description: 'Transfer from Checking',
    amount: 600,
    category: 'Personal',
    type: 'income',
    account: 'Savings'
  },
  {
    id: 'jan7',
    date: '2025-01-20',
    description: 'Gas Station',
    amount: 52.30,
    category: 'Transportation',
    type: 'expense',
    account: 'Credit Card'
  },
  {
    id: 'jan8',
    date: '2025-01-25',
    description: 'Dinner with Friends',
    amount: 87.50,
    category: 'Food',
    type: 'expense',
    account: 'Credit Card'
  },
  {
    id: 'jan9',
    date: '2025-01-28',
    description: 'Gym Membership',
    amount: 55.00,
    category: 'Personal',
    type: 'expense',
    account: 'Main Checking'
  },

  // February 2025
  {
    id: 'feb1',
    date: '2025-02-01',
    description: 'Rent Payment',
    amount: 1500,
    category: 'Housing',
    type: 'expense',
    account: 'Main Checking'
  },
  {
    id: 'feb2',
    date: '2025-02-05',
    description: 'Monthly Salary',
    amount: 3800,
    category: 'Salary',
    type: 'income',
    account: 'Main Checking'
  },
  {
    id: 'feb3',
    date: '2025-02-10',
    description: 'Internet Bill',
    amount: 84.99,
    category: 'Utilities',
    type: 'expense',
    account: 'Main Checking'
  },
  {
    id: 'feb4',
    date: '2025-02-14',
    description: 'Valentine\'s Day Gift',
    amount: 125.00,
    category: 'Shopping',
    type: 'expense',
    account: 'Credit Card'
  },
  {
    id: 'feb5',
    date: '2025-02-15',
    description: 'Transfer to Savings',
    amount: 600,
    category: 'Personal',
    type: 'expense',
    account: 'Main Checking'
  },
  {
    id: 'feb6',
    date: '2025-02-15',
    description: 'Transfer from Checking',
    amount: 600,
    category: 'Personal',
    type: 'income',
    account: 'Savings'
  },
  {
    id: 'feb7',
    date: '2025-02-20',
    description: 'Car Insurance',
    amount: 120.00,
    category: 'Transportation',
    type: 'expense',
    account: 'Credit Card'
  },

  // March 2025
  {
    id: 'mar1',
    date: '2025-03-01',
    description: 'Rent Payment',
    amount: 1500,
    category: 'Housing',
    type: 'expense',
    account: 'Main Checking'
  },
  {
    id: 'mar2',
    date: '2025-03-05',
    description: 'Monthly Salary',
    amount: 3800,
    category: 'Salary',
    type: 'income',
    account: 'Main Checking'
  },
  {
    id: 'mar3',
    date: '2025-03-10',
    description: 'Electric Bill',
    amount: 92.30,
    category: 'Utilities',
    type: 'expense',
    account: 'Main Checking'
  },
  {
    id: 'mar4',
    date: '2025-03-15',
    description: 'Transfer to Savings',
    amount: 600,
    category: 'Personal',
    type: 'expense',
    account: 'Main Checking'
  },
  {
    id: 'mar5',
    date: '2025-03-15',
    description: 'Transfer from Checking',
    amount: 600,
    category: 'Personal',
    type: 'income',
    account: 'Savings'
  },
  {
    id: 'mar6',
    date: '2025-03-20',
    description: 'Spring Clothes',
    amount: 230.75,
    category: 'Shopping',
    type: 'expense',
    account: 'Credit Card'
  },
  {
    id: 'mar7',
    date: '2025-03-25',
    description: 'Doctor Visit',
    amount: 45.00,
    category: 'Healthcare',
    type: 'expense',
    account: 'Credit Card'
  },

  // April 2025 (Updated dates from original May 2023)
  {
    id: '1',
    date: '2025-04-01',
    description: 'Rent Payment',
    amount: 1450,
    category: 'Housing',
    type: 'expense',
    account: 'Main Checking'
  },
  {
    id: '2',
    date: '2025-04-02',
    description: 'Grocery Store',
    amount: 85.75,
    category: 'Food',
    type: 'expense',
    account: 'Credit Card'
  },
  {
    id: '3',
    date: '2025-04-03',
    description: 'Gas Station',
    amount: 45.23,
    category: 'Transportation',
    type: 'expense',
    account: 'Credit Card'
  },
  {
    id: '4',
    date: '2025-04-05',
    description: 'Monthly Salary',
    amount: 3500,
    category: 'Salary',
    type: 'income',
    account: 'Main Checking'
  },
  {
    id: '5',
    date: '2025-04-07',
    description: 'Electric Bill',
    amount: 95.40,
    category: 'Utilities',
    type: 'expense',
    account: 'Main Checking'
  },
  {
    id: '6',
    date: '2025-04-08',
    description: 'Internet Bill',
    amount: 79.99,
    category: 'Utilities',
    type: 'expense',
    account: 'Main Checking'
  },
  {
    id: '7',
    date: '2025-04-10',
    description: 'Restaurant Dinner',
    amount: 68.50,
    category: 'Food',
    type: 'expense',
    account: 'Credit Card'
  },
  {
    id: '8',
    date: '2025-04-12',
    description: 'Movie Tickets',
    amount: 32.00,
    category: 'Entertainment',
    type: 'expense',
    account: 'Credit Card'
  },
  {
    id: '9',
    date: '2025-04-15',
    description: 'Transfer to Savings',
    amount: 500,
    category: 'Personal',
    type: 'expense',
    account: 'Main Checking'
  },
  {
    id: '10',
    date: '2025-04-15',
    description: 'Transfer from Checking',
    amount: 500,
    category: 'Personal',
    type: 'income',
    account: 'Savings'
  },
  {
    id: '11',
    date: '2025-04-18',
    description: 'Pharmacy',
    amount: 45.75,
    category: 'Healthcare',
    type: 'expense',
    account: 'Credit Card'
  },
  {
    id: '12',
    date: '2025-04-20',
    description: 'Clothing Store',
    amount: 125.30,
    category: 'Shopping',
    type: 'expense',
    account: 'Credit Card'
  },
  {
    id: '13',
    date: '2025-04-22',
    description: 'Dividend Payment',
    amount: 37.50,
    category: 'Investments',
    type: 'income',
    account: 'Investment Account'
  },
  {
    id: '14',
    date: '2025-04-25',
    description: 'Mobile Phone Bill',
    amount: 85.00,
    category: 'Utilities',
    type: 'expense',
    account: 'Main Checking'
  },
  {
    id: '15',
    date: '2025-04-28',
    description: 'Gym Membership',
    amount: 50.00,
    category: 'Personal',
    type: 'expense',
    account: 'Main Checking'
  },
  {
    id: '16',
    date: '2025-04-30',
    description: 'Freelance Work',
    amount: 250.00,
    category: 'Salary',
    type: 'income',
    account: 'Main Checking'
  },

  // May 2025 (Updated dates from original June 2023)
  {
    id: '17',
    date: '2025-05-01',
    description: 'Rent Payment',
    amount: 1450,
    category: 'Housing',
    type: 'expense',
    account: 'Main Checking'
  },
  {
    id: '18',
    date: '2025-05-03',
    description: 'Grocery Store',
    amount: 92.47,
    category: 'Food',
    type: 'expense',
    account: 'Credit Card'
  },
  {
    id: '19',
    date: '2025-05-05',
    description: 'Monthly Salary',
    amount: 3500,
    category: 'Salary',
    type: 'income',
    account: 'Main Checking'
  },
  {
    id: '20',
    date: '2025-05-07',
    description: 'Car Repair',
    amount: 275.50,
    category: 'Transportation',
    type: 'expense',
    account: 'Credit Card'
  },
  {
    id: '21',
    date: '2025-05-10',
    description: 'Mother\'s Day Gift',
    amount: 75.00,
    category: 'Shopping',
    type: 'expense',
    account: 'Credit Card'
  },
  {
    id: '22',
    date: '2025-05-15',
    description: 'Transfer to Savings',
    amount: 500,
    category: 'Personal',
    type: 'expense',
    account: 'Main Checking'
  },
  {
    id: '23',
    date: '2025-05-15',
    description: 'Transfer from Checking',
    amount: 500,
    category: 'Personal',
    type: 'income',
    account: 'Savings'
  },
  {
    id: '24',
    date: '2025-05-18',
    description: 'Dinner with Friends',
    amount: 95.30,
    category: 'Food',
    type: 'expense',
    account: 'Credit Card'
  },
  {
    id: '25',
    date: '2025-05-20',
    description: 'Electric Bill',
    amount: 88.75,
    category: 'Utilities',
    type: 'expense',
    account: 'Main Checking'
  }
];
