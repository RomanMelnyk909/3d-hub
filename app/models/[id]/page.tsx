import { cache } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Badge } from '@/components/ui/badge'
import { getModelById as _getModelById, getModelPhotos as _getModelPhotos, getModelTagNames } from '@/lib/db/models'
import { PhotoGallery } from '@/components/model/PhotoGallery'
import { PrintMetadataBlock } from '@/components/model/PrintMetadataBlock'
import { DownloadButton } from '@/components/model/DownloadButton'

const getModelById = cache(_getModelById)
const getModelPhotos = cache(_getModelPhotos)

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const model = getModelById(id)
  if (!model || !model.isPublished) notFound()

  const photos = getModelPhotos(id)
  const base = (process.env.NEXTAUTH_URL ?? 'http://localhost:3000').replace(/\/$/, '')
  const ogImage = photos[0]
    ? `${base}/api/files/${encodeURIComponent(photos[0].filename)}`
    : undefined

  return {
    title: `${model.title} | 3D Hub`,
    description: model.description ?? undefined,
    openGraph: {
      title: model.title,
      description: model.description ?? undefined,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}

export default async function ModelDetailPage({ params }: Props) {
  const { id } = await params

  const model = getModelById(id)
  if (!model || !model.isPublished) notFound()

  const photos = getModelPhotos(id)
  const tags   = getModelTagNames(id)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 sm:pb-8">
      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-8">
        {/* Left column: gallery + description + tags */}
        <div className="space-y-6">
          <PhotoGallery photos={photos} modelTitle={model.title} />

          {model.description && (
            <div>
              <h2 className="text-base font-semibold text-text-primary mb-2">About this model</h2>
              <p className="text-sm text-text-muted leading-relaxed whitespace-pre-wrap">
                {model.description}
              </p>
            </div>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs bg-brand-light text-brand-primary hover:bg-brand-light"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar: title + metadata + desktop download */}
        <div className="mt-6 lg:mt-0">
          <div className="lg:sticky lg:top-24 space-y-4">
            <h1 className="text-2xl font-bold text-text-primary">{model.title}</h1>
            <PrintMetadataBlock model={model} />
            {/* Desktop only — mobile button is sticky at bottom */}
            <div className="hidden sm:block">
              <DownloadButton modelId={model.id} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky download — sticky bottom-0 per AC */}
      <div className="sm:hidden sticky bottom-0 -mx-4 px-4 py-3 bg-bg-card border-t border-border">
        <DownloadButton modelId={model.id} />
      </div>
    </div>
  )
}
