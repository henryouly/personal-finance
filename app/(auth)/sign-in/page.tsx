import { AuthForm } from '@/components/auth/auth-form'

export default function SignInPage() {
  return (
    <div className="container relative min-h-[calc(100vh-200px)] flex items-center justify-center">
      <div className="lg:p-8 w-full">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <AuthForm type="signin" />
        </div>
      </div>
    </div>
  )
}
