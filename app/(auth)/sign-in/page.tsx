import { AuthForm } from '@/components/auth/auth-form'
import { headers } from 'next/headers'

export default async function SignInPage() {
  const headersList = await headers();
  const redirectTo = headersList.get('referer') || '/dashboard'

  return (
    <div className="container relative min-h-[calc(100vh-200px)] flex items-center justify-center">
      <div className="lg:p-8 w-full">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <AuthForm type="signin" redirectTo={redirectTo} />
        </div>
      </div>
    </div>
  )
}
