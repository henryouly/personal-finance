import { useEffect, useState } from 'react';
import { Account } from '@/types';
import { client } from '@/lib/holo';

export function useGetAccounts() {
  const [data, setData] = useState<Account[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await client.api.accounts.$get();

      if (!response.ok) {
        throw new Error('Failed to fetch accounts');
      }

      const { data } = await response.json();

      setData(data.map(account => ({
        ...account,
        balance: Number(account.balance),
      })));
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
  };
}
