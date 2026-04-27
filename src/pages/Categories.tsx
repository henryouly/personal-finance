import { useState } from 'react';
import { trpc } from '../utils/trpc';
import { formatCurrency } from '../domain/accounting';
import { Plus, ChevronRight, ChevronDown, Trash2, Edit2, Folder, Tag, Loader2, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CategoryNode {
  id: string;
  name: string;
  type: string;
  parentId: string | null;
  totalBalance: number;
  clearedBalance: number;
  children: CategoryNode[];
}

export default function Categories() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [editingCategory, setEditingCategory] = useState<CategoryNode | null>(null);
  
  const accounts = trpc.accounts.list.useQuery();
  
  const createCategory = trpc.accounts.create.useMutation({
    onSuccess: () => {
      accounts.refetch();
      closeModal();
    }
  });

  const updateCategory = trpc.accounts.update.useMutation({
    onSuccess: () => {
      accounts.refetch();
      closeModal();
    }
  });

  const deleteCategory = trpc.accounts.delete.useMutation({
    onSuccess: () => {
      accounts.refetch();
    }
  });

  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as const,
    parentId: null as string | null,
    color: '#3b82f6',
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', type: 'expense', parentId: null, color: '#3b82f6' });
  };

  const openModal = (parentOrEdit?: string | CategoryNode, isEdit = false) => {
    if (isEdit && typeof parentOrEdit === 'object') {
      setEditingCategory(parentOrEdit);
      setFormData({
        name: parentOrEdit.name,
        type: parentOrEdit.type as any,
        parentId: parentOrEdit.parentId,
        color: '#3b82f6',
      });
    } else if (typeof parentOrEdit === 'string') {
      const parent = accounts.data?.find(a => a.id === parentOrEdit);
      setFormData({ 
        name: '', 
        type: (parent?.type as any) || 'expense', 
        parentId: parentOrEdit, 
        color: '#3b82f6' 
      });
    } else {
      setFormData({ name: '', type: 'expense', parentId: null, color: '#3b82f6' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      updateCategory.mutate({
        id: editingCategory.id,
        name: formData.name,
        type: formData.type,
        parentId: formData.parentId,
      });
    } else {
      createCategory.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category? If it has transactions, it will be deactivated instead.')) {
      deleteCategory.mutate(id);
    }
  };

  const buildTree = (nodes: any[], parentId: string | null = null): CategoryNode[] => {
    return nodes
      .filter(node => node.parentId === parentId && (node.type === 'income' || node.type === 'expense'))
      .map(node => ({
        ...node,
        children: buildTree(nodes, node.id),
      }));
  };

  const incomeTree = buildTree(accounts.data || [], null).filter(n => n.type === 'income');
  const expenseTree = buildTree(accounts.data || [], null).filter(n => n.type === 'expense');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button 
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Category
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
            Income
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {incomeTree.length === 0 ? (
              <p className="p-8 text-center text-gray-500 text-sm">No income categories yet.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {incomeTree.map(node => (
                  <CategoryRow 
                    key={node.id} 
                    node={node} 
                    level={0} 
                    expanded={expanded} 
                    onToggle={(id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))}
                    onAddChild={(id) => openModal(id)}
                    onEdit={(node) => openModal(node, true)}
                    onDelete={handleDelete}
                    isDeleting={deleteCategory.isPending && deleteCategory.variables === node.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center">
            <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
            Expenses
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {expenseTree.length === 0 ? (
              <p className="p-8 text-center text-gray-500 text-sm">No expense categories yet.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {expenseTree.map(node => (
                  <CategoryRow 
                    key={node.id} 
                    node={node} 
                    level={0} 
                    expanded={expanded} 
                    onToggle={(id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))}
                    onAddChild={(id) => openModal(id)}
                    onEdit={(node) => openModal(node, true)}
                    onDelete={handleDelete}
                    isDeleting={deleteCategory.isPending && deleteCategory.variables === node.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-6">
              {editingCategory ? 'Edit Category' : formData.parentId ? 'Add Sub-category' : 'Add New Category'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input 
                  id="categoryName"
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Groceries"
                  required
                />
              </div>
              {!formData.parentId && (
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select 
                    id="type"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
              )}
              {formData.parentId && (
                <div className="p-3 bg-blue-50 rounded-lg text-blue-700 text-sm flex items-center">
                  <Folder className="w-4 h-4 mr-2" />
                  Parent: {accounts.data?.find(a => a.id === formData.parentId)?.name}
                </div>
              )}
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
                  disabled={createCategory.isPending || updateCategory.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {(createCategory.isPending || updateCategory.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryRow({ 
  node, 
  level, 
  expanded, 
  onToggle,
  onAddChild,
  onEdit,
  onDelete,
  isDeleting
}: { 
  node: CategoryNode, 
  level: number, 
  expanded: Record<string, boolean>,
  onToggle: (id: string) => void,
  onAddChild: (id: string) => void,
  onEdit: (node: CategoryNode) => void,
  onDelete: (id: string) => void,
  isDeleting: boolean
}) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expanded[node.id];

  return (
    <>
      <div 
        className="group flex items-center justify-between py-3 px-4 hover:bg-gray-50 transition-colors cursor-pointer"
        style={{ paddingLeft: `${(level * 20) + 16}px` }}
        onClick={() => hasChildren && onToggle(node.id)}
      >
        <div className="flex items-center flex-1">
          <div className="w-6 flex items-center justify-center mr-1">
            {hasChildren ? (
              isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />
            ) : (
              <Tag className="w-3 h-3 text-gray-300" />
            )}
          </div>
          <span className="text-sm font-medium text-gray-900">{node.name}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-gray-500">
            {formatCurrency(node.totalBalance)}
          </span>
          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
            {node.type === 'expense' && (
              <Link 
                to={`/budgets?accountId=${node.id}`}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                title="Set Budget"
                onClick={(e) => e.stopPropagation()}
              >
                <Target className="w-4 h-4" />
              </Link>
            )}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onAddChild(node.id);
              }}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
              title="Add Sub-category"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(node);
              }}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node.id);
              }}
              disabled={isDeleting}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
              title="Delete"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
      
      {hasChildren && isExpanded && (
        <div className="bg-gray-50/30">
          {node.children.map(child => (
            <CategoryRow 
              key={child.id} 
              node={child} 
              level={level + 1} 
              expanded={expanded} 
              onToggle={onToggle}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onDelete={onDelete}
              isDeleting={false} // Simplification: actual isDeleting checked at each row level
            />
          ))}
        </div>
      )}
    </>
  );
}
