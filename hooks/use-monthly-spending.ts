import { useState, useEffect } from 'react';
import { MonthlySpending } from '@/types';

interface UseMonthlySpendingProps {
  startDate?: Date;
  endDate?: Date;
}

export function useMonthlySpending({
  startDate,
  endDate,
}: UseMonthlySpendingProps = {}) {
  const [data, setData] = useState<MonthlySpending[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        
        if (startDate) params.append('startDate', startDate.toISOString());
        if (endDate) params.append('endDate', endDate.toISOString());

        const response = await fetch(`/api/analytics/monthly-spending?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch monthly spending data');
        }

        const { data } = await response.json();
        
        // Transform the data to match MonthlySpending type
        const transformedData = data.map((item: any) => ({
          month: item.month,
          amount: Math.abs(parseFloat(item.total)), // Convert to positive number for display
        }));

        setData(transformedData);
      } catch (err) {
        console.error('Error fetching monthly spending:', err);
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  return { data, isLoading, error };
}
