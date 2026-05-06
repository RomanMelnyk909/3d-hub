import Busboy from 'busboy'
import { Readable } from 'node:stream'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { saveModelPhoto } from '@/lib/storage'
import { MAX_FILE_SIZE_BYTES } from '@/lib/constants'

const ALLOWED_PHOTO_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
}

export async function POST(request: Request): Promise<Response> {
  const session = await auth()
  if (!session?.user?.userId) {
    return NextResponse.json(
      { error: 'Authentication required', code: 'UNAUTHENTICATED' },
      { status: 401 }
    )
  }

  const contentType = request.headers.get('content-type') ?? ''

  if (!request.body) {
    return NextResponse.json(
      { error: 'Request body is required', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  return new Promise<Response>((resolve) => {
    const bb = Busboy({ headers: { 'content-type': contentType }, limits: { files: 1, fields: 0 } })
    let fileHandled = false

    bb.on('file', (fieldname, fileStream, info) => {
      fileHandled = true

      if (!ALLOWED_PHOTO_MIME_TYPES.includes(info.mimeType)) {
        fileStream.resume()
        return resolve(
          NextResponse.json(
            { error: 'Only JPEG, PNG, and WebP images are accepted', code: 'INVALID_FILE_TYPE' },
            { status: 422 }
          )
        )
      }

      const ext = MIME_TO_EXT[info.mimeType]
      const chunks: Buffer[] = []
      let bytesRead = 0
      let tooLarge = false

      fileStream.on('data', (chunk: Buffer) => {
        bytesRead += chunk.length
        if (bytesRead > MAX_FILE_SIZE_BYTES) {
          tooLarge = true
          fileStream.resume()
          return
        }
        chunks.push(chunk)
      })

      fileStream.on('end', () => {
        if (tooLarge) {
          return resolve(
            NextResponse.json(
              { error: 'File exceeds the 25MB limit', code: 'FILE_TOO_LARGE' },
              { status: 413 }
            )
          )
        }

        try {
          const photoId = crypto.randomUUID()
          const filename = `${photoId}${ext}`
          const buffer = Buffer.concat(chunks)
          saveModelPhoto(photoId, filename, buffer)
          resolve(
            NextResponse.json({
              photoId,
              filename,
              previewUrl: `/api/files/models/${photoId}/photos/${filename}`,
            })
          )
        } catch (err) {
          console.error('[POST /api/upload/photos] save error:', err)
          resolve(
            NextResponse.json(
              { error: 'Failed to save photo', code: 'INTERNAL_ERROR' },
              { status: 500 }
            )
          )
        }
      })

      fileStream.on('error', (err) => {
        console.error('[POST /api/upload/photos] stream error:', err)
        resolve(
          NextResponse.json(
            { error: 'Upload processing failed', code: 'INTERNAL_ERROR' },
            { status: 500 }
          )
        )
      })
    })

    bb.on('finish', () => {
      if (!fileHandled) {
        resolve(
          NextResponse.json(
            { error: 'No file provided', code: 'VALIDATION_ERROR' },
            { status: 400 }
          )
        )
      }
    })

    bb.on('error', (err) => {
      console.error('[POST /api/upload/photos] busboy error:', err)
      resolve(
        NextResponse.json(
          { error: 'Upload processing failed', code: 'INTERNAL_ERROR' },
          { status: 500 }
        )
      )
    })

    Readable.fromWeb(
      request.body as Parameters<typeof Readable.fromWeb>[0]
    ).pipe(bb)
  })
}
