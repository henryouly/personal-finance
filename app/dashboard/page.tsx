'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/DateRangePicker';
import TransactionList from '@/components/TransactionList';
import SpendingByCategory from '@/components/analytics/SpendingByCategory';
import MonthlySpendingChart from '@/components/analytics/MonthlySpendingChart';
import IncomeVsExpenseChart from '@/components/analytics/IncomeVsExpenseChart';
import BudgetOverview from '@/components/BudgetOverview';
import AccountSummary from '@/components/AccountSummary';
import { UserButton } from '@/components/auth/user-button';

export default function Dashboard() {
  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Financial Dashboard</h1>
            <div className="flex items-center gap-3">
              <UserButton />
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <AccountSummary />
          </div>

        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>View and manage your transactions</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Export</Button>
                <Button asChild>
                  <a href="/dashboard/transactions/upload">Upload Transactions</a>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <TransactionList pageSize={10} />
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
          <div className="flex justify-end">
            <div className="w-52 mb-4">
              <DateRangePicker />
            </div>
          </div>
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
            <Card>
              <CardHeader>
                <CardTitle>Income vs. Expenses</CardTitle>
                <CardDescription>Compare your income and expenses over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <IncomeVsExpenseChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}