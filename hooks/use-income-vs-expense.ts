import { useState, useEffect } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';

interface IncomeVsExpenseData {
  month: string;
  income: number;
  expense: number;
}

export function useIncomeVsExpense() {
  const { dateRange } = useDateRange();
  const { from: startDate, to: endDate } = dateRange;
  const [data, setData] = useState<IncomeVsExpenseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        
        if (startDate) params.append('startDate', startDate.toISOString());
        if (endDate) params.append('endDate', endDate.toISOString());

        const response = await fetch(`/api/analytics/income-vs-expense?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch income vs expense data');
        }

        const { data } = await response.json();
        setData(data);
      } catch (err) {
        console.error('Error fetching income vs expense data:', err);
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  return { data, isLoading, error };
}
