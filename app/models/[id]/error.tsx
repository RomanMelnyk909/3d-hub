'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-lg font-semibold text-text-primary mb-2">Something went wrong</h2>
      <p className="text-sm text-text-muted mb-4">Failed to load this model.</p>
      <button
        onClick={reset}
        className="text-brand-primary hover:text-brand-hover underline text-sm"
      >
        Try again
      </button>
    </div>
  )
}
