import { useState, useEffect } from 'react';
import { CategorySpending } from '@/types';
import { useDateRange } from '@/contexts/DateRangeContext';

export function useCategorySpending() {
  const { dateRange } = useDateRange();
  const { from: startDate, to: endDate } = dateRange;
  const [data, setData] = useState<CategorySpending[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        
        if (startDate) params.append('startDate', startDate.toISOString());
        if (endDate) params.append('endDate', endDate.toISOString());

        const response = await fetch(`/api/analytics/category-spending?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch category spending data');
        }

        const { data } = await response.json();
        
        // Calculate total for percentage calculation
        const total = data.reduce((sum: number, item: any) => sum + parseFloat(item.total), 0);
        
        // Transform the data to match CategorySpending type
        const transformedData = data.map((item: any) => ({
          category: item.category,
          amount: parseFloat(item.total),
          percentage: total > 0 ? parseFloat(item.total) / total : 0,
          color: '#4CAF50', // Default color, can be overridden by the component
        }));

        setData(transformedData);
      } catch (err) {
        console.error('Error fetching category spending:', err);
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  return { data, isLoading, error };
}
