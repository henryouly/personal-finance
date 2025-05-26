'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button'; // Import Button component

export type TransactionField =
  | 'skip'
  | 'date'
  | 'amount'
  | 'description'
  | 'category';

type FieldOption = {
  value: TransactionField;
  label: string;
  required: boolean;
};

export const TRANSACTION_FIELDS: FieldOption[] = [
  { value: 'skip', label: 'Skip', required: false },
  { value: 'date', label: 'Date', required: true },
  { value: 'amount', label: 'Amount', required: true },
  { value: 'description', label: 'Description', required: true },
  { value: 'category', label: 'Category', required: false },
];

type CsvPreviewProps = {
  data: any[];
  headers: string[];
  fieldMappings: Record<string, TransactionField>;
  onFieldMappingChange: (header: string, field: TransactionField) => void;
  selectedRows?: number[];
  onSelectedRowsChange?: (selectedRows: number[]) => void;
}

export function CsvPreview({
  data,
  headers,
  fieldMappings,
  onFieldMappingChange,
  selectedRows = [],
  onSelectedRowsChange = () => {}
}: CsvPreviewProps) {
  const [visibleRows, setVisibleRows] = useState(10);
  
  const loadMoreRows = () => {
    setVisibleRows(prev => Math.min(prev + 10, data.length));
  };
  
  const hasMoreRows = visibleRows < data.length;
  if (!data || data.length === 0) {
    return <div className="text-gray-500">No data to preview</div>;
  }

  const allSelected = data.length > 0 && selectedRows.length === data.length;
  const someSelected = selectedRows.length > 0 && !allSelected;

  const toggleRow = (rowIndex: number) => {
    const newSelected = [...selectedRows];
    const index = newSelected.indexOf(rowIndex);
    if (index === -1) {
      newSelected.push(rowIndex);
    } else {
      newSelected.splice(index, 1);
    }
    onSelectedRowsChange(newSelected);
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      onSelectedRowsChange([]);
    } else {
      onSelectedRowsChange(Array.from({ length: data.length }, (_, i) => i));
    }
  };

  return (
    <div className="rounded-md border">
      <div className="p-2 border-b bg-muted/50 text-sm">
        {selectedRows.length} of {data.length} rows selected
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  checked={allSelected}
                  ref={input => {
                    if (input) {
                      input.indeterminate = someSelected;
                    }
                  }}
                  onChange={toggleSelectAll}
                />
              </div>
            </TableHead>
            {headers.map((header, index) => (
              <TableHead key={index} className="font-medium">
                <div className="flex flex-col space-y-1">
                  <span>{header}</span>
                  <Select
                    value={fieldMappings[header] || 'skip'}
                    onValueChange={(value: TransactionField) => onFieldMappingChange(header, value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRANSACTION_FIELDS.map((field) => (
                        <SelectItem key={field.value} value={field.value}>
                          {field.label} {field.required ? ' (*)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.slice(0, visibleRows).map((row, rowIndex) => (
            <TableRow key={rowIndex} className={selectedRows.includes(rowIndex) ? 'bg-muted/50' : ''}>
              <TableCell className="w-12">
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    checked={selectedRows.includes(rowIndex)}
                    onChange={() => toggleRow(rowIndex)}
                  />
                </div>
              </TableCell>
              {headers.map((header, cellIndex) => (
                <TableCell key={`${rowIndex}-${cellIndex}`}>
                  {row[header] || ''}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="p-2 text-sm text-gray-500 text-center border-t">
        <div className="mb-2">
          Showing {Math.min(visibleRows, data.length)} of {data.length} rows
        </div>
        {hasMoreRows && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadMoreRows}
            className="w-full max-w-xs"
          >
            Load More
          </Button>
        )}
      </div>
    </div>
  );
}
