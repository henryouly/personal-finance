'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMonthlySpending } from '@/hooks/use-monthly-spending';

// Format month from 'YYYY-MM' to 'MMM YY' (e.g., '2023-05' -> 'May 23')
const formatMonth = (monthStr: string) => {
  const [year, month] = monthStr.split('-').map(Number);
  const date = new Date(year, month - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
};

export default function MonthlySpendingChart() {
  const { data: monthlyData, isLoading, error } = useMonthlySpending();

  if (!monthlyData || isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        Error loading monthly spending data: {error.message}
      </div>
    );
  }

  // Format the data for the chart
  const chartData = monthlyData.map(item => ({
    ...item,
    formattedMonth: formatMonth(item.month),
  }));

  if (chartData.length === 0) {
    return (
      <div className="text-gray-500 p-4 text-center">
        No spending data available
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
        <Bar
          dataKey="amount"
          fill="#8884d8"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Custom tooltip component
const CustomTooltip = ({
  active,
  payload,
  label
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string
}) => {
  if (active && payload && payload.length && payload[0].value !== undefined) {
    return (
      <div className="bg-white p-3 shadow-lg rounded-md border border-gray-200">
        <p className="font-medium text-gray-700">{label}</p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Amount:</span>{' '}
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
          }).format(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
}