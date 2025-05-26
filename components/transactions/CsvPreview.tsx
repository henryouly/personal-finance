'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type CsvPreviewProps = {
  data: any[];
  headers: string[];
};

export function CsvPreview({ data, headers }: CsvPreviewProps) {
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
                {header}
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
