import { useState } from 'react';
import { trpc } from '../utils/trpc';
import { formatCurrency } from '../domain/accounting';
import { Plus, Wallet, MoreVertical } from 'lucide-react';

export default function Accounts() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const accounts = trpc.accounts.list.useQuery();
  const createAccount = trpc.accounts.create.useMutation({
    onSuccess: () => {
      accounts.refetch();
      setIsModalOpen(false);
    }
  });

  const [formData, setFormData] = useState({
    name: '',
    type: 'asset' as const,
    color: '#3b82f6',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAccount.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.isLoading ? (
          <p>Loading...</p>
        ) : accounts.data?.map(account => (
          <div key={account.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gray-50" style={{ color: account.color || '#3b82f6' }}>
                  <Wallet className="w-6 h-6" />
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
              <h3 className="text-lg font-bold text-gray-900">{account.name}</h3>
              <p className="text-sm text-gray-500 capitalize">{account.type}</p>
            </div>
            <div className="mt-6">
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(0)}</p>
              <p className="text-xs text-gray-400 mt-1">Current Balance</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal - Simplified */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-6">Add New Account</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="e.g. Chase Checking"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select 
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as any})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="asset">Checking / Savings</option>
                  <option value="liability">Credit Card / Loan</option>
                  <option value="equity">Investment</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Theme Color</label>
                <input 
                  type="color" 
                  value={formData.color}
                  onChange={e => setFormData({...formData, color: e.target.value})}
                  className="w-full h-10 p-1 border border-gray-300 rounded-lg cursor-pointer"
                />
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
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
