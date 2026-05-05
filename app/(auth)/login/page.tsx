import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/auth/LoginForm'

function sanitizeCallbackUrl(url: string | undefined): string | undefined {
  if (typeof url !== 'string') return undefined
  // Only allow relative paths; reject external URLs and protocol-relative URLs
  if (!url.startsWith('/') || url.startsWith('//')) return undefined
  return url
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const { callbackUrl } = await searchParams
  const session = await auth()
  if (session) redirect('/')

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Log in to 3D Hub</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back</p>
        </div>
        <LoginForm callbackUrl={sanitizeCallbackUrl(callbackUrl)} />
      </div>
    </main>
  )
}
