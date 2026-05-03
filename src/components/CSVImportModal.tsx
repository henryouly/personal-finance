import { useState, useEffect } from 'react';
import { trpc } from '../utils/trpc';
import { formatCurrency } from '../domain/accounting';
import {
  Upload,
  X,
  ChevronRight,
  Check,
  AlertTriangle,
  Loader2,
  Table as TableIcon,
  ChevronLeft
} from 'lucide-react';
import { cn } from '../utils/ui';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  targetAccountId?: string;
}

type Phase = 'upload' | 'mapping' | 'preview' | 'success';

export function CSVImportModal({ isOpen, onClose, onSuccess, targetAccountId }: CSVImportModalProps) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [csvData, setCsvData] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  const activeAccountId = targetAccountId || selectedAccountId;

  const [mapping, setMapping] = useState({
    date: -1,
    description: -1,
    amount: -1,
  });

  const [importRows, setImportRows] = useState<any[]>([]);
  const [selectedIndices, setSelectedRows] = useState<Set<number>>(new Set());

  const parseCSV = trpc.transactions.parseCSV.useQuery(
    { csvData },
    {
      enabled: !!csvData && phase === 'mapping',
    } as any
  );

  const previewImport = trpc.transactions.previewImport.useQuery(
    {
      csvData,
      mapping: { date: mapping.date, description: mapping.description, amount: mapping.amount },
      targetAccountId: activeAccountId
    },
    {
      enabled: phase === 'preview' && !!activeAccountId,
    }
  );

  useEffect(() => {
    if (previewImport.data) {
      const data = previewImport.data;
      setTimeout(() => {
        setImportRows(data.map((r: any, i: number) => ({
          ...r,
          index: i,
          accountId: r.suggestedAccountId || ''
        })));
        setSelectedRows(new Set(data.map((r: any, i: number) => r.isDuplicate ? -1 : i).filter((i: number) => i !== -1)));
      }, 0);
    }
  }, [previewImport.data]);

  const bulkCreate = trpc.transactions.bulkCreate.useMutation({
    onSuccess: () => {
      setPhase('success');
      onSuccess();
    }
  });

  const accounts = trpc.accounts.list.useQuery();

  useEffect(() => {
    if (isOpen) {
      accounts.refetch();
    } else {
      // Reset state on close after a tick to avoid cascading renders
      setTimeout(() => {
        setPhase('upload');
        setCsvData('');
        setFileName('');
        setSelectedAccountId('');
        setImportRows([]);
        setSelectedRows(new Set());
      }, 0);
    }
  }, [isOpen, accounts]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvData(text);
      setPhase('mapping');
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    const selectedData = importRows
      .filter((_, i) => selectedIndices.has(i))
      .map(r => ({
        date: r.date,
        description: r.description,
        amountCents: r.amountCents,
        accountId: r.accountId,
      }));

    const invalidRows = selectedData.filter(r => !r.accountId);
    if (invalidRows.length > 0) {
      alert(`Please select a category for all selected transactions (${invalidRows.length} missing).`);
      return;
    }

    bulkCreate.mutate({
      targetAccountId: activeAccountId,
      transactions: selectedData
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]" data-testid="csv-import-modal">
      <div className={cn(
        "bg-white rounded-2xl shadow-xl flex flex-col transition-all duration-300 overflow-hidden",
        phase === 'preview' ? "w-full max-w-5xl h-[80vh]" : "w-full max-w-lg"
      )}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Import Transactions</h2>
            <p className="text-xs text-gray-500">{fileName || 'Upload bank statement'}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Phase Indicator */}
        <div className="flex border-b border-gray-100">
          <PhaseStep active={phase === 'upload'} done={['mapping', 'preview', 'success'].includes(phase)} label="Upload" />
          <PhaseStep active={phase === 'mapping'} done={['preview', 'success'].includes(phase)} label="Map Columns" />
          <PhaseStep active={phase === 'preview'} done={phase === 'success'} label="Preview" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {phase === 'upload' && (
            <div className="space-y-6">
              {!targetAccountId && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Select Source Account</label>
                  <p className="text-xs text-gray-500 mb-2">Choose the account where these transactions occurred (e.g., your Checking account).</p>
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select an account...</option>
                    {accounts.data?.filter(a => ['asset', 'liability'].includes(a.type)).map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className={cn("space-y-6 py-4", !targetAccountId && !selectedAccountId ? "opacity-40 pointer-events-none" : "")}>
                <label className="border-2 border-dashed border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group">
                  <div className="p-4 bg-blue-50 rounded-full text-blue-600 group-hover:scale-110 transition-transform mb-4">
                    <Upload className="w-8 h-8" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Click or drag CSV file to upload</span>
                  <span className="text-xs text-gray-400 mt-1">Supports standard bank export formats</span>
                  <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                </label>

                <div className="bg-amber-50 rounded-xl p-4 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <div className="text-xs text-amber-800 space-y-1">
                    <p className="font-bold uppercase tracking-wider">Security Tip</p>
                    <p>Your data is processed locally first. Make sure your CSV contains headers for easier mapping.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {phase === 'mapping' && (
            <div className="space-y-6">
              {parseCSV.isLoading ? (
                <div className="flex flex-col items-center py-12 text-gray-500">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <p>Analyzing CSV structure...</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <MappingSelect
                      label="Transaction Date"
                      options={parseCSV.data?.headers || []}
                      value={mapping.date}
                      onChange={(val) => setMapping({...mapping, date: val})}
                    />
                    <MappingSelect
                      label="Description / Payee"
                      options={parseCSV.data?.headers || []}
                      value={mapping.description}
                      onChange={(val) => setMapping({...mapping, description: val})}
                    />
                    <MappingSelect
                      label="Amount"
                      options={parseCSV.data?.headers || []}
                      value={mapping.amount}
                      onChange={(val) => setMapping({...mapping, amount: val})}
                    />
                  </div>

                  <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                    <div className="px-4 py-2 bg-gray-100/50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase">Data Preview</div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr>
                            {parseCSV.data?.headers.map((h, i) => (
                              <th key={i} className="px-3 py-2 text-left border-r border-gray-100 font-semibold">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {parseCSV.data?.previewRows.map((row, i) => (
                            <tr key={i} className="border-t border-gray-100">
                              {row.map((cell, j) => (
                                <td key={j} className="px-3 py-2 text-gray-500 truncate max-w-[150px]">{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {phase === 'preview' && (
            <div className="h-full flex flex-col">
              {previewImport.isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                  <Loader2 className="w-10 h-10 animate-spin mb-4" />
                  <p className="font-medium">Auto-categorizing and scanning for duplicates...</p>
                </div>
              ) : (
                <div className="flex-1 overflow-auto rounded-xl border border-gray-200">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 w-10">
                          <input
                            type="checkbox"
                            checked={selectedIndices.size === importRows.length}
                            onChange={() => {
                              if (selectedIndices.size === importRows.length) setSelectedRows(new Set());
                              else setSelectedRows(new Set(importRows.map((_, i) => i)));
                            }}
                            className="rounded"
                          />
                        </th>
                        <th className="px-4 py-3 font-semibold text-gray-600 uppercase text-[10px]">Date</th>
                        <th className="px-4 py-3 font-semibold text-gray-600 uppercase text-[10px]">Description</th>
                        <th className="px-4 py-3 font-semibold text-gray-600 uppercase text-[10px]">Amount</th>
                        <th className="px-4 py-3 font-semibold text-gray-600 uppercase text-[10px]">Category Suggestion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {importRows.map((row, i) => (
                        <tr key={i} className={cn(
                          "hover:bg-gray-50 transition-colors",
                          row.isDuplicate ? "bg-amber-50/30" : ""
                        )}>
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedIndices.has(i)}
                              onChange={() => {
                                const next = new Set(selectedIndices);
                                if (next.has(i)) next.delete(i);
                                else next.add(i);
                                setSelectedRows(next);
                              }}
                              className="rounded"
                            />
                          </td>
                          <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{row.date}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{row.description}</span>
                              {row.isDuplicate && (
                                <span className="flex items-center text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">
                                  <AlertTriangle className="w-3 h-3 mr-1" /> DUPLICATE
                                </span>
                              )}
                            </div>
                          </td>
                          <td className={cn(
                            "px-4 py-3 font-bold text-right",
                            row.amountCents < 0 ? "text-red-600" : "text-green-600"
                          )}>
                            {formatCurrency(Math.abs(row.amountCents))}
                          </td>
                          <td className="px-4 py-3 min-w-[200px]">
                            <select
                              value={row.accountId}
                              onChange={(e) => {
                                const next = [...importRows];
                                next[i].accountId = e.target.value;
                                setImportRows(next);
                              }}
                              className={cn(
                                "w-full text-xs px-2 py-1.5 border border-gray-200 rounded-lg outline-none",
                                row.suggestedAccountId && !row.accountId ? "ring-2 ring-blue-100" : ""
                              )}
                            >
                              <option value="">Select Category</option>
                              {accounts.data?.filter(a => a.type === 'expense').map(a => {
                                console.log('Rendering category option:', a.name);
                                return <option key={a.id} value={a.id}>{a.name}</option>;
                              })}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {phase === 'success' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="p-4 bg-green-50 rounded-full text-green-600 animate-bounce">
                <Check className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold">Import Successful!</h3>
              <p className="text-gray-500 text-center">Transactions have been added to your ledger and balances updated.</p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {phase !== 'success' && (
          <div className="px-6 py-4 border-t border-gray-100 flex justify-between bg-gray-50/50">
            {phase !== 'upload' ? (
              <button
                onClick={() => setPhase(phase === 'preview' ? 'mapping' : 'upload')}
                className="flex items-center px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </button>
            ) : <div />}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              {phase === 'mapping' && (
                <button
                  onClick={() => {
                    console.log('Clicking Next, setting phase to preview');
                    setPhase('preview');
                  }}
                  disabled={mapping.date === -1 || mapping.description === -1 || mapping.amount === -1}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              )}
              {phase === 'preview' && (
                <button
                  onClick={handleImport}
                  disabled={selectedIndices.size === 0 || bulkCreate.isPending}
                  className="flex items-center px-6 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-black transition-colors disabled:opacity-50"
                >
                  {bulkCreate.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <TableIcon className="w-4 h-4 mr-2" />}
                  Import {selectedIndices.size} Transactions
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PhaseStep({ active, done, label }: { active: boolean, done: boolean, label: string }) {
  return (
    <div className={cn(
      "flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider transition-colors border-b-2",
      active ? "text-blue-600 border-blue-600" : done ? "text-green-600 border-green-600" : "text-gray-400 border-transparent"
    )}>
      <div className="flex items-center justify-center gap-1.5">
        {done ? <Check className="w-3 h-3" /> : null}
        {label}
      </div>
    </div>
  );
}

function MappingSelect({ label, options, value, onChange }: { label: string, options: string[], value: number, onChange: (val: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="flex-1 max-w-[200px] text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value={-1}>Select CSV Column</option>
        {options.map((opt, i) => (
          <option key={i} value={i}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
