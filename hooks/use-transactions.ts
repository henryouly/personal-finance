import { useState, useEffect } from 'react';
import { Transaction } from '@/types';

interface UseTransactionsProps {
  accountId?: string;
  categoryId?: string;
  page?: number;
  pageSize?: number;
  startDate?: Date;
  endDate?: Date;
}

interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function useTransactions({
  accountId,
  categoryId,
  page = 1,
  pageSize = 10,
  startDate,
  endDate,
}: UseTransactionsProps = {}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1, // Start with page 1 for UI
    pageSize,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  
  // Calculate offset based on current page and page size
  const offset = (pagination.page - 1) * pagination.pageSize;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          offset: offset.toString(),
          limit: pagination.pageSize.toString(),
        });
        
        if (accountId) params.set('accountId', accountId);
        if (categoryId) params.set('categoryId', categoryId);
        if (startDate) params.set('startDate', startDate.toISOString());
        if (endDate) params.set('endDate', endDate.toISOString());

        const response = await fetch(`/api/transactions?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }

        const { data } = await response.json();
        
        // Transform the API response to match the Transaction type
        const transformedData = data.items.map((tx: any) => ({
          id: tx.id,
          date: tx.date,
          description: tx.description,
          amount: parseFloat(tx.amount),
          type: tx.type,
          category: tx.category?.name || 'Uncategorized',
          account: tx.account?.name || 'Unknown Account',
          categoryColor: tx.category?.color,
          accountColor: tx.account?.color,
        }));

        setTransactions(transformedData);
        setPagination(data.pagination);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [accountId, categoryId, pagination.page, pagination.pageSize, startDate, endDate, offset]);

  // Function to change page
  const goToPage = (newPage: number) => {
    setPagination(prev => ({
      ...prev,
      page: Math.max(1, Math.min(newPage, prev.totalPages)),
    }));
  };

  // Function to change page size
  const setPageSize = (newPageSize: number) => {
    setPagination(prev => ({
      ...prev,
      pageSize: Math.max(1, newPageSize),
      page: 1, // Reset to first page when changing page size
    }));
  };

  return { 
    transactions, 
    pagination, 
    isLoading, 
    error, 
    goToPage, 
    setPageSize,
    nextPage: () => pagination.hasNextPage && goToPage(pagination.page + 1),
    prevPage: () => pagination.hasPreviousPage && goToPage(pagination.page - 1),
  };
}
