'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWizardStore } from '@/stores/wizardStore'
import { ALLOWED_MODEL_EXTENSIONS, MAX_FILE_SIZE_BYTES } from '@/lib/constants'
import type { AsyncState } from '@/types/api'

interface FileUploadState {
  state: AsyncState
  filename: string
  error?: string
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FileUploadZone() {
  const { files, addFile, removeFile } = useWizardStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const abortControllersRef = useRef<Set<AbortController>>(new Set())
  const [isDragging, setIsDragging] = useState(false)
  const [uploadStates, setUploadStates] = useState<Map<string, FileUploadState>>(new Map())

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
    Array.from(e.dataTransfer.files).forEach(uploadFile)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      Array.from(e.target.files).forEach(uploadFile)
      e.target.value = ''
    }
  }

  async function uploadFile(file: File) {
    const uploadKey = crypto.randomUUID()
    const ext = '.' + (file.name.split('.').pop() ?? '').toLowerCase()

    if (!ALLOWED_MODEL_EXTENSIONS.includes(ext)) {
      setUploadStates((prev) =>
        new Map(prev).set(uploadKey, {
          state: 'error',
          filename: file.name,
          error: 'Only STL and 3MF files are accepted',
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
      const res = await fetch('/api/upload/files', { method: 'POST', body: formData, signal: controller.signal })
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

      addFile({ fileId: data.fileId, filename: data.filename, size: data.size })
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
      <div
        role="region"
        aria-label="Drop 3D model files here or click to browse"
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
        <Upload className="mx-auto mb-3 text-text-muted" size={32} />
        <p className="text-sm font-medium text-text-primary mb-1">
          Drag and drop your 3D model files here
        </p>
        <p className="text-xs text-text-muted mb-3">STL and 3MF files up to 25MB</p>
        <button
          type="button"
          className="text-sm text-brand-primary underline underline-offset-2"
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
        >
          Browse files
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".stl,.3mf"
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

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file) => (
            <li key={file.fileId} className="flex items-center justify-between text-sm bg-muted/40 rounded-md px-3 py-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-brand-primary font-medium">✓</span>
                <span className="truncate text-text-primary">{file.filename}</span>
                <span className="text-text-muted shrink-0">{formatBytes(file.size)}</span>
              </div>
              <button
                type="button"
                aria-label={`Remove ${file.filename}`}
                onClick={() => removeFile(file.fileId)}
                className="ml-2 text-text-muted hover:text-destructive transition-colors shrink-0"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
