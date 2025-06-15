'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';

export default function AccountSummary() {
  const trpc = useTRPC();
  const { data: accounts, isLoading, error } = useQuery(trpc.getAllAccounts.queryOptions());

  if (isLoading) {
    return (
      <div className="col-span-1 md:col-span-4 flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !accounts) {
    return (
      <div className="col-span-1 md:col-span-4 p-4 text-center text-destructive">
        {error?.message || 'Failed to load accounts'}
      </div>
    );
  }

  // Calculate total balance from accounts
  const totalBalance = accounts.reduce((sum: number, account) => sum + Number(account.balance), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <>
      <Card className="col-span-1 md:col-span-3">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Total Balance</h3>
            <span className="text-2xl font-bold">{formatCurrency(totalBalance)}</span>
          </div>
        </CardContent>
      </Card>

      {accounts.map((account: any) => (
        <Card key={account.id} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div
                className="w-3 h-12 rounded-full"
                style={{ backgroundColor: account.color }}
              />
              <div className="flex-1">
                <h3 className="font-medium">{account.name}</h3>
                <p className="text-sm text-muted-foreground capitalize">{account.type}</p>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${account.balance < 0 ? 'text-red-500' : ''}`}>
                  {formatCurrency(account.balance)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}