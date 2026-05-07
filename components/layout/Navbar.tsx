import Link from 'next/link'
import { auth } from '@/lib/auth'
import { NavbarActions } from './NavbarActions'
import { SearchBar } from '@/components/search/SearchBar'

export async function Navbar() {
  const session = await auth()

  return (
    <header className="relative border-b border-border bg-bg-card sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main row */}
        <div className="flex items-center h-16 gap-4">
          <Link
            href="/"
            className="text-xl font-bold text-brand-primary hover:text-brand-hover transition-colors shrink-0"
          >
            3D Hub
          </Link>
          {/* Desktop search */}
          <div className="hidden sm:flex flex-1 max-w-lg">
            <SearchBar />
          </div>
          <NavbarActions user={session?.user ?? null} />
        </div>
        {/* Mobile search row */}
        <div className="sm:hidden pb-3">
          <SearchBar />
        </div>
      </div>
    </header>
  )
}
