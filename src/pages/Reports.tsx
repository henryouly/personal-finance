import { useState } from 'react';
import { trpc } from '../utils/trpc';
import { formatCurrency } from '../domain/accounting';
import { format, startOfMonth, subMonths } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  ReferenceLine
} from 'recharts';
import { Calendar, Tag, TrendingUp, Percent, Store } from 'lucide-react';

export default function Reports() {
  const [months, setMonths] = useState(6);

  const dateRange = {
    startDate: format(subMonths(startOfMonth(new Date()), months - 1), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  };

  const categorySpending = trpc.analytics.categorySpending.useQuery(dateRange);
  const monthlyIncomeVsExpense = trpc.analytics.monthlyIncomeVsExpense.useQuery({ months });
  const monthlySpending = trpc.analytics.monthlySpending.useQuery({ months });
  const netWorthHistory = trpc.analytics.netWorthHistory.useQuery({ months });
  const topMerchants = trpc.analytics.topMerchants.useQuery(dateRange);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const avgIncome = (monthlyIncomeVsExpense.data?.reduce((acc, d) => acc + d.income, 0) || 0) / months;
  const avgExpense = (monthlyIncomeVsExpense.data?.reduce((acc, d) => acc + d.expense, 0) || 0) / months;
  const avgNet = avgIncome - avgExpense;
  const savingsRate = avgIncome > 0 ? (avgNet / avgIncome) * 100 : 0;

  const totalCategorySpending = categorySpending.data?.reduce((acc, c) => acc + Math.abs(c.total), 0) || 0;
  const currentNetWorth = netWorthHistory.data?.[netWorthHistory.data.length - 1]?.netWorth || 0;

  const savingsRateHistory = (monthlyIncomeVsExpense.data || []).map(d => ({
    ...d,
    rate: d.income > 0 ? ((d.income - d.expense) / d.income) * 100 : 0
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          {[3, 6, 12].map((m) => (
            <button
              key={m}
              onClick={() => setMonths(m)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                months === m
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {m} Months
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <SummaryCard title="Net Worth" value={formatCurrency(currentNetWorth)} color="blue" data-testid="summary-net-worth" />
        <SummaryCard title="Avg. Income" value={formatCurrency(avgIncome)} color="green" data-testid="summary-income" />
        <SummaryCard title="Avg. Expense" value={formatCurrency(avgExpense)} color="red" data-testid="summary-expense" />
        <SummaryCard title="Avg. Savings" value={formatCurrency(avgNet)} color="blue" data-testid="summary-savings" />
        <SummaryCard
          title="Savings Rate"
          value={`${savingsRate.toFixed(1)}%`}
          color={savingsRate >= 0 ? 'green' : 'red'}
          data-testid="summary-savings-rate"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Net Worth Trend */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
              Net Worth Trend
            </h2>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={netWorthHistory.data}>
                <defs>
                  <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickFormatter={(val) => format(new Date(val + '-02'), 'MMM yy')}
                />
                <YAxis tickFormatter={(value) => `$${value/100}`} />
                <Tooltip
                  formatter={(value: any) => formatCurrency(Number(value))}
                  labelFormatter={(label) => format(new Date(label + '-02'), 'MMMM yyyy')}
                />
                <Area
                  type="monotone"
                  dataKey="netWorth"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorNetWorth)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Income vs Expense Comparison */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Income vs Expenses</h2>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-1" />
              {format(subMonths(new Date(), months - 1), 'MMM yyyy')} - Present
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyIncomeVsExpense.data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickFormatter={(val) => format(new Date(val + '-02'), 'MMM yy')}
                />
                <YAxis tickFormatter={(value) => `$${value/100}`} />
                <Tooltip
                  formatter={(value: any) => formatCurrency(Number(value))}
                  labelFormatter={(label) => format(new Date(label + '-02'), 'MMMM yyyy')}
                />
                <Legend verticalAlign="top" align="right" height={36}/>
                <Bar
                  name="Income"
                  dataKey="income"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  barSize={32}
                />
                <Bar
                  name="Expenses"
                  dataKey="expense"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Savings Rate Trend */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center">
              <Percent className="w-5 h-5 mr-2 text-green-500" />
              Savings Rate Trend
            </h2>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={savingsRateHistory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickFormatter={(val) => format(new Date(val + '-02'), 'MMM yy')}
                />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip
                  formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Savings Rate']}
                  labelFormatter={(label) => format(new Date(label + '-02'), 'MMMM yyyy')}
                />
                <ReferenceLine y={0} stroke="#000" />
                <Bar
                  dataKey="rate"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                >
                  {savingsRateHistory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.rate >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Category Breakdown */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-6 flex items-center">
            <Tag className="w-5 h-5 mr-2 text-blue-500" />
            Spending by Category
          </h2>
          <div className="h-80 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categorySpending.data || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="total"
                  nameKey="categoryName"
                  stroke="none"
                >
                  {(categorySpending.data || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => {
                    const amount = Math.abs(Number(value));
                    const percent = totalCategorySpending > 0 ? (amount / totalCategorySpending * 100).toFixed(1) : 0;
                    return [`${formatCurrency(amount)} (${percent}%)`, 'Total'];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-gray-500 uppercase font-medium">Total Spent</span>
              <span className="text-xl font-bold text-gray-900">{formatCurrency(totalCategorySpending)}</span>
            </div>
          </div>

          {/* Legend Table */}
          <div className="mt-6 space-y-2 max-h-48 overflow-y-auto">
            {(categorySpending.data || [])
              .sort((a, b) => Math.abs(b.total) - Math.abs(a.total))
              .map((category, index) => (
                <div key={category.categoryId} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: category.color || COLORS[index % COLORS.length] }} />
                    <span className="font-medium text-gray-700">{category.categoryName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-900 font-semibold">{formatCurrency(Math.abs(category.total))}</span>
                    <span className="text-gray-400 text-xs ml-2">
                      ({totalCategorySpending > 0 ? (Math.abs(category.total) / totalCategorySpending * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* Spending Trends */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-6">Spending Trends</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlySpending.data || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickFormatter={(val) => format(new Date(val + '-02'), 'MMM yy')}
                />
                <YAxis tickFormatter={(value) => `$${Math.abs(value)/100}`} />
                <Tooltip
                  formatter={(value: any) => formatCurrency(Math.abs(Number(value)))}
                  labelFormatter={(label) => format(new Date(label + '-02'), 'MMMM yyyy')}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 6, fill: '#3b82f6' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Top Merchants */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1">
          <h2 className="text-lg font-semibold mb-6 flex items-center">
            <Store className="w-5 h-5 mr-2 text-purple-500" />
            Top Merchants
          </h2>
          <div className="space-y-6">
            {topMerchants.data?.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No merchant data for this period.</p>
            ) : (
              topMerchants.data?.map((merchant, index) => {
                const maxSpending = topMerchants.data?.[0]?.total || 0;
                const percentage = maxSpending > 0 ? (merchant.total / maxSpending) * 100 : 0;

                return (
                  <div key={merchant.name + index} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{merchant.name}</p>
                        <p className="text-xs text-gray-500">{merchant.transactionCount} transactions</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(merchant.total)}</p>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, color, "data-testid": testId }: {
  title: string,
  value: string,
  color: 'green' | 'red' | 'blue',
  "data-testid"?: string
}) {
  const colors = {
    green: 'text-green-600 bg-green-50',
    red: 'text-red-600 bg-red-50',
    blue: 'text-blue-600 bg-blue-50',
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100" data-testid={testId}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{title}</p>
      <p className={`text-xl font-bold ${colors[color].split(' ')[0]}`}>{value}</p>
    </div>
  );
}
