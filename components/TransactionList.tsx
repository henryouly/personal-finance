'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EditableCategory } from './EditableCategory';
import { usePagination } from '@/hooks/use-pagination';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQuery } from '@tanstack/react-query';

interface TransactionListProps {
  pageSize: number;
}

export default function TransactionList({
  pageSize,
}: TransactionListProps) {
  const trpc = useTRPC();
  const {
    data: initialTransactions = [],
    isLoading,
    error,
  } = useQuery(trpc.transactions.list.queryOptions({}));

  const {
    pagination,
    goToPage,
    setPageSize,
    nextPage,
    prevPage,
    updateTotalItems,
  } = usePagination({ pageSize });

  // Get categories for the dropdown
  const { data: categories } = useQuery(trpc.categories.list.queryOptions());

  // Local state for optimistic updates
  const [transactions, setTransactions] = useState(initialTransactions);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const updateTransactionMutation = useMutation(trpc.transactions.update.mutationOptions());

  // Update local state when initialTransactions changes
  useEffect(() => {
    if (isLoading) return;
    setTransactions(initialTransactions);
    updateTotalItems(initialTransactions.length);
  }, [initialTransactions, isLoading]);  // eslint-disable-line react-hooks/exhaustive-deps

  // Handle category update
  const handleCategoryChange = async (transactionId: string, newCategory: string) => {
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
      const categoryId = categories?.find((cat: { name: string; id: string }) => cat.name === newCategory)?.id || null;

      updateTransactionMutation.mutate({ id: transactionId, data: { categoryId } });
    } catch (error) {
      console.error('Failed to update category:', error);
      setTransactions(previousTransactions);
      alert('Failed to update category. Please try again.');
    }
  };

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
        {Array(5).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        Error loading transactions: {error.message}
      </div>
    );
  }

  if (initialTransactions.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
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
        <div className="flex items-center gap-2">
          <select
            className="border rounded p-1 text-sm h-9"
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
            className="h-9 w-9 p-0"
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
            {sortedTransactions.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize).map((transaction) => (
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

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500">
          Showing {Math.min(initialTransactions.length, pagination.pageSize)} of {pagination.total} transactions
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevPage}
            disabled={!pagination.hasPreviousPage || isLoading}
          >
            Previous
          </Button>
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, i) => {
              // Show pages around current page
              let pageNum;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={pagination.page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(pageNum)}
                  disabled={isLoading}
                  className="w-10 h-10 p-0"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={nextPage}
            disabled={!pagination.hasNextPage || isLoading}
          >
            Next
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Page Size:</span>
          <select
            value={pagination.pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="p-1 border rounded text-sm"
            disabled={isLoading}
          >
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}