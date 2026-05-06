import Busboy from 'busboy'
import path from 'node:path'
import { Readable } from 'node:stream'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { saveModelFile } from '@/lib/storage'
import { MAX_FILE_SIZE_BYTES, ALLOWED_MODEL_EXTENSIONS } from '@/lib/constants'

function isExecutableMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 4) return false
  // ELF: 7F 45 4C 46
  if (buffer[0] === 0x7f && buffer[1] === 0x45 && buffer[2] === 0x4c && buffer[3] === 0x46) return true
  // PE/Windows (MZ): 4D 5A
  if (buffer[0] === 0x4d && buffer[1] === 0x5a) return true
  // Mach-O 64-bit LE: CF FA ED FE
  if (buffer[0] === 0xcf && buffer[1] === 0xfa && buffer[2] === 0xed && buffer[3] === 0xfe) return true
  // Mach-O 64-bit BE: CE FA ED FE
  if (buffer[0] === 0xce && buffer[1] === 0xfa && buffer[2] === 0xed && buffer[3] === 0xfe) return true
  // Shebang: 23 21 (#!)
  if (buffer[0] === 0x23 && buffer[1] === 0x21) return true
  return false
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
      const ext = path.extname(info.filename).toLowerCase()

      if (!ALLOWED_MODEL_EXTENSIONS.includes(ext)) {
        fileStream.resume()
        return resolve(
          NextResponse.json(
            { error: 'Only STL and 3MF files are accepted', code: 'INVALID_FILE_TYPE' },
            { status: 422 }
          )
        )
      }

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

        const buffer = Buffer.concat(chunks)

        if (isExecutableMagicBytes(buffer)) {
          return resolve(
            NextResponse.json(
              { error: 'Executable files are not permitted', code: 'INVALID_FILE_TYPE' },
              { status: 422 }
            )
          )
        }

        try {
          const fileId = crypto.randomUUID()
          const filename = `${fileId}${ext}`
          saveModelFile(fileId, filename, buffer)
          resolve(NextResponse.json({ fileId, filename, size: buffer.length }))
        } catch (err) {
          console.error('[POST /api/upload/files] save error:', err)
          resolve(
            NextResponse.json(
              { error: 'Failed to save file', code: 'INTERNAL_ERROR' },
              { status: 500 }
            )
          )
        }
      })

      fileStream.on('error', (err) => {
        console.error('[POST /api/upload/files] stream error:', err)
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
      console.error('[POST /api/upload/files] busboy error:', err)
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
