import { useState, useEffect } from 'react';
import { Transaction } from '@/types';
import { client } from '@/lib/holo';
import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';

interface UseTransactionsProps {
  pageSize?: number;
  startDate?: Date;
  endDate?: Date;
}

export function useTransactions({
  pageSize,
  startDate,
  endDate,
}: UseTransactionsProps = {}) {
  const trpc = useTRPC();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { data, isLoading, error } = useQuery(trpc.transactions.list.queryOptions({
    startDate: startDate?.toISOString(),
    endDate: endDate?.toISOString(),
  }));

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!data || isLoading) return;
      // Transform the API response to match the Transaction type
      const transformedData = data.data.map((tx: any) => ({
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
    };

    fetchTransactions();
  }, [data, pageSize]);

  return {
    transactions,
    isLoading,
    error,
  };
}
