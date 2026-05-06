'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { buttonVariants } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavbarActionsProps {
  user: { username: string } | null
}

export function NavbarActions({ user }: NavbarActionsProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!mobileOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [mobileOpen])

  return (
    <>
      {/* Desktop auth CTAs */}
      <nav className="hidden sm:flex items-center gap-3">
        {user ? (
          <>
            <Link href="/upload" className={cn(buttonVariants({ variant: 'default' }))}>
              Upload
            </Link>
            <span className="text-sm text-text-primary">{user.username}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className={cn(buttonVariants({ variant: 'ghost' }))}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className={cn(buttonVariants({ variant: 'ghost' }))}>
              Log in
            </Link>
            <Link href="/register" className={cn(buttonVariants({ variant: 'default' }))}>
              Sign up
            </Link>
          </>
        )}
      </nav>

      {/* Mobile hamburger */}
      <button
        className="sm:hidden p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-muted"
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        onClick={() => setMobileOpen((prev) => !prev)}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="absolute top-16 left-0 right-0 sm:hidden border-t border-border bg-bg-card px-4 pb-4 pt-2 flex flex-col gap-2">
          {user ? (
            <>
              <Link
                href="/upload"
                className={cn(buttonVariants({ variant: 'default' }), 'w-full')}
                onClick={() => setMobileOpen(false)}
              >
                Upload
              </Link>
              <span className="text-sm text-text-primary px-2 py-1">{user.username}</span>
              <button
                onClick={() => { setMobileOpen(false); signOut({ callbackUrl: '/' }) }}
                className={cn(buttonVariants({ variant: 'ghost' }), 'w-full justify-start')}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: 'ghost' }), 'w-full justify-start')}
                onClick={() => setMobileOpen(false)}
              >
                Log in
              </Link>
              <Link
                href="/register"
                className={cn(buttonVariants({ variant: 'default' }), 'w-full')}
                onClick={() => setMobileOpen(false)}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      )}
    </>
  )
}
