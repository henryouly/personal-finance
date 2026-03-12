import { trpc } from '../utils/trpc';
import { formatCurrency } from '../domain/accounting';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight, 
} from 'lucide-react';

export default function Dashboard() {
  const accounts = trpc.accounts.list.useQuery({ classification: 'asset' });
  const ivsE = trpc.analytics.incomeVsExpense.useQuery({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
    endDate: new Date().toISOString()
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
          amount={formatCurrency(0)} // Placeholder
          icon={Wallet}
          color="blue"
        />
        <Card 
          title="Monthly Income" 
          amount={formatCurrency(ivsE.data?.income || 0)} 
          icon={TrendingUp}
          color="green"
          subtext="+12% from last month"
        />
        <Card 
          title="Monthly Expenses" 
          amount={formatCurrency(ivsE.data?.expense || 0)} 
          icon={TrendingDown}
          color="red"
          subtext="-5% from last month"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Accounts */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Wallet className="w-5 h-5 mr-2 text-blue-500" />
            Your Accounts
          </h2>
          <div className="space-y-4">
            {accounts.isLoading ? (
              <p>Loading...</p>
            ) : accounts.data?.map(account => (
              <div key={account.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center">
                  <div className="w-2 h-8 rounded-full mr-3" style={{ backgroundColor: account.color || '#3b82f6' }} />
                  <div>
                    <p className="font-medium text-gray-900">{account.name}</p>
                    <p className="text-xs text-gray-500 uppercase">{account.type}</p>
                  </div>
                </div>
                <p className="font-semibold text-gray-900">{formatCurrency(0)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center justify-center p-4 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors">
              <Plus className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">Add Transaction</span>
            </button>
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

function Plus({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
  )
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

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
