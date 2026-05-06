import type { Metadata } from 'next'
import { UploadWizard } from '@/components/upload/UploadWizard'

export const metadata: Metadata = {
  title: 'Upload Model | 3D Hub',
}

export default function UploadPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <UploadWizard />
    </div>
  )
}
