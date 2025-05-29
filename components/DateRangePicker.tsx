'use client';

import { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, subDays, subMonths, startOfYear, startOfMonth, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDateRange } from '@/contexts/DateRangeContext';

type Preset = {
  label: string;
  value: string;
  getRange: () => { from: Date; to: Date };
};

const presets: Preset[] = [
  {
    label: 'Today',
    value: 'today',
    getRange: () => ({
      from: new Date(),
      to: new Date()
    })
  },
  {
    label: 'Last 30 Days',
    value: 'last30days',
    getRange: () => ({
      from: subDays(new Date(), 29),
      to: new Date()
    })
  },
  {
    label: 'Last 6 Months',
    value: 'last6Months',
    getRange: () => ({
      from: subMonths(new Date(), 6),
      to: new Date()
    })
  },
  {
    label: 'This Month',
    value: 'thisMonth',
    getRange: () => ({
      from: startOfMonth(new Date()),
      to: new Date()
    })
  },
  {
    label: 'This Year',
    value: 'thisYear',
    getRange: () => ({
      from: startOfYear(new Date()),
      to: new Date()
    })
  },
  {
    label: 'All Time',
    value: 'allTime',
    getRange: () => ({
      from: new Date(2020, 0, 1),
      to: new Date()
    })
  }
];

export function DateRangePicker() {
  const { dateRange, setDateRange } = useDateRange();
  const [isOpen, setIsOpen] = useState(false);
  const [fromMonth, setFromMonth] = useState<Date>(dateRange.from);
  const [toMonth, setToMonth] = useState<Date>(dateRange.to);

  const formatRange = () => {
    const from = format(dateRange.from, 'MMM d');
    const to = format(dateRange.to, 'MMM d, yyyy');
    return `${from} - ${to}`;
  };

  const handlePresetSelect = (presetValue: string) => {
    const preset = presets.find(p => p.value === presetValue);
    if (preset) {
      const range = preset.getRange();
      setDateRange(range);
      setActivePreset(presetValue);
      setFromMonth(range.from);
      setToMonth(range.to);
    }
  };

  const handleDateSelect = (date: Date, type: 'from' | 'to') => {
    const newRange = { ...dateRange };

    if (type === 'from') {
      // If selecting a new from date that's after the current to date, update both
      if (date > dateRange.to) {
        newRange.to = date;
        setToMonth(date);
      }
      newRange.from = date;
      setFromMonth(date);
    } else {
      // If selecting a new to date that's before the current from date, update both
      if (date < dateRange.from) {
        newRange.from = date;
        setFromMonth(date);
      }
      newRange.to = date;
      setToMonth(date);
    }

    setDateRange(newRange);
    setActivePreset(null); // Clear preset when manually selecting dates
  };

  const isPresetActive = (presetValue: string) => {
    const preset = presets.find(p => p.value === presetValue);
    if (!preset) return false;

    const presetRange = preset.getRange();
    return (
      isSameDay(presetRange.from, dateRange.from) &&
      isSameDay(presetRange.to, dateRange.to)
    );
  };

  return (
    <div className="w-full max-w-md">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-between text-left font-normal group',
              'hover:bg-accent hover:text-accent-foreground',
              'transition-colors duration-200',
              'h-10 px-3 py-2 text-sm'
            )}
          >
            <span className="flex-1 truncate pr-2">
              {formatRange()}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col">
            {/* Presets */}
            <div className="p-4 border-b">
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">Quick Select</h3>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset) => (
                  <Button
                    key={preset.value}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'justify-start text-xs h-8',
                      isPresetActive(preset.value) && 'bg-accent font-medium',
                      'text-left whitespace-nowrap overflow-hidden text-ellipsis',
                      'hover:bg-accent/80 transition-colors'
                    )}
                    onClick={() => handlePresetSelect(preset.value)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Date Pickers */}
            <div className="p-4 flex flex-col sm:flex-row gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Start Date</h4>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 p-0"
                      onClick={() => setFromMonth(subMonths(fromMonth, 1))}
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 p-0"
                      onClick={() => setFromMonth(subMonths(fromMonth, -1))}
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <Calendar
                  mode="single"
                  selected={dateRange.from}
                  onSelect={(date) => date && handleDateSelect(date, 'from')}
                  month={fromMonth}
                  onMonthChange={setFromMonth}
                  className="p-0"
                  classNames={{
                    day_selected: 'bg-primary text-primary-foreground hover:bg-primary/90',
                    day_today: 'bg-accent text-accent-foreground',
                    day_outside: 'text-muted-foreground opacity-50',
                    day_disabled: 'text-muted-foreground opacity-50',
                    day_range_middle: 'bg-accent/50',
                    day_hidden: 'invisible',
                  }}
                  initialFocus
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">End Date</h4>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 p-0"
                      onClick={() => setToMonth(subMonths(toMonth, 1))}
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 p-0"
                      onClick={() => setToMonth(subMonths(toMonth, -1))}
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <Calendar
                  mode="single"
                  selected={dateRange.to}
                  onSelect={(date) => date && handleDateSelect(date, 'to')}
                  month={toMonth}
                  onMonthChange={setToMonth}
                  className="p-0"
                  classNames={{
                    day_selected: 'bg-primary text-primary-foreground hover:bg-primary/90',
                    day_today: 'bg-accent text-accent-foreground',
                    day_outside: 'text-muted-foreground opacity-50',
                    day_disabled: 'text-muted-foreground opacity-50',
                    day_range_middle: 'bg-accent/50',
                    day_hidden: 'invisible',
                  }}
                  initialFocus
                />
              </div>
            </div>

            {/* Footer with action buttons */}
            <div className="flex justify-between items-center p-3 border-t bg-muted/30">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  setDateRange({
                    from: subMonths(today, 1),
                    to: today
                  });
                  setActivePreset(null);
                }}
                className="text-xs h-8"
              >
                Reset
              </Button>
              <div className="text-xs text-muted-foreground px-2">
                <span>
                  {format(dateRange.from, 'MMM d, yyyy')} — {format(dateRange.to, 'MMM d, yyyy')}
                </span>
              </div>
              <Button
                variant="default"
                size="sm"
                className="text-xs h-8"
                onClick={() => setIsOpen(false)}
              >
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
