'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useIncomeVsExpense } from '@/hooks/use-income-vs-expense';

// Format month from 'YYYY-MM' to 'MMM YY' (e.g., '2023-05' -> 'May 23')
const formatMonth = (monthStr: string) => {
  const [year, month] = monthStr.split('-').map(Number);
  const date = new Date(year, month - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-lg rounded-md border border-gray-200">
        <p className="font-medium text-gray-700">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            <span className="font-medium">{entry.name}:</span>{' '}
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
            }).format(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function IncomeVsExpenseChart() {
  const { data, isLoading, error } = useIncomeVsExpense();

  // Format the data for the chart
  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      formattedMonth: formatMonth(item.month),
    }));
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        Error loading income vs. expense data: {error.message}
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="text-gray-500 p-4 text-center">
        No income/expense data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" opacity={0.2} />
        <XAxis
          dataKey="formattedMonth"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#666', fontSize: 12 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#666', fontSize: 12 }}
          tickFormatter={(value: number) => `$${value / 1000}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="income" fill="#4ade80" name="Income" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" fill="#f87171" name="Expense" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}