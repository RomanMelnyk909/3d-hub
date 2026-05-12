'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ModelPhoto } from '@/types/model'

interface PhotoGalleryProps {
  photos: ModelPhoto[]
  modelTitle: string
}

export function PhotoGallery({ photos, modelTitle }: PhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const lightboxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (lightboxOpen) lightboxRef.current?.focus()
  }, [lightboxOpen])

  const prev = useCallback(() =>
    setCurrentIndex(i => (i > 0 ? i - 1 : photos.length - 1)), [photos.length])

  const next = useCallback(() =>
    setCurrentIndex(i => (i < photos.length - 1 ? i + 1 : 0)), [photos.length])

  useEffect(() => {
    if (!lightboxOpen) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape')     { setLightboxOpen(false) }
      if (e.key === 'ArrowLeft')  { prev() }
      if (e.key === 'ArrowRight') { next() }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxOpen, prev, next])

  const photoUrl = (p: ModelPhoto) => `/api/files/${encodeURIComponent(p.filename)}`

  if (photos.length === 0) {
    return (
      <div className="aspect-square w-full bg-muted rounded-lg flex items-center justify-center text-text-muted text-sm">
        No photos
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div
        className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted cursor-pointer"
        onClick={() => setLightboxOpen(true)}
      >
        <Image
          src={photoUrl(photos[currentIndex])}
          alt={photos[currentIndex].altText ?? `${modelTitle} — photo ${currentIndex + 1}`}
          fill
          className="object-cover"
          loading="eager"
          sizes="(max-width: 1024px) 100vw, calc(100vw - 360px)"
        />
        {photos.length > 1 && (
          <>
            <button
              onClick={e => { e.stopPropagation(); prev() }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 transition-colors"
              aria-label="Previous photo"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={e => { e.stopPropagation(); next() }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 transition-colors"
              aria-label="Next photo"
            >
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              {currentIndex + 1} / {photos.length}
            </div>
          </>
        )}
      </div>

      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              onClick={() => setCurrentIndex(i)}
              className={cn(
                'relative shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-colors',
                i === currentIndex ? 'border-brand-primary' : 'border-border hover:border-brand-primary/50'
              )}
              aria-label={`View photo ${i + 1}`}
            >
              <Image
                src={photoUrl(photo)}
                alt={photo.altText ?? `${modelTitle} — thumbnail ${i + 1}`}
                fill
                className="object-cover"
                loading="lazy"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div
          ref={lightboxRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={`Photo ${currentIndex + 1} of ${photos.length}`}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center focus:outline-none"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            aria-label="Close lightbox"
            onClick={() => setLightboxOpen(false)}
          >
            <X size={24} />
          </button>
          {photos.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
                aria-label="Previous photo"
                onClick={e => { e.stopPropagation(); prev() }}
              >
                <ChevronLeft size={32} />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
                aria-label="Next photo"
                onClick={e => { e.stopPropagation(); next() }}
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}
          <div
            className="relative w-full h-full max-w-4xl max-h-screen p-12"
            onClick={e => e.stopPropagation()}
          >
            <Image
              src={photoUrl(photos[currentIndex])}
              alt={`Photo ${currentIndex + 1} of ${photos.length}`}
              fill
              className="object-contain"
              loading="eager"
              sizes="(max-width: 1024px) 100vw, 896px"
            />
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
            {currentIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </div>
  )
}
