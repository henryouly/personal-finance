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

export const sampleBudgets: Budget[] = [
  { id: '1', category: 'Housing', amount: 1500, spent: 1450, period: 'monthly' },
  { id: '2', category: 'Transportation', amount: 400, spent: 320, period: 'monthly' },
  { id: '3', category: 'Food', amount: 600, spent: 580, period: 'monthly' },
  { id: '4', category: 'Utilities', amount: 300, spent: 280, period: 'monthly' },
  { id: '5', category: 'Entertainment', amount: 200, spent: 250, period: 'monthly' },
  { id: '6', category: 'Healthcare', amount: 150, spent: 90, period: 'monthly' },
  { id: '7', category: 'Shopping', amount: 300, spent: 420, period: 'monthly' },
  { id: '8', category: 'Personal', amount: 200, spent: 180, period: 'monthly' },
];

export const sampleTransactions: Transaction[] = [
  {
    id: '1',
    date: '2023-05-01',
    description: 'Rent Payment',
    amount: 1450,
    category: 'Housing',
    type: 'expense',
    account: 'Main Checking'
  },
  {
    id: '2',
    date: '2023-05-02',
    description: 'Grocery Store',
    amount: 85.75,
    category: 'Food',
    type: 'expense',
    account: 'Credit Card'
  },
  {
    id: '3',
    date: '2023-05-03',
    description: 'Gas Station',
    amount: 45.23,
    category: 'Transportation',
    type: 'expense',
    account: 'Credit Card'
  },
  {
    id: '4',
    date: '2023-05-05',
    description: 'Monthly Salary',
    amount: 3500,
    category: 'Salary',
    type: 'income',
    account: 'Main Checking'
  },
  {
    id: '5',
    date: '2023-05-07',
    description: 'Electric Bill',
    amount: 95.40,
    category: 'Utilities',
    type: 'expense',
    account: 'Main Checking'
  },
  {
    id: '6',
    date: '2023-05-08',
    description: 'Internet Bill',
    amount: 79.99,
    category: 'Utilities',
    type: 'expense',
    account: 'Main Checking'
  },
  {
    id: '7',
    date: '2023-05-10',
    description: 'Restaurant Dinner',
    amount: 68.50,
    category: 'Food',
    type: 'expense',
    account: 'Credit Card'
  },
  {
    id: '8',
    date: '2023-05-12',
    description: 'Movie Tickets',
    amount: 32.00,
    category: 'Entertainment',
    type: 'expense',
    account: 'Credit Card'
  },
  {
    id: '9',
    date: '2023-05-15',
    description: 'Transfer to Savings',
    amount: 500,
    category: 'Personal',
    type: 'expense',
    account: 'Main Checking'
  },
  {
    id: '10',
    date: '2023-05-15',
    description: 'Transfer from Checking',
    amount: 500,
    category: 'Personal',
    type: 'income',
    account: 'Savings'
  },
  {
    id: '11',
    date: '2023-05-18',
    description: 'Pharmacy',
    amount: 45.75,
    category: 'Healthcare',
    type: 'expense',
    account: 'Credit Card'
  },
  {
    id: '12',
    date: '2023-05-20',
    description: 'Clothing Store',
    amount: 125.30,
    category: 'Shopping',
    type: 'expense',
    account: 'Credit Card'
  },
  {
    id: '13',
    date: '2023-05-22',
    description: 'Dividend Payment',
    amount: 37.50,
    category: 'Investments',
    type: 'income',
    account: 'Investment Account'
  },
  {
    id: '14',
    date: '2023-05-25',
    description: 'Mobile Phone Bill',
    amount: 85.00,
    category: 'Utilities',
    type: 'expense',
    account: 'Main Checking'
  },
  {
    id: '15',
    date: '2023-05-28',
    description: 'Gym Membership',
    amount: 50.00,
    category: 'Personal',
    type: 'expense',
    account: 'Main Checking'
  },
  {
    id: '16',
    date: '2023-05-30',
    description: 'Freelance Work',
    amount: 250.00,
    category: 'Salary',
    type: 'income',
    account: 'Main Checking'
  },
  {
    id: '17',
    date: '2023-06-01',
    description: 'Rent Payment',
    amount: 1450,
    category: 'Housing',
    type: 'expense',
    account: 'Main Checking'
  },
  {
    id: '18',
    date: '2023-06-03',
    description: 'Grocery Store',
    amount: 92.47,
    category: 'Food',
    type: 'expense',
    account: 'Credit Card'
  },
  {
    id: '19',
    date: '2023-06-05',
    description: 'Monthly Salary',
    amount: 3500,
    category: 'Salary',
    type: 'income',
    account: 'Main Checking'
  },
  {
    id: '20',
    date: '2023-06-07',
    description: 'Car Repair',
    amount: 275.50,
    category: 'Transportation',
    type: 'expense',
    account: 'Credit Card'
  },
];

// Generate data for charts
export const generateMonthlySpending = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((month, index) => ({
    month,
    amount: Math.floor(Math.random() * 3000) + 1000,
  }));
};

export const generateCategorySpending = () => {
  const total = sampleCategories
    .filter(cat => cat.id !== '9' && cat.id !== '10') // Exclude income categories
    .map((category) => {
      const amount = Math.floor(Math.random() * 1000) + 200;
      return {
        category: category.name,
        amount,
        color: category.color,
        percentage: 0, // Will be calculated
      };
    });
  
  const totalAmount = total.reduce((sum, item) => sum + item.amount, 0);
  
  return total.map(item => ({
    ...item,
    percentage: Math.round((item.amount / totalAmount) * 100),
  }));
};

export const generateIncomeVsExpense = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((month) => ({
    month,
    income: Math.floor(Math.random() * 2000) + 3000,
    expense: Math.floor(Math.random() * 1500) + 1500,
  }));
};