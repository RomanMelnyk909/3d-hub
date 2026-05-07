import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getCategoryBySlug } from '@/lib/db/categories'
import { listPublishedModels } from '@/lib/db/models'
import { ModelCardGrid } from '@/components/model/ModelCardGrid'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = getCategoryBySlug(slug)
  if (!category) return { title: 'Category Not Found' }
  return {
    title: `${category.name} | 3D Hub`,
    description: `Browse 3D printable models in the ${category.name} category on 3D Hub.`,
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const category = getCategoryBySlug(slug)
  if (!category) notFound()

  const resolved = await searchParams
  const page = Math.max(1, parseInt(resolved.page ?? '1', 10) || 1)
  const result = listPublishedModels({ category: slug, page })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-6">{category.name}</h1>
      <ModelCardGrid models={result.items} />

      {(page > 1 || result.hasMore) && (
        <div className="mt-8 flex justify-center gap-6">
          {page > 1 && (
            <Link href={`/categories/${slug}?page=${page - 1}`} className="text-brand-primary hover:text-brand-hover underline">
              ← Previous
            </Link>
          )}
          {result.hasMore && (
            <Link href={`/categories/${slug}?page=${page + 1}`} className="text-brand-primary hover:text-brand-hover underline">
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
