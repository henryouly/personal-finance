'use client';

import { useState, useEffect } from 'react';
import { Transaction } from '@/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTransactions } from '@/hooks/use-transactions';
import { useGetCategories } from '@/hooks/use-categories';
import { EditableCategory } from './EditableCategory';

interface TransactionListProps {
  accountId?: string;
  categoryId?: string;
  limit?: number;
}

export default function TransactionList({
  accountId,
  categoryId,
  limit
}: TransactionListProps) {
  const { transactions: initialTransactions, isLoading, error } = useTransactions({
    accountId,
    categoryId,
    limit,
  });

  // Get categories for the dropdown
  const { data: categories } = useGetCategories();

  // Local state for optimistic updates
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  // Update local state when initialTransactions changes
  useEffect(() => {
    setTransactions(initialTransactions);
  }, [initialTransactions]);

  // Handle category update
  const handleCategoryChange = async (transactionId: string, newCategory: string) => {
    // Save the current state for potential rollback
    const previousTransactions = transactions;

    // Optimistic update
    setTransactions(prevTransactions =>
      prevTransactions.map(tx => {
        if (tx.id === transactionId) {
          return {
            ...tx,
            category: newCategory,
            categoryId: categories?.find((c: { name: string; id: string }) => c.name === newCategory)?.id || null
          };
        }
        return tx;
      })
    );

    try {
      // Find the category ID from the categories list
      const categoryId = categories?.find((cat: { name: string; id: string }) => cat.name === newCategory)?.id || null;

      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categoryId }),
      });

      if (!response.ok) {
        throw new Error('Failed to update category');
      }

    } catch (error) {
      console.error('Failed to update category:', error);
      // Revert on error
      setTransactions(previousTransactions);
      // Show error toast or notification
      alert('Failed to update category. Please try again.');
    }
  };

  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const filteredTransactions = transactions.filter((transaction) => {
    if (filter === 'all') return true;
    return transaction.type === filter;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortBy === 'amount') {
      return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    }
    return 0;
  });

  const formatCurrency = (amount: number, type: string) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount));

    return type === 'income' ? formatted : `-${formatted}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC'  // This ensures the date isn't shifted by local timezone
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <div className="flex gap-2">
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-24" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>
        <div className="space-y-2">
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-destructive">
        <p>Error loading transactions: {error.message}</p>
        <Button
          variant="outline"
          className="mt-2"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No transactions found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'income' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('income')}
          >
            Income
          </Button>
          <Button
            variant={filter === 'expense' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('expense')}
          >
            Expenses
          </Button>
        </div>
        <div className="flex gap-2">
          <select
            className="border rounded p-1 text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">Date</option>
            <option value="amount">Amount</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Account</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-gray-200">
            {sortedTransactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-muted/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(transaction.date)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{transaction.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <EditableCategory
                    category={transaction.category}
                    onCategoryChange={(newCategory) => handleCategoryChange(transaction.id, newCategory)}
                    className="text-xs"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{transaction.account}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(transaction.amount, transaction.type)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}