'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <p className="text-text-muted mb-4">Something went wrong loading the models.</p>
      <button
        onClick={reset}
        className="text-brand-primary hover:text-brand-hover underline"
      >
        Try again
      </button>
    </div>
  )
}
