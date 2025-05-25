'use client';

import { useState } from 'react';
import { CalendarIcon, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useDateRange } from '@/contexts/DateRangeContext'; 

const presets = [
  { label: 'Last Month', value: 'lastMonth' as const },
  { label: 'Last 6 Months', value: 'last6Months' as const },
  { label: 'This Year', value: 'thisYear' as const },
];

export function DateRangePicker() {
  const { dateRange, setDateRange, selectPreset } = useDateRange();

  const formatRange = () => {
    if (!dateRange.from && !dateRange.to) return 'Select date range';
    
    const from = dateRange.from ? format(dateRange.from, 'MMM d') : '...';
    const to = dateRange.to ? format(dateRange.to, 'MMM d, yyyy') : '...';
    return `${from} - ${to}`;
  };

  return (
    <div className="w-full">
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between text-left font-normal"
          >
            <span className="text-sm">{formatRange()}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Date Range</h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs h-8">
                    Presets <ChevronDown className="ml-1 h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[150px]">
                  {presets.map((preset) => (
                    <DropdownMenuItem 
                      key={preset.value} 
                      onClick={() => selectPreset(preset.value)}
                      className="text-xs"
                    >
                      {preset.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left text-sm h-9',
                        !dateRange.from && 'text-muted-foreground',
                        'px-3'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                      {dateRange.from ? format(dateRange.from, 'MMM d, yyyy') : 'Start date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) =>
                        date && setDateRange({ ...dateRange, from: date })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left text-sm h-9',
                        !dateRange.to && 'text-muted-foreground',
                        'px-3'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                      {dateRange.to ? format(dateRange.to, 'MMM d, yyyy') : 'End date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) =>
                        date && setDateRange({ ...dateRange, to: date })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
