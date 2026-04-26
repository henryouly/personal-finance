import { useState } from 'react';
import { trpc } from '../utils/trpc';
import { formatCurrency } from '../domain/accounting';
import { Plus, Search, Filter, Download, Trash2, Loader2, CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useSearchParams } from 'react-router-dom';

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
  status: 'pending' | 'cleared' | 'reconciled' | null;
  source: string | null;
  entries: JournalEntry[];
}

export default function Transactions() {
  const [searchParams] = useSearchParams();
  const accountId = searchParams.get('accountId');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isSplitMode, setIsSplitMode] = useState(false);
  const [search, setSearch] = useState('');
  
  const transactions = trpc.transactions.list.useQuery({ accountId: accountId ?? undefined });
  const accounts = trpc.accounts.list.useQuery();
  const selectedAccount = accounts.data?.find(a => a.id === accountId);
  
  const createTransaction = trpc.transactions.create.useMutation({
    onSuccess: () => {
      transactions.refetch();
      accounts.refetch();
      closeModal();
    }
  });

  const updateTransaction = trpc.transactions.update.useMutation({
    onSuccess: () => {
      transactions.refetch();
      accounts.refetch();
      closeModal();
    }
  });

  const updateStatus = trpc.transactions.updateStatus.useMutation({
    onSuccess: () => {
      transactions.refetch();
      accounts.refetch();
    }
  });

  const deleteTransaction = trpc.transactions.delete.useMutation({
    onSuccess: () => {
      transactions.refetch();
      accounts.refetch();
    }
  });

  const reconcile = trpc.accounts.reconcile.useMutation({
    onSuccess: () => {
      transactions.refetch();
      accounts.refetch();
      setIsReconcileModalOpen(false);
    }
  });

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    entries: [
      { accountId: '', amount: '' },
      { accountId: accountId ?? '', amount: '' },
    ]
  });

  const [reconcileData, setReconcileData] = useState({
    statementDate: new Date().toISOString().split('T')[0],
    statementBalance: '',
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
    setIsSplitMode(false);
  };

  const openModal = (tx?: Transaction) => {
    if (tx) {
      setEditingTransaction(tx);
      const isSplit = tx.entries.length > 2;
      setIsSplitMode(isSplit);
      
      setFormData({
        date: tx.date,
        description: tx.description,
        entries: tx.entries.map(e => ({
          accountId: e.accountId,
          amount: (Math.abs(e.amount) / 100).toString(),
        }))
      });
    } else {
      setEditingTransaction(null);
      setIsSplitMode(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        entries: [
          { accountId: '', amount: '' },
          { accountId: accountId ?? '', amount: '' },
        ]
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let entries;
    if (!isSplitMode) {
      const amount = Math.round(parseFloat(formData.entries[1].amount || formData.entries[0].amount) * 100);
      entries = [
        { accountId: formData.entries[0].accountId, amount: -amount },
        { accountId: formData.entries[1].accountId, amount: amount },
      ];
    } else {
      entries = formData.entries.map((entry, i) => ({
        accountId: entry.accountId,
        amount: Math.round(parseFloat(entry.amount) * 100) * (i === 0 ? -1 : 1)
      }));
    }

    const payload = {
      date: formData.date,
      description: formData.description,
      entries
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

  const handleStatusToggle = (e: React.MouseEvent, tx: Transaction) => {
    e.stopPropagation();
    if (tx.status === 'reconciled' || updateStatus.isPending) return;
    const nextStatus = tx.status === 'cleared' ? 'pending' : 'cleared';
    updateStatus.mutate({ id: tx.id, status: nextStatus });
  };

  const handleReconcileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId) return;
    reconcile.mutate({
      accountId,
      statementDate: reconcileData.statementDate,
      statementBalance: Math.round(parseFloat(reconcileData.statementBalance) * 100),
    });
  };

  const variance = accountId 
    ? (selectedAccount?.clearedBalance ?? 0) - (Math.round(parseFloat(reconcileData.statementBalance || '0') * 100))
    : 0;

  const filteredTransactions = transactions.data?.filter(tx => 
    tx.description.toLowerCase().includes(search.toLowerCase())
  );

  const getAccountFullName = (accountId: string): string => {
    const account = accounts.data?.find(a => a.id === accountId);
    if (!account) return 'Unknown';
    if (account.parentId) {
      return `${getAccountFullName(account.parentId)} > ${account.name}`;
    }
    return account.name;
  };

  const totalOutOfBalance = formData.entries.reduce((acc, curr, i) => {
    const val = Math.round(parseFloat(curr.amount || '0') * 100);
    return acc + (i === 0 ? -val : val);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {selectedAccount ? `${selectedAccount.name} Transactions` : 'Transactions'}
          </h1>
          {selectedAccount && (
            <div className="flex items-center gap-4 mt-1">
              <p className="text-sm text-gray-500">
                Current: <span className="font-semibold text-gray-900">{formatCurrency(selectedAccount.totalBalance ?? 0)}</span>
              </p>
              <p className="text-sm text-gray-500">
                Cleared: <span className="font-semibold text-blue-600">{formatCurrency(selectedAccount.clearedBalance ?? 0)}</span>
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {accountId && (
            <button 
              onClick={() => setIsReconcileModalOpen(true)}
              className="flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Reconcile
            </button>
          )}
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
              <th className="px-3 py-4 w-10"></th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category / Account</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.isLoading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading transactions...</td></tr>
            ) : filteredTransactions?.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No transactions found.</td></tr>
            ) : filteredTransactions?.map(tx => {
              const positiveEntries = tx.entries.filter(e => e.amount > 0);
              const displayAmount = positiveEntries.length > 0 
                ? positiveEntries.reduce((acc, curr) => acc + curr.amount, 0)
                : tx.entries[0].amount;
                
              const isDeleting = deleteTransaction.isPending && deleteTransaction.variables === tx.id;
              const isUpdatingStatus = updateStatus.isPending && updateStatus.variables?.id === tx.id;
              
              return (
                <tr 
                  key={tx.id} 
                  onClick={() => openModal(tx)}
                  className="hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  <td className="px-3 py-4">
                    <button 
                      onClick={(e) => handleStatusToggle(e, tx)}
                      disabled={isUpdatingStatus}
                      className={cn(
                        "transition-colors disabled:opacity-50",
                        tx.status === 'reconciled' ? 'text-green-600 cursor-default' :
                        tx.status === 'cleared' ? 'text-blue-600 hover:text-blue-700' :
                        'text-gray-300 hover:text-gray-400'
                      )}
                    >
                      {isUpdatingStatus ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        tx.status === 'reconciled' ? <CheckCircle className="w-5 h-5" /> :
                        tx.status === 'cleared' ? <CheckCircle className="w-5 h-5" /> :
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {format(new Date(tx.date + 'T00:00:00'), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                    <p className="text-xs text-gray-400 capitalize">{tx.source ?? 'manual'}</p>
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

      {/* Modal - Transaction */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {editingTransaction ? 'Edit Transaction' : 'New Transaction'}
              </h2>
              <button 
                type="button"
                onClick={() => setIsSplitMode(!isSplitMode)}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                {isSplitMode ? 'Simple Mode' : 'Split Transaction'}
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
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
              </div>

              {!isSplitMode ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">From Account</label>
                      <select 
                        value={formData.entries[0].accountId}
                        onChange={e => {
                          const newEntries = [...formData.entries];
                          newEntries[0].accountId = e.target.value;
                          setFormData({ ...formData, entries: newEntries });
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      >
                        <option value="">{accounts.isLoading ? 'Loading accounts...' : 'Select Account'}</option>
                        {accounts.data?.filter(a => ['asset', 'liability'].includes(a.type)).map(a => (
                          <option key={a.id} value={a.id}>{getAccountFullName(a.id)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">To Account / Category</label>
                      <select 
                        value={formData.entries[1].accountId}
                        onChange={e => {
                          const newEntries = [...formData.entries];
                          newEntries[1].accountId = e.target.value;
                          setFormData({ ...formData, entries: newEntries });
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      >
                        <option value="">{accounts.isLoading ? 'Loading categories...' : 'Select Category'}</option>
                        {accounts.data?.filter(a => ['expense', 'income', 'asset'].includes(a.type)).map(a => (
                          <option key={a.id} value={a.id}>{getAccountFullName(a.id)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={formData.entries[1].amount || formData.entries[0].amount}
                      onChange={e => {
                        const newEntries = [...formData.entries];
                        newEntries[0].amount = e.target.value;
                        newEntries[1].amount = e.target.value;
                        setFormData({ ...formData, entries: newEntries });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Entries</h3>
                    <button 
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        entries: [...formData.entries, { accountId: '', amount: '' }]
                      })}
                      className="text-sm text-blue-600 font-medium hover:underline"
                    >
                      + Add Row
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.entries.map((entry, index) => (
                      <div key={index} className="flex gap-3 items-end">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                            {index === 0 ? 'Source Account' : `Split ${index}`}
                          </label>
                          <select 
                            value={entry.accountId}
                            onChange={e => {
                              const newEntries = [...formData.entries];
                              newEntries[index].accountId = e.target.value;
                              setFormData({ ...formData, entries: newEntries });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            required
                          >
                            <option value="">Select Account</option>
                            {accounts.data?.map(a => (
                              <option key={a.id} value={a.id}>{getAccountFullName(a.id)} ({a.type})</option>
                            ))}
                          </select>
                        </div>
                        <div className="w-32">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Amount</label>
                          <input 
                            type="number" 
                            step="0.01"
                            value={entry.amount}
                            onChange={e => {
                              const newEntries = [...formData.entries];
                              newEntries[index].amount = e.target.value;
                              setFormData({ ...formData, entries: newEntries });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="0.00"
                            required
                          />
                        </div>
                        {formData.entries.length > 2 && (
                          <button 
                            type="button"
                            onClick={() => {
                              const newEntries = formData.entries.filter((_, i) => i !== index);
                              setFormData({ ...formData, entries: newEntries });
                            }}
                            className="p-2 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-600">Remaining Balance</span>
                    <span className={cn(
                      "font-bold",
                      totalOutOfBalance === 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {formatCurrency(totalOutOfBalance)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={createTransaction.isPending || updateTransaction.isPending || (isSplitMode && totalOutOfBalance !== 0)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center font-semibold"
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

      {/* Modal - Reconcile */}
      {isReconcileModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-2">Reconcile {selectedAccount?.name}</h2>
            <p className="text-sm text-gray-500 mb-6">Compare your cleared balance against your bank statement.</p>
            
            <form onSubmit={handleReconcileSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statement Date</label>
                <input 
                  type="date" 
                  value={reconcileData.statementDate}
                  onChange={e => setReconcileData({...reconcileData, statementDate: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statement Ending Balance ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={reconcileData.statementBalance}
                  onChange={e => setReconcileData({...reconcileData, statementBalance: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Cleared Balance</span>
                  <span className="font-semibold">{formatCurrency(selectedAccount?.clearedBalance ?? 0)}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
                  <span className="text-gray-500">Variance</span>
                  <span className={cn(
                    "font-bold",
                    variance === 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {formatCurrency(variance)}
                  </span>
                </div>
              </div>

              {variance !== 0 && (
                <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p>Variance must be zero to finalize reconciliation. Please check your cleared transactions.</p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsReconcileModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={variance !== 0 || reconcile.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {reconcile.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Finalize
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
