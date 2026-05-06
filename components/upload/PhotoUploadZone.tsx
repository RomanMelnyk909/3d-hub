'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { X, ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWizardStore } from '@/stores/wizardStore'
import { MAX_FILE_SIZE_BYTES } from '@/lib/constants'
import type { AsyncState } from '@/types/api'

const ALLOWED_PHOTO_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface PhotoUploadState {
  state: AsyncState
  filename: string
  error?: string
}

export function PhotoUploadZone() {
  const { photos, addPhoto, removePhoto } = useWizardStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const abortControllersRef = useRef<Set<AbortController>>(new Set())
  const [isDragging, setIsDragging] = useState(false)
  const [uploadStates, setUploadStates] = useState<Map<string, PhotoUploadState>>(new Map())

  useEffect(() => {
    return () => {
      abortControllersRef.current.forEach((c) => c.abort())
    }
  }, [])

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    Array.from(e.dataTransfer.files).forEach(uploadPhoto)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      Array.from(e.target.files).forEach(uploadPhoto)
      e.target.value = ''
    }
  }

  async function uploadPhoto(file: File) {
    const uploadKey = crypto.randomUUID()

    if (!ALLOWED_PHOTO_MIME_TYPES.includes(file.type)) {
      setUploadStates((prev) =>
        new Map(prev).set(uploadKey, {
          state: 'error',
          filename: file.name,
          error: 'Only JPEG, PNG, and WebP images are accepted',
        }),
      )
      return
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setUploadStates((prev) =>
        new Map(prev).set(uploadKey, {
          state: 'error',
          filename: file.name,
          error: 'File exceeds the 25MB limit',
        }),
      )
      return
    }

    setUploadStates((prev) => new Map(prev).set(uploadKey, { state: 'loading', filename: file.name }))

    const controller = new AbortController()
    abortControllersRef.current.add(controller)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload/photos', { method: 'POST', body: formData, signal: controller.signal })
      const data = await res.json()

      if (!res.ok) {
        setUploadStates((prev) =>
          new Map(prev).set(uploadKey, {
            state: 'error',
            filename: file.name,
            error: data.error ?? 'Upload failed',
          }),
        )
        return
      }

      addPhoto({ photoId: data.photoId, filename: data.filename, previewUrl: data.previewUrl })
      setUploadStates((prev) => {
        const next = new Map(prev)
        next.delete(uploadKey)
        return next
      })
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      setUploadStates((prev) =>
        new Map(prev).set(uploadKey, { state: 'error', filename: file.name, error: 'Upload failed' }),
      )
    } finally {
      abortControllersRef.current.delete(controller)
    }
  }

  const pendingEntries = Array.from(uploadStates.entries()).filter(
    ([, s]) => s.state === 'loading' || s.state === 'error',
  )

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-text-primary mb-1">Show off your printed result</h3>
        <p className="text-sm text-text-muted">Upload at least one photo of your printed model</p>
      </div>

      <div
        role="region"
        aria-label="Drop photos here or click to browse"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
          isDragging
            ? 'border-brand-primary bg-brand-light'
            : 'border-border hover:border-brand-primary/50',
        )}
        onClick={() => inputRef.current?.click()}
      >
        <ImageIcon className="mx-auto mb-3 text-text-muted" size={32} />
        <p className="text-sm font-medium text-text-primary mb-1">
          Drag and drop photos here
        </p>
        <p className="text-xs text-text-muted mb-3">JPEG, PNG, WebP up to 25MB</p>
        <button
          type="button"
          className="text-sm text-brand-primary underline underline-offset-2"
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
        >
          Browse photos
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleInputChange}
      />

      {pendingEntries.length > 0 && (
        <ul className="space-y-2">
          {pendingEntries.map(([key, status]) => (
            <li key={key} className="text-sm">
              <span className="text-text-primary">{status.filename}</span>
              {status.state === 'loading' && (
                <div className="h-1 rounded-full bg-muted overflow-hidden mt-1">
                  <div className="h-full bg-brand-primary animate-pulse w-full" />
                </div>
              )}
              {status.state === 'error' && (
                <p className="text-destructive text-xs mt-0.5">{status.error}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      {photos.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {photos.map((photo) => (
            <div key={photo.photoId} className="relative group">
              <Image
                src={photo.previewUrl}
                alt={photo.filename}
                width={80}
                height={80}
                className="rounded object-cover"
              />
              <button
                type="button"
                aria-label={`Remove ${photo.filename}`}
                onClick={() => removePhoto(photo.photoId)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
