import { Suspense } from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { searchModels } from '@/lib/db/search'
import { listCategories } from '@/lib/db/categories'
import type { Category } from '@/lib/db/categories'
import { ModelCardGrid } from '@/components/model/ModelCardGrid'
import { SearchFilters } from '@/components/search/SearchFilters'
import type { SearchQuery } from '@/types/search'

interface SearchPageProps {
  searchParams: Promise<{ q?: string; category?: string; sort?: string; page?: string }>
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams
  const trimmedQ = q?.trim()
  return {
    title: trimmedQ ? `Search results for "${trimmedQ}" | 3D Hub` : 'Search | 3D Hub',
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const q = params.q?.trim() ?? ''
  const category = params.category ?? undefined
  const sort = (params.sort as SearchQuery['sort']) ?? 'downloads'
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)

  let categories: Category[] = []
  try {
    categories = listCategories()
  } catch (e) {
    console.error('[SearchPage] listCategories failed:', e)
  }

  if (!q) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-text-muted">Enter a search term to find models.</p>
        <Link href="/" className="text-brand-primary hover:text-brand-hover underline mt-2 inline-block">
          Browse all models
        </Link>
      </div>
    )
  }

  const result = searchModels({ q, category, sort, page })

  if (result.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-lg text-text-primary mb-4">No models found for &apos;{q}&apos;</p>
        <div className="flex gap-4">
          <Link
            href={`/search?q=${encodeURIComponent(q)}`}
            className="text-brand-primary hover:text-brand-hover underline"
          >
            Clear filters
          </Link>
          <Link href="/" className="text-brand-primary hover:text-brand-hover underline">
            Browse all models
          </Link>
        </div>
      </div>
    )
  }

  const paginationBase = `/search?q=${encodeURIComponent(q)}${category ? `&category=${encodeURIComponent(category)}` : ''}${sort !== 'downloads' ? `&sort=${encodeURIComponent(sort)}` : ''}&`

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Search Results</h1>
      <Suspense fallback={null}>
        <SearchFilters categories={categories} totalResults={result.total} query={q} />
      </Suspense>
      <ModelCardGrid models={result.items} />
      {(page > 1 || result.hasMore) && (
        <div className="mt-8 flex justify-center gap-6">
          {page > 1 && (
            <Link href={`${paginationBase}page=${page - 1}`} className="text-brand-primary hover:text-brand-hover underline">
              ← Previous
            </Link>
          )}
          {result.hasMore && (
            <Link href={`${paginationBase}page=${page + 1}`} className="text-brand-primary hover:text-brand-hover underline">
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
