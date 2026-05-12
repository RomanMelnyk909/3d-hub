'use client'

import { Button } from '@/components/ui/button'

interface DownloadButtonProps {
  modelId: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function DownloadButton({ modelId }: DownloadButtonProps) {
  // Story 4.2: wire up GET /api/download/[modelId] + RegistrationModal for unauthenticated visitors
  return (
    <Button className="w-full bg-brand-primary hover:bg-brand-hover text-white" size="lg">
      Download
    </Button>
  )
}
