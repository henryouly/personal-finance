'use client'

import { useSession } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Home() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    if (!isPending && session) {
      router.push('/dashboard')
    }
  }, [session, isPending, router])

  if (isPending || (isClient && session)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="font-bold">Finance App</h1>
          <div className="flex items-center gap-4">
            <a href="/sign-in" className="text-sm font-medium hover:underline">
              Sign in
            </a>
            <a 
              href="/sign-up" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors"
            >
              Sign up
            </a>
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <div className="container max-w-4xl py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Take Control of Your Finances
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Track your spending, set budgets, and achieve your financial goals.
            </p>
            <div className="flex gap-4 justify-center">
              <a 
                href="/sign-up" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors"
              >
                Get Started
              </a>
              <a 
                href="/sign-in" 
                className="border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 px-8 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
