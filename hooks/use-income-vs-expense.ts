import { useDateRange } from '@/contexts/DateRangeContext';
import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';

export function useIncomeVsExpense() {
  const { dateRange } = useDateRange();
  const { from: startDate, to: endDate } = dateRange;
  const trpc = useTRPC();
  const { data, isLoading, error } = useQuery(trpc.analytics.incomeVsExpense.queryOptions({
    startDate: startDate?.toISOString(),
    endDate: endDate?.toISOString(),
  }));

  return { data, isLoading, error };
}
