'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Category } from '@/lib/db/categories'

interface CategoryPillsProps {
  categories: Category[]
}

export function CategoryPills({ categories }: CategoryPillsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const activeCategory = searchParams.get('category')

  function selectCategory(slug: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (activeCategory === slug) {
      params.delete('category')
    } else {
      params.set('category', slug)
    }
    params.delete('page')
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
      {categories.map(cat => (
        <button
          key={cat.slug}
          onClick={() => selectCategory(cat.slug)}
          aria-pressed={activeCategory === cat.slug}
          className={cn(
            'shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
            activeCategory === cat.slug
              ? 'bg-brand-primary text-white'
              : 'bg-bg-card border border-border text-text-muted hover:border-brand-primary hover:text-brand-primary'
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}
