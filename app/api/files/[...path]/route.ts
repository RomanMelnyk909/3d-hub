import path from 'node:path'
import { readStoredFile } from '@/lib/storage'

const CONTENT_TYPE_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.stl': 'application/octet-stream',
  '.3mf': 'application/vnd.ms-package.3dmanufacturing-3dmodel+xml',
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params

  if (!segments || segments.length === 0) {
    return new Response('Not found', { status: 404 })
  }

  if (segments.some((seg) => seg === '..' || seg.includes('..'))) {
    return new Response('Not found', { status: 404 })
  }

  const relPath = segments.join('/')

  try {
    const buffer = readStoredFile(relPath)
    const ext = path.extname(relPath).toLowerCase()
    const contentType = CONTENT_TYPE_MAP[ext] ?? 'application/octet-stream'

    const body = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer
    return new Response(body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return new Response('Not found', { status: 404 })
    }
    console.error('[GET /api/files] error:', err)
    return new Response('Internal error', { status: 500 })
  }
}
