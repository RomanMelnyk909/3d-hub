import { ModelCard } from './ModelCard'
import type { ModelCardData } from '@/types/model'

interface ModelCardGridProps {
  models: ModelCardData[]
}

export function ModelCardGrid({ models }: ModelCardGridProps) {
  if (models.length === 0) {
    return (
      <div className="py-16 text-center text-text-muted">
        <p>No models available yet. Check back soon!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {models.map(model => (
        <ModelCard key={model.id} model={model} />
      ))}
    </div>
  )
}
