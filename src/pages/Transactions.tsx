import { useState } from 'react';
import { trpc } from '../utils/trpc';
import { formatCurrency } from '../domain/accounting';
import { Plus, Search, Filter, Download, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface JournalEntry {
  id: string;
  transactionId: string;
  accountId: string;
  amount: number;
  memo: string | null;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  status: string | null;
  source: string | null;
  entries: JournalEntry[];
}

export default function Transactions() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [search, setSearch] = useState('');
  
  const transactions = trpc.transactions.list.useQuery();
  const accounts = trpc.accounts.list.useQuery();
  
  const createTransaction = trpc.transactions.create.useMutation({
    onSuccess: () => {
      transactions.refetch();
      closeModal();
    }
  });

  const updateTransaction = trpc.transactions.update.useMutation({
    onSuccess: () => {
      transactions.refetch();
      closeModal();
    }
  });

  const deleteTransaction = trpc.transactions.delete.useMutation({
    onSuccess: () => {
      transactions.refetch();
    }
  });

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    fromAccountId: '',
    toAccountId: '',
  });

  const openModal = (tx?: Transaction) => {
    if (tx) {
      setEditingTransaction(tx);
      const fromEntry = tx.entries.find(e => e.amount < 0);
      const toEntry = tx.entries.find(e => e.amount > 0);
      
      setFormData({
        date: tx.date,
        description: tx.description,
        amount: (Math.abs(toEntry?.amount || fromEntry?.amount || 0) / 100).toString(),
        fromAccountId: fromEntry?.accountId || '',
        toAccountId: toEntry?.accountId || '',
      });
    } else {
      setEditingTransaction(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        fromAccountId: '',
        toAccountId: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Math.round(parseFloat(formData.amount) * 100);
    const payload = {
      date: formData.date,
      description: formData.description,
      entries: [
        { accountId: formData.fromAccountId, amount: -amount },
        { accountId: formData.toAccountId, amount: amount },
      ]
    };

    if (editingTransaction) {
      updateTransaction.mutate({
        id: editingTransaction.id,
        ...payload
      });
    } else {
      createTransaction.mutate(payload);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Import CSV
          </button>
          <button 
            onClick={() => openModal()}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Transaction
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search transactions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <button className="flex items-center px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </button>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category / Account</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.isLoading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading transactions...</td></tr>
            ) : transactions.data?.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No transactions found.</td></tr>
            ) : transactions.data?.map(tx => {
              const displayAmount = tx.entries.find(e => e.amount > 0)?.amount || tx.entries[0].amount;
              const isDeleting = deleteTransaction.isPending && deleteTransaction.variables === tx.id;
              
              return (
                <tr 
                  key={tx.id} 
                  onClick={() => openModal(tx)}
                  className="hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {format(new Date(tx.date + 'T00:00:00'), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                    <p className="text-xs text-gray-400 capitalize">{tx.source}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {tx.entries.map(e => accounts.data?.find(a => a.id === e.accountId)?.name).join(' → ')}
                  </td>
                  <td className={cn(
                    "px-6 py-4 text-sm font-semibold text-right",
                    displayAmount < 0 ? 'text-red-600' : 'text-green-600'
                  )}>
                    {formatCurrency(Math.abs(displayAmount))}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={(e) => handleDelete(e, tx.id)}
                      disabled={isDeleting}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                    >
                      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-6">
              {editingTransaction ? 'Edit Transaction' : 'New Transaction'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input 
                  type="text" 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Starbucks Coffee"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Account</label>
                  <select 
                    value={formData.fromAccountId}
                    onChange={e => setFormData({...formData, fromAccountId: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  >
                    <option value="">Select Account</option>
                    {accounts.data?.filter(a => ['asset', 'liability'].includes(a.type)).map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category / To</label>
                  <select 
                    value={formData.toAccountId}
                    onChange={e => setFormData({...formData, toAccountId: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  >
                    <option value="">Select Category</option>
                    {accounts.data?.filter(a => ['expense', 'income', 'asset'].includes(a.type)).map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
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
                  disabled={createTransaction.isPending || updateTransaction.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {(createTransaction.isPending || updateTransaction.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editingTransaction ? 'Update Transaction' : 'Save Transaction'}
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
