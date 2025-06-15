'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signUp } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

type AuthFormProps = {
  type: 'signin' | 'signup'
  redirectTo?: string
}

export function AuthForm({ type, redirectTo = '/dashboard' }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const isSignIn = type === 'signin'
  const buttonText = isSignIn ? 'Sign in' : 'Create account'
  const linkText = isSignIn
    ? "Don't have an account? Sign up"
    : 'Already have an account? Sign in'
  const linkHref = isSignIn ? '/sign-up' : '/sign-in'

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string

    setIsLoading(true)
    setError(null)

    try {
      if (isSignIn) {
        const { error } = await signIn.email({ email, password })
        if (error) throw error
      } else {
        const { error } = await signUp.email({
          email,
          password,
          name: name || email.split('@')[0] // Use email prefix as name if not provided
        })
        if (error) throw error
      }

      await router.push(redirectTo)
      await router.refresh()
    } catch (error: any) {
      console.error('Auth error:', error)
      const errorMessage = error?.message || 'An error occurred during authentication'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col space-y-6 w-full max-w-md mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {isSignIn ? 'Welcome back' : 'Create an account'}
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          {isSignIn ? 'Enter your credentials to sign in' : 'Enter your details to create an account'}
        </p>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isSignIn && (
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium leading-none">
              Name
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Your name"
              autoComplete="name"
              disabled={isLoading}
              required={!isSignIn}
            />
          </div>
        )}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium leading-none">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium leading-none">
              Password
            </label>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete={isSignIn ? 'current-password' : 'new-password'}
            disabled={isLoading}
            minLength={6}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {buttonText}
        </Button>
      </form>

      <p className="px-8 text-center text-sm text-muted-foreground">
        <a
          href={linkHref}
          className="hover:text-primary underline underline-offset-4"
        >
          {linkText}
        </a>
      </p>
    </div>
  )
}
