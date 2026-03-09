import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from './utils/trpc';

export default function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/trpc',
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Dashboard />
      </QueryClientProvider>
    </trpc.Provider>
  );
}

function Dashboard() {
  const accounts = trpc.accounts.list.useQuery();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Finance Prototype</h1>
      </header>

      <main>
        <section>
          <h2 className="text-xl font-semibold mb-4">Accounts</h2>
          {accounts.isLoading ? (
            <p>Loading accounts...</p>
          ) : accounts.data?.length === 0 ? (
            <p className="text-gray-500">No accounts found. Start by adding one!</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {accounts.data?.map((account) => (
                <div key={account.id} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-medium">{account.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{account.type}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
