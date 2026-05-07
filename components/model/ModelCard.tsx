import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import type { ModelCardData } from '@/types/model'

export function ModelCard({ model }: { model: ModelCardData }) {
  const photoUrl = model.primaryPhotoFilename
    ? `/api/files/${encodeURIComponent(model.primaryPhotoFilename)}`
    : null

  return (
    <article
      role="article"
      aria-label={model.title}
      className="flex flex-col bg-bg-card rounded-lg border border-border overflow-hidden transition-all hover:shadow-md hover:border-brand-primary/30"
    >
      <Link href={`/models/${model.id}`} className="flex flex-col h-full">
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={model.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-text-muted text-xs">
              No photo
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 p-3 flex-1">
          <h3 className="text-sm font-semibold text-text-primary line-clamp-2 leading-snug">
            {model.title}
          </h3>
          <div className="flex items-center justify-between gap-2 mt-auto">
            <span className="text-xs text-text-muted">
              {model.downloadCount.toLocaleString()} downloads
            </span>
            {model.primaryTagName && (
              <Badge
                variant="secondary"
                className="text-xs shrink-0 bg-brand-light text-brand-primary hover:bg-brand-light"
              >
                {model.primaryTagName}
              </Badge>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}
