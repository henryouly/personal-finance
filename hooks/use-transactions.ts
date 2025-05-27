import { useState, useEffect } from 'react';
import { Transaction } from '@/types';
import { usePagination } from './use-pagination';

interface UseTransactionsProps {
  accountId?: string;
  categoryId?: string;
  page?: number;
  pageSize?: number;
  startDate?: Date;
  endDate?: Date;
}

export function useTransactions({
  accountId,
  categoryId,
  pageSize = 10,
  startDate,
  endDate,
}: UseTransactionsProps = {}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { updateTotalItems } = usePagination({ pageSize });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();

        if (accountId) params.append('accountId', accountId);
        if (categoryId) params.append('categoryId', categoryId);
        if (startDate) params.append('startDate', startDate.toISOString());
        if (endDate) params.append('endDate', endDate.toISOString());

        const response = await fetch(`/api/transactions?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }

        const { data } = await response.json();

        // Transform the API response to match the Transaction type
        const transformedData = data.map((tx: any) => ({
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
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [accountId, categoryId, pageSize, startDate, endDate]);

  return {
    transactions,
    isLoading,
    error,
  };
}
