'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TransactionList from '@/components/TransactionList';
import SpendingByCategory from '@/components/charts/SpendingByCategory';
import MonthlySpendingChart from '@/components/charts/MonthlySpendingChart';
import IncomeVsExpenseChart from '@/components/charts/IncomeVsExpenseChart';
import BudgetOverview from '@/components/BudgetOverview';
import AccountSummary from '@/components/AccountSummary';
import { sampleTransactions } from '@/data/sampleData';

export default function Dashboard() {
  const [transactions, setTransactions] = useState(sampleTransactions);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Financial Dashboard</h1>
        <Button>Upload Transactions</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <AccountSummary />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Spending</CardTitle>
                <CardDescription>Your spending over the last 12 months</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <MonthlySpendingChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
                <CardDescription>How your money is spent across categories</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <SpendingByCategory />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Income vs. Expenses</CardTitle>
              <CardDescription>Compare your income and expenses over time</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <IncomeVsExpenseChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>View and manage your transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionList transactions={transactions} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budgets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget Overview</CardTitle>
              <CardDescription>Track your spending against budget</CardDescription>
            </CardHeader>
            <CardContent>
              <BudgetOverview />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Spending Trends</CardTitle>
                <CardDescription>Analyze your spending patterns</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <MonthlySpendingChart />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Category Analysis</CardTitle>
                <CardDescription>Detailed breakdown by category</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <SpendingByCategory />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}