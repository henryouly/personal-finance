'use client'

import { useRouter } from 'next/navigation'
import { useSession, signOut } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Loader2, LogOut, User } from 'lucide-react'
import Image from 'next/image'

export function UserButton() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/')
          router.refresh()
        },
        onError: (error) => {
          console.error('Error signing out:', error)
        }
      }
    })
  }

  if (isPending) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 rounded-full"
          disabled
          aria-label="Loading user menu"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
        </Button>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => router.push('/sign-in')}>
          Sign in
        </Button>
        <Button size="sm" onClick={() => router.push('/sign-up')}>
          Sign up
        </Button>
      </div>
    )
  }

  const user = session.user
  const userInitial = user?.email?.[0]?.toUpperCase() || 'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 rounded-full p-0 hover:bg-accent/80 transition-colors"
          aria-label="User menu"
        >
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary/10 to-muted">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.email}
                width={24}
                height={24}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span className="text-sm font-medium">{userInitial}</span>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.name || user.email}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/dashboard/account')}>
          <User className="mr-2 h-4 w-4" />
          <span>Account</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
