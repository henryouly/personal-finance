'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useCategorySpending } from '@/hooks/use-category-spending';

// Professional color palette
const COLORS = [
  '#0088FE', // blue
  '#00C49F', // teal
  '#FFBB28', // amber
  '#FF8042', // orange
  '#8884D8', // purple
  '#4CAF50', // green
  '#F44336', // red
  '#9C27B0', // deep purple
  '#3F51B5', // indigo
  '#607D8B', // blue grey
];

export default function SpendingByCategory() {
  const { data: categoryData, isLoading, error } = useCategorySpending();

  // Merge colors with the data
  const dataWithColors = useMemo(() => {
    return categoryData.map((item, index) => ({
      ...item,
      color: COLORS[index % COLORS.length],
    }));
  }, [categoryData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

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
        Error loading category spending data: {error.message}
      </div>
    );
  }

  if (dataWithColors.length === 0) {
    return (
      <div className="text-gray-500 p-4 text-center">
        No spending data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={dataWithColors}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="amount"
          nameKey="category"
        >
          {dataWithColors.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [formatCurrency(Number(value)), 'Amount']}
          labelStyle={{ color: '#333' }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}