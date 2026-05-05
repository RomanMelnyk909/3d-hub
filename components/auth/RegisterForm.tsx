'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { registrationSchema, type RegistrationInput } from '@/lib/validations'
import type { AsyncState } from '@/types/api'

export function RegisterForm() {
  const router = useRouter()
  const [state, setState] = useState<AsyncState>('idle')
  const [showLoginLink, setShowLoginLink] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    mode: 'onSubmit',
  })

  const onSubmit = async (data: RegistrationInput) => {
    setState('loading')
    setShowLoginLink(false)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.status === 409) {
        setError('email', { message: 'Email already in use' })
        setShowLoginLink(true)
        setState('error')
        return
      }

      if (!res.ok) {
        toast.error('Registration failed. Please try again.')
        setState('error')
        return
      }

      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setState('error')
        toast.error('Account created. Please log in.')
        router.push('/login')
      } else {
        setState('idle')
        toast.success('Welcome to 3D Hub!')
        router.push('/')
      }
    } catch {
      toast.error('Registration failed. Please try again.')
      setState('error')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...register('email')}
          className="mt-1"
        />
        {errors.email && (
          <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
        )}
        {showLoginLink && (
          <p className="text-sm mt-1">
            <Link href="/login" className="text-brand-primary hover:underline">
              Log in instead
            </Link>
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register('password')}
          className="mt-1"
        />
        {errors.password && (
          <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={state === 'loading'}>
        {state === 'loading' ? 'Creating account…' : 'Create account'}
      </Button>

      <p className="text-sm text-center text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="text-brand-primary hover:underline">
          Log in
        </Link>
      </p>
    </form>
  )
}
