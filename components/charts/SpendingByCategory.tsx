'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { generateCategorySpending } from '@/data/sampleData';
import { CategorySpending } from '@/types';

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
  const [data, setData] = useState<CategorySpending[]>([]);

  useEffect(() => {
    setData(generateCategorySpending());
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
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

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="amount"
          nameKey="category"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [formatCurrency(value), 'Amount']}
          labelStyle={{ color: '#333' }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}