import { trpc } from '../utils/trpc';
import { formatCurrency } from '../domain/accounting';
import { format, startOfMonth } from 'date-fns';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight, 
  Plus,
  Target,
  ChevronRight,
} from 'lucide-react';
import { BudgetProgress } from '../components/BudgetProgress';
import { Link } from 'react-router-dom';
import { cn } from '../utils/ui';

export default function Dashboard() {
  const accounts = trpc.accounts.list.useQuery({ classification: 'asset' });
  const budgets = trpc.budgets.list.useQuery();
  const ivsE = trpc.analytics.incomeVsExpense.useQuery({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Financial Overview</h1>
        <p className="text-gray-500">Welcome back to your finance dashboard.</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          title="Total Balance" 
          amount={formatCurrency(accounts.data?.reduce((acc, a) => acc + a.totalBalance, 0) || 0)}
          icon={Wallet}
          color="blue"
        />
        <Card 
          title="Monthly Income" 
          amount={formatCurrency(ivsE.data?.income || 0)} 
          icon={TrendingUp}
          color="green"
        />
        <Card 
          title="Monthly Expenses" 
          amount={formatCurrency(ivsE.data?.expense || 0)} 
          icon={TrendingDown}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Accounts */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <Wallet className="w-5 h-5 mr-2 text-blue-500" />
              Your Accounts
            </h2>
            <Link to="/accounts" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
              View All
              <ChevronRight className="w-4 h-4 ml-0.5" />
            </Link>
          </div>
          <div className="space-y-4">
            {accounts.isLoading ? (
              <p className="text-center py-4 text-gray-500">Loading...</p>
            ) : accounts.data?.length === 0 ? (
              <p className="text-center py-4 text-gray-500">No accounts found.</p>
            ) : accounts.data?.slice(0, 5).map(account => (
              <div key={account.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center">
                  <div className="w-2 h-8 rounded-full mr-3" style={{ backgroundColor: account.color || '#3b82f6' }} />
                  <div>
                    <p className="font-medium text-gray-900">{account.name}</p>
                    <p className="text-xs text-gray-500 uppercase">{account.type}</p>
                  </div>
                </div>
                <p className="font-semibold text-gray-900">{formatCurrency(account.totalBalance)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Budget Overview */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <Target className="w-5 h-5 mr-2 text-red-500" />
              Budget Progress
            </h2>
            <Link to="/budgets" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
              View All
              <ChevronRight className="w-4 h-4 ml-0.5" />
            </Link>
          </div>
          <div className="space-y-6">
            {budgets.isLoading ? (
              <p className="text-center py-4 text-gray-500">Loading...</p>
            ) : budgets.data?.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                <p className="text-sm text-gray-500">No budgets set yet.</p>
                <Link to="/budgets" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                  Set a budget
                </Link>
              </div>
            ) : (
              budgets.data?.sort((a, b) => (b.currentSpent / b.limitAmount) - (a.currentSpent / a.limitAmount)).slice(0, 4).map(budget => (
                <Link key={budget.id} to="/budgets" className="block p-1 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{budget.accountName}</span>
                    <span className="text-xs text-gray-400 capitalize">{budget.period}</span>
                  </div>
                  <BudgetProgress 
                    currentSpent={budget.currentSpent} 
                    limitAmount={budget.limitAmount} 
                    compact 
                  />
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/transactions" className="flex flex-col items-center justify-center p-4 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors">
              <Plus className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">Add Transaction</span>
            </Link>
            <button className="flex flex-col items-center justify-center p-4 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors">
              <ArrowUpRight className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">Import CSV</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function Card({ title, amount, icon: Icon, color, subtext }: { 
  title: string, 
  amount: string, 
  icon: any, 
  color: 'blue' | 'green' | 'red',
  subtext?: string
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-2 rounded-lg", colors[color])}>
          <Icon className="w-6 h-6" />
        </div>
        {subtext && (
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            color === 'green' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          )}>
            {subtext}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{amount}</p>
      </div>
    </div>
  );
}

