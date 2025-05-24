'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { generateIncomeVsExpense } from '@/data/sampleData';
import { IncomeVsExpense } from '@/types';

export default function IncomeVsExpenseChart() {
  const [data, setData] = useState<IncomeVsExpense[]>([]);

  useEffect(() => {
    setData(generateIncomeVsExpense());
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={formatCurrency} />
        <Tooltip 
          formatter={(value) => [formatCurrency(value), 'Amount']}
          labelStyle={{ color: '#333' }}
        />
        <Legend />
        <Bar dataKey="income" fill="#4ade80" name="Income" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" fill="#f87171" name="Expense" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}