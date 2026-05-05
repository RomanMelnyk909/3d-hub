import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { RegisterForm } from '@/components/auth/RegisterForm'

export default async function RegisterPage() {
  const session = await auth()
  if (session) redirect('/')

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Join 3D Hub to access platform features
          </p>
        </div>
        <RegisterForm />
      </div>
    </main>
  )
}
