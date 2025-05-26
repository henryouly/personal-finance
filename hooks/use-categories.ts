import { useEffect, useState } from 'react';
import { Category } from '@/types';
import { client } from '@/lib/holo';

export function useGetCategories() {
  const [data, setData] = useState<Category[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await client.api.categories.$get();

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const { data } = await response.json();
      setData(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    data,
    loading,
    error,
  };
}
