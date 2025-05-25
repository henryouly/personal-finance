'use client';

import { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { addMonths, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear, subYears } from 'date-fns';

type DateRange = {
  from: Date;
  to: Date;
};

type DateRangeContextType = {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  selectPreset: (preset: 'lastMonth' | 'last6Months' | 'thisYear') => void;
};

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

export function DateRangeProvider({ children }: { children: ReactNode }) {
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const today = new Date();
    return {
      from: subMonths(today, 1),
      to: today,
    };
  });

  const selectPreset = (preset: 'lastMonth' | 'last6Months' | 'thisYear') => {
    const today = new Date();
    switch (preset) {
      case 'lastMonth':
        setDateRange({
          from: startOfMonth(subMonths(today, 1)),
          to: endOfMonth(subMonths(today, 1)),
        });
        break;
      case 'last6Months':
        setDateRange({
          from: subMonths(today, 6),
          to: today,
        });
        break;
      case 'thisYear':
        setDateRange({
          from: startOfYear(today),
          to: today,
        });
        break;
    }
  };

  const value = useMemo(
    () => ({
      dateRange,
      setDateRange,
      selectPreset,
    }),
    [dateRange]
  );

  return <DateRangeContext.Provider value={value}>{children}</DateRangeContext.Provider>;
}

export function useDateRange() {
  const context = useContext(DateRangeContext);
  if (context === undefined) {
    throw new Error('useDateRange must be used within a DateRangeProvider');
  }
  return context;
}
