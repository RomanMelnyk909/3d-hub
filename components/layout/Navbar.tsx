import Link from 'next/link'
import { auth } from '@/lib/auth'
import { NavbarActions } from './NavbarActions'

export async function Navbar() {
  const session = await auth()

  return (
    <header className="relative border-b border-border bg-bg-card sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="text-xl font-bold text-brand-primary hover:text-brand-hover transition-colors"
          >
            3D Hub
          </Link>
          <NavbarActions user={session?.user ?? null} />
        </div>
      </div>
    </header>
  )
}
