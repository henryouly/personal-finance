import { useDateRange } from '@/contexts/DateRangeContext';
import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';

export function useCategorySpending() {
  const { dateRange } = useDateRange();
  const { from: startDate, to: endDate } = dateRange;
  const trpc = useTRPC();
  const { data, isLoading, error } = useQuery(trpc.analytics.categorySpending.queryOptions({
    startDate: startDate?.toISOString(),
    endDate: endDate?.toISOString(),
  }));

  return { data, isLoading, error };
}
