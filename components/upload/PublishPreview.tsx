'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Image from 'next/image'
import { useWizardStore } from '@/stores/wizardStore'
import { PREDEFINED_TAGS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import type { AsyncState } from '@/types/api'

export function PublishPreview() {
  const router = useRouter()
  const [isConsented, setIsConsented] = useState(false)
  const [publishState, setPublishState] = useState<AsyncState>('idle')

  const {
    draftId,
    metadata,
    files,
    photos,
    selectedPredefinedTagIds,
    customTagNames,
    setDraftId,
  } = useWizardStore()

  if (!metadata) {
    return (
      <p className="text-sm text-text-muted">
        Please complete the Details step before previewing.
      </p>
    )
  }

  const firstPhoto = photos[0]

  const tagLabels = [
    ...(selectedPredefinedTagIds
      .map((id) => PREDEFINED_TAGS.find((t) => t.id === id)?.name)
      .filter(Boolean) as string[]),
    ...customTagNames,
  ]

  async function handlePublish() {
    if (publishState === 'loading' || !metadata) return
    setPublishState('loading')
    try {
      let currentDraftId = draftId

      if (!currentDraftId) {
        const res = await fetch('/api/models', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: metadata.title,
            description: metadata.description,
            layerHeightMm: metadata.layerHeightMm,
            infillPercent: metadata.infillPercent,
            supportsRequired: metadata.supportsRequired,
            filamentType: metadata.filamentType,
            files,
            photos,
            tagIds: selectedPredefinedTagIds,
            customTagNames,
          }),
        })
        const data = await res.json()
        if (!res.ok) {
          toast.error(data.error ?? 'Failed to create draft')
          setPublishState('error')
          return
        }
        currentDraftId = data.id
        setDraftId(data.id)
      }

      const pubRes = await fetch(`/api/models/${currentDraftId}/publish`, { method: 'POST' })
      const pubData = await pubRes.json()
      if (!pubRes.ok) {
        toast.error(pubData.error ?? 'Publish failed')
        setPublishState('error')
        return
      }

      if (!pubData?.id) {
        toast.error('Publish succeeded but model ID is missing')
        setPublishState('error')
        return
      }

      toast.success('Your model is live!')
      router.push(`/models/${pubData.id}`)
    } catch {
      toast.error('An unexpected error occurred')
      setPublishState('error')
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-text-primary">Preview your listing</h2>

      {/* Preview card */}
      <div className="rounded-lg border border-border p-4 space-y-4">
        <div className="flex gap-4 items-start">
          {firstPhoto?.previewUrl ? (
            <Image
              src={firstPhoto.previewUrl}
              alt="Preview"
              width={80}
              height={80}
              className="rounded object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded bg-muted flex-shrink-0" />
          )}
          <div className="min-w-0">
            <p className="font-semibold text-text-primary truncate">{metadata.title}</p>
            <p className="text-sm text-text-muted mt-1 line-clamp-3">
              {metadata.description
                ? metadata.description.slice(0, 120) + (metadata.description.length > 120 ? '…' : '')
                : '—'}
            </p>
            <p className="text-xs text-text-muted mt-1">0 downloads</p>
          </div>
        </div>

        {/* Metadata table */}
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="text-text-muted">Layer Height</dt>
          <dd className="font-medium">{metadata.layerHeightMm != null ? `${metadata.layerHeightMm} mm` : '—'}</dd>
          <dt className="text-text-muted">Infill</dt>
          <dd className="font-medium">{metadata.infillPercent != null ? `${metadata.infillPercent}%` : '—'}</dd>
          <dt className="text-text-muted">Supports</dt>
          <dd className="font-medium">
            {metadata.supportsRequired === 'true'
              ? 'Yes'
              : metadata.supportsRequired === 'false'
                ? 'No'
                : '—'}
          </dd>
          <dt className="text-text-muted">Filament</dt>
          <dd className="font-medium">{metadata.filamentType ?? '—'}</dd>
        </dl>

        {/* Tags */}
        {tagLabels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tagLabels.map((label) => (
              <Badge key={label} variant="secondary">
                {label}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* License consent */}
      <div className="flex items-center gap-3">
        <Checkbox
          id="license"
          checked={isConsented}
          onCheckedChange={(v) => setIsConsented(Boolean(v))}
        />
        <Label htmlFor="license" className="text-sm cursor-pointer">
          I confirm this is my original work and grant free-to-download rights
        </Label>
      </div>

      {/* Publish button */}
      <Button
        variant="default"
        disabled={!isConsented || publishState === 'loading'}
        onClick={handlePublish}
      >
        {publishState === 'loading' ? 'Publishing…' : 'Publish'}
      </Button>
    </div>
  )
}
