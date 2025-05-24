'use client';

import { useEffect, useState } from 'react';
import { sampleBudgets } from '@/data/sampleData';
import { Budget } from '@/types';
import { Card, CardContent } from '@/components/ui/card';

export default function BudgetOverview() {
  const [budgets, setBudgets] = useState<Budget[]>([]);

  useEffect(() => {
    setBudgets(sampleBudgets);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculatePercentage = (spent: number, total: number) => {
    return Math.round((spent / total) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map((budget) => {
          const percentage = calculatePercentage(budget.spent, budget.amount);
          const isOverBudget = budget.spent > budget.amount;
          
          return (
            <Card key={budget.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">{budget.category}</h3>
                  <span className={`text-sm font-medium ${isOverBudget ? 'text-red-500' : 'text-green-500'}`}>
                    {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                  <div 
                    className={`h-2.5 rounded-full ${isOverBudget ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>{percentage}% used</span>
                  <span>{budget.period}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}