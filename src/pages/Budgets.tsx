import { useState } from 'react';
import { trpc } from '../utils/trpc';
import { formatCurrency } from '../domain/accounting';
import { Plus, Target, AlertCircle } from 'lucide-react';

export default function Budgets() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const budgets = trpc.budgets.list.useQuery();
  const accounts = trpc.accounts.list.useQuery({ classification: 'expense' });
  
  const createBudget = trpc.budgets.create.useMutation({
    onSuccess: () => {
      budgets.refetch();
      setIsModalOpen(false);
    }
  });

  const [formData, setFormData] = useState({
    accountId: '',
    limitAmount: '',
    period: 'monthly' as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBudget.mutate({
      ...formData,
      limitAmount: parseInt(formData.limitAmount) * 100,
      startDate: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Set Budget
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.isLoading ? (
          <p>Loading...</p>
        ) : budgets.data?.length === 0 ? (
          <div className="md:col-span-2 bg-white p-12 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500">
            <Target className="w-12 h-12 mb-4 text-gray-300" />
            <p className="text-lg font-medium">No budgets set yet</p>
            <p className="text-sm">Stay on top of your spending by setting category limits.</p>
          </div>
        ) : budgets.data?.map(budget => {
          const percentage = Math.min((budget.currentSpent / budget.limitAmount) * 100, 100);
          const isOver = budget.currentSpent > budget.limitAmount;
          
          return (
            <div key={budget.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{budget.accountName}</h3>
                  <p className="text-sm text-gray-500 capitalize">{budget.period} limit</p>
                </div>
                {isOver && <AlertCircle className="w-6 h-6 text-red-500" />}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{formatCurrency(budget.currentSpent)} spent</span>
                  <span className="text-gray-500">of {formatCurrency(budget.limitAmount)}</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-500",
                      isOver ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-right text-xs text-gray-400">
                  {isOver ? 'Over budget' : `${(100 - percentage).toFixed(0)}% remaining`}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal - Simplified */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-6">Set Category Budget</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  value={formData.accountId}
                  onChange={e => setFormData({...formData, accountId: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="">Select Category</option>
                  {accounts.data?.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Limit Amount ($)</label>
                <input 
                  type="number" 
                  value={formData.limitAmount}
                  onChange={e => setFormData({...formData, limitAmount: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, period: 'monthly'})}
                    className={cn(
                      "px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                      formData.period === 'monthly' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600'
                    )}
                  >
                    Monthly
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, period: 'yearly'})}
                    className={cn(
                      "px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                      formData.period === 'yearly' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600'
                    )}
                  >
                    Yearly
                  </button>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Set Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
