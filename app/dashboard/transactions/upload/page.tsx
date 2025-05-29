'use client';

import { useState, useCallback, useMemo } from 'react';
import { useGetAccounts } from '@/hooks/use-accounts';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { CsvPreview, TransactionField, TRANSACTION_FIELDS } from '@/components/transactions/CsvPreview';

export default function UploadTransactions() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const { data: accounts, loading: accountsLoading } = useGetAccounts();
  const [fieldMappings, setFieldMappings] = useState<Record<string, TransactionField>>({});
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const handleFieldMappingChange = useCallback((header: string, field: TransactionField) => {
    setFieldMappings(prev => ({
      ...prev,
      [header]: field
    }));
  }, []);

  const requiredFields = useMemo(() =>
    TRANSACTION_FIELDS.filter(field => field.required).map(field => field.value),
    []
  );

  const isFormValid = useMemo(() => {
    return Object.values(requiredFields).every(field =>
      Object.values(fieldMappings).includes(field as TransactionField)
    ) && selectedAccountId !== '' && previewData.length > 0;
  }, [fieldMappings, selectedAccountId, previewData, requiredFields]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFieldMappings({});
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setSelectedRows([]);
    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(Boolean);

        if (lines.length === 0) {
          throw new Error('File is empty');
        }

        // Parse CSV headers (first line)
        const csvHeaders = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        setHeaders(csvHeaders);

        // Parse CSV data (remaining lines)
        const data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          return csvHeaders.reduce((obj, header, index) => {
            obj[header] = values[index] || '';
            return obj;
          }, {} as Record<string, string>);
        });

        setPreviewData(data);
      } catch (error) {
        console.error('Error parsing CSV:', error);
        // Handle error (e.g., show error message to user)
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      console.error('Error reading file');
      setIsLoading(false);
      // Handle error
    };

    reader.readAsText(selectedFile);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || previewData.length === 0 || selectedRows.length === 0) return;

    try {
      setIsLoading(true);

      // Filter to only include selected rows
      const transactionsToImport = selectedRows.map(index => {
        const row = previewData[index];
        const transaction: Record<string, string> = {};

        // Map the fields according to the field mappings
        Object.entries(fieldMappings).forEach(([header, field]) => {
          if (field !== 'skip' && row[header] !== undefined) {
            transaction[field] = row[header];
          }
        });

        // Ensure date is in ISO string format
        if (transaction.date) {
          const date = new Date(transaction.date);
          if (!isNaN(date.getTime())) {
            transaction.date = date.toISOString();
          }
        }

        transaction.accountId = selectedAccountId;

        return transaction;
      });

      console.log('Uploading selected transactions:', transactionsToImport);

      // Format transactions data according to the API schema
      const formattedTransactions = transactionsToImport.map(tx => ({
        date: tx.date, // Already in ISO string format from previous formatting
        description: tx.description,
        amount: tx.amount, // string
        accountId: tx.accountId,
        categoryId: tx.categoryId || undefined, // Send undefined instead of empty string if no category
      }));
      // Submit to API
      const response = await fetch('/api/transactions/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactions: formattedTransactions }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to import transactions');
      }

      console.log('Successfully imported transactions:', result);

      // On successful upload, redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Upload failed:', error);
      // Handle error (e.g., show error message to user)
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Upload Transactions</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Import Transactions</CardTitle>
          <CardDescription>
            Upload a CSV file containing your transaction data
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="account" className="block text-sm font-medium text-foreground">
                Select Account <span className="text-destructive">*</span>
              </label>
              <select
                id="account"
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:text-sm"
                disabled={accountsLoading || isLoading}
                required
              >
                <option value="">Select an account</option>
                {accounts?.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.type})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-2 text-muted-foreground"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">CSV (max. 10MB)</p>
                </div>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="hidden"
                  accept=".csv"
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
              </label>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : previewData.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Preview</h3>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Map each column to a transaction field. Required fields are marked with <span className="text-destructive">*</span>
                  </p>
                  <CsvPreview
                    data={previewData}
                    headers={headers}
                    fieldMappings={fieldMappings}
                    onFieldMappingChange={handleFieldMappingChange}
                    selectedRows={selectedRows}
                    onSelectedRowsChange={setSelectedRows}
                  />
                </div>
              </div>
            ) : null}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || selectedRows.length === 0 || isLoading}
            >
              {isLoading ? 'Importing...' : `Import ${selectedRows.length > 0 ? `(${selectedRows.length} transactions)` : ''}`}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
