'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Category } from '@/lib/db/categories'

interface SearchFiltersProps {
  categories: Category[]
  totalResults: number
  query: string
}

export function SearchFilters({ categories, totalResults, query }: SearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get('sort') ?? 'downloads'
  const currentCategory = searchParams.get('category')

  function updateFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="space-y-4 mb-6">
      <p className="text-sm text-text-muted">
        {totalResults} result{totalResults !== 1 ? 's' : ''} for{' '}
        <span className="text-text-primary font-medium">&apos;{query}&apos;</span>
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <select
          value={currentSort}
          onChange={e => updateFilter('sort', e.target.value)}
          className="text-sm border border-border rounded-md px-3 py-1.5 bg-bg-card text-text-primary focus:outline-none focus:border-brand-primary"
        >
          <option value="downloads">Most Downloaded</option>
          <option value="newest">Newest</option>
          <option value="az">A–Z</option>
        </select>

        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat.slug}
              onClick={() => updateFilter('category', currentCategory === cat.slug ? null : cat.slug)}
              className={cn(
                'shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors',
                currentCategory === cat.slug
                  ? 'bg-brand-primary text-white'
                  : 'bg-bg-card border border-border text-text-muted hover:border-brand-primary hover:text-brand-primary'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
