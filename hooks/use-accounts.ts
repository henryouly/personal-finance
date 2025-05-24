import { useEffect, useState } from 'react';
import { Account } from '@/types';

interface AccountsResponse {
  success: boolean;
  data: Account[];
  error?: string;
}

export function useGetAccounts() {
  const [data, setData] = useState<Account[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/accounts');

      if (!response.ok) {
        throw new Error('Failed to fetch accounts');
      }

      const result: AccountsResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch accounts');
      }

      setData(result.data || []);
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchAccounts,
  };
}
