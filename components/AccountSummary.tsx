'use client';

import { useEffect, useState } from 'react';
import { sampleAccounts } from '@/data/sampleData';
import { Account } from '@/types';
import { Card, CardContent } from '@/components/ui/card';

export default function AccountSummary() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);

  useEffect(() => {
    setAccounts(sampleAccounts);
    const total = sampleAccounts.reduce((sum, account) => sum + account.balance, 0);
    setTotalBalance(total);
  }, []);

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
      
      {accounts.map((account) => (
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