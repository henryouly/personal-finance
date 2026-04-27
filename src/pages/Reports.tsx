import { useState } from 'react';
import { trpc } from '../utils/trpc';
import { formatCurrency } from '../domain/accounting';
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
  Line
} from 'recharts';
import { Calendar } from 'lucide-react';

export default function Reports() {
  const [dateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString(),
    endDate: new Date().toISOString(),
  });

  const categorySpending = trpc.analytics.categorySpending.useQuery(dateRange);
  const incomeVsExpense = trpc.analytics.incomeVsExpense.useQuery(dateRange);
  const monthlySpending = trpc.analytics.monthlySpending.useQuery({ months: 6 });

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const ivsEData = [
    { name: 'Income', value: incomeVsExpense.data?.income || 0 },
    { name: 'Expense', value: incomeVsExpense.data?.expense || 0 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Last 30 Days</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-6">Spending by Category</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categorySpending.data || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="total"
                  nameKey="categoryName"
                >
                  {(categorySpending.data || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => formatCurrency(Math.abs(Number(value)))}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Income vs Expense */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-6">Income vs Expenses</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ivsEData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${value/100}`} />
                <Tooltip 
                  formatter={(value: any) => formatCurrency(Number(value))}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {ivsEData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'Income' ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Spending Trends */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-6">Spending Trends</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlySpending.data || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${Math.abs(value)/100}`} />
                <Tooltip 
                  formatter={(value: any) => formatCurrency(Math.abs(Number(value)))}
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
      </div>
    </div>
  );
}
