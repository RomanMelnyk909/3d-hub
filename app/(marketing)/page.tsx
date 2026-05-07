import Link from 'next/link'
import { listPublishedModels, getFeaturedModels } from '@/lib/db/models'
import { ModelCard } from '@/components/model/ModelCard'
import { ModelCardGrid } from '@/components/model/ModelCardGrid'

interface HomePageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)

  const featured = getFeaturedModels(6)
  const result = listPublishedModels({ page, sort: 'downloads', excludeIds: featured.map(m => m.id) })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {featured.length > 0 && (
        <section aria-labelledby="featured-heading" className="mb-10">
          <h2 id="featured-heading" className="text-xl font-semibold text-text-primary mb-4">
            Trending
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {featured.map(model => (
              <div key={model.id} className="shrink-0 w-48">
                <ModelCard model={model} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="all-models-heading">
        <h2 id="all-models-heading" className="text-xl font-semibold text-text-primary mb-4">
          All Models
        </h2>
        <ModelCardGrid models={result.items} />

        {(page > 1 || result.hasMore) && (
          <div className="mt-8 flex justify-center gap-6">
            {page > 1 && (
              <Link href={`/?page=${page - 1}`} className="text-brand-primary hover:text-brand-hover underline">
                ← Previous
              </Link>
            )}
            {result.hasMore && (
              <Link href={`/?page=${page + 1}`} className="text-brand-primary hover:text-brand-hover underline">
                Next →
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
