import { useState } from 'react';
import { trpc } from '../utils/trpc';
import { formatCurrency } from '../domain/accounting';
import { Plus, Target, AlertCircle, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { RouterOutputs } from '../utils/trpc';
import { useSearchParams } from 'react-router-dom';
import { BudgetProgress } from '../components/BudgetProgress';
import { cn } from '../utils/ui';

type AppBudget = RouterOutputs['budgets']['list'][number];

interface BudgetFormData {
  accountId: string;
  limitAmount: string;
  period: 'monthly' | 'yearly';
  startDate: string;
}

export default function Budgets() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialAccountId = searchParams.get('accountId') || '';
  
  const [isModalOpen, setIsModalOpen] = useState(!!initialAccountId);
  const [editingBudget, setEditingBudget] = useState<AppBudget | null>(null);
  const budgets = trpc.budgets.list.useQuery();
  const accounts = trpc.accounts.list.useQuery({ classification: 'expense' });
  
  const utils = trpc.useContext();

  const [formData, setFormData] = useState<BudgetFormData>({
    accountId: initialAccountId,
    limitAmount: '',
    period: 'monthly',
    startDate: format(new Date(), 'yyyy-MM-01'),
  });

  const createBudget = trpc.budgets.create.useMutation({
    onSuccess: () => {
      utils.budgets.list.invalidate();
      closeModal();
    },
    onError: (error) => {
      alert(error.message);
    }
  });

  const updateBudget = trpc.budgets.update.useMutation({
    onSuccess: () => {
      utils.budgets.list.invalidate();
      closeModal();
    }
  });

  const deleteBudget = trpc.budgets.delete.useMutation({
    onSuccess: () => {
      utils.budgets.list.invalidate();
    }
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBudget(null);
    setFormData({
      accountId: '',
      limitAmount: '',
      period: 'monthly',
      startDate: format(new Date(), 'yyyy-MM-01'),
    });
    // Clear search params when closing
    if (searchParams.get('accountId')) {
      setSearchParams({});
    }
  };

  const handleEdit = (budget: AppBudget) => {
    setEditingBudget(budget);
    setFormData({
      accountId: budget.accountId,
      limitAmount: (budget.limitAmount / 100).toString(),
      period: budget.period,
      startDate: budget.startDate,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      deleteBudget.mutate(id);
    }
  };

  const handlePeriodChange = (period: 'monthly' | 'yearly') => {
    const now = new Date();
    const startDate = period === 'monthly' 
      ? format(now, 'yyyy-MM-01')
      : format(now, 'yyyy-01-01');
    
    setFormData({ ...formData, period, startDate });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBudget) {
      updateBudget.mutate({
        id: editingBudget.id,
        limitAmount: Math.round(parseFloat(formData.limitAmount) * 100),
      });
    } else {
      createBudget.mutate({
        ...formData,
        limitAmount: Math.round(parseFloat(formData.limitAmount) * 100),
      });
    }
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
        ) : budgets.data?.map(budget => (
            <div key={budget.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 group">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{budget.accountName}</h3>
                  <p className="text-sm text-gray-500">
                    <span className="capitalize">{budget.period}</span> limit 
                    <span className="ml-1 text-xs text-gray-400">
                      ({budget.period === 'monthly' ? format(new Date(), 'MMMM yyyy') : format(new Date(), 'yyyy')})
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="hidden group-hover:flex items-center gap-2 mr-2">
                    <button 
                      onClick={() => handleEdit(budget)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(budget.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {budget.currentSpent > budget.limitAmount && <AlertCircle className="w-6 h-6 text-red-500" />}
                </div>
              </div>
              
              <div className="space-y-2">
                <BudgetProgress 
                  currentSpent={budget.currentSpent} 
                  limitAmount={budget.limitAmount} 
                />
                <div className="flex justify-start">
                  <p className="text-xs text-gray-400">
                    Tracked since: {new Date(budget.startDate + 'T00:00:00').toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-6">
              {editingBudget ? 'Edit Budget' : 'Set Category Budget'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  id="category"
                  value={formData.accountId}
                  onChange={e => setFormData({...formData, accountId: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                  required
                  disabled={!!editingBudget}
                >
                  <option value="">Select Category</option>
                  {accounts.data?.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="limitAmount" className="block text-sm font-medium text-gray-700 mb-1">Limit Amount ($)</label>
                <input 
                  id="limitAmount"
                  type="number" 
                  step="0.01"
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
                    disabled={!!editingBudget}
                    onClick={() => handlePeriodChange('monthly')}
                    className={cn(
                      "px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                      formData.period === 'monthly' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600',
                      editingBudget && formData.period !== 'monthly' && "opacity-50"
                    )}
                  >
                    Monthly
                  </button>
                  <button 
                    type="button"
                    disabled={!!editingBudget}
                    onClick={() => handlePeriodChange('yearly')}
                    className={cn(
                      "px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                      formData.period === 'yearly' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600',
                      editingBudget && formData.period !== 'yearly' && "opacity-50"
                    )}
                  >
                    Yearly
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input 
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData({...formData, startDate: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                  required
                  disabled={!!editingBudget}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Transactions on or after this date will be counted.
                </p>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingBudget ? 'Update' : 'Set Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
