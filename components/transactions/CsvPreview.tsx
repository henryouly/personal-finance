'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  { value: 'date', label: 'Date (Required)', required: true },
  { value: 'amount', label: 'Amount (Required)', required: true },
  { value: 'description', label: 'Description (Required)', required: true },
  { value: 'category', label: 'Category', required: false },
];

type CsvPreviewProps = {
  data: any[];
  headers: string[];
  fieldMappings: Record<string, TransactionField>;
  onFieldMappingChange: (header: string, field: TransactionField) => void;
};

export function CsvPreview({ 
  data, 
  headers, 
  fieldMappings, 
  onFieldMappingChange 
}: CsvPreviewProps) {
  if (!data || data.length === 0) {
    return <div className="text-gray-500">No data to preview</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
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
                          {field.label}
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
          {data.slice(0, 10).map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {headers.map((header, cellIndex) => (
                <TableCell key={`${rowIndex}-${cellIndex}`}>
                  {row[header] || ''}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {data.length > 10 && (
        <div className="p-2 text-sm text-gray-500 text-center">
          Showing 10 of {data.length} rows
        </div>
      )}
    </div>
  );
}
