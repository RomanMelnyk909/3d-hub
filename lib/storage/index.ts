import fs from 'node:fs'
import path from 'node:path'

function getUploadDir(): string {
  const dir = process.env.UPLOAD_DIR
  if (!dir) throw new Error('UPLOAD_DIR environment variable is not set')
  return path.resolve(process.cwd(), dir)
}

export function saveModelFile(tempId: string, filename: string, data: Buffer): void {
  const dir = path.join(getUploadDir(), 'models', tempId, 'files')
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, filename), data)
}

export function saveModelPhoto(tempId: string, filename: string, data: Buffer): void {
  const dir = path.join(getUploadDir(), 'models', tempId, 'photos')
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, filename), data)
}

export function readStoredFile(relPath: string): Buffer {
  const uploadDir = getUploadDir()
  const absPath = path.resolve(uploadDir, relPath)
  if (!absPath.startsWith(uploadDir + path.sep)) {
    const err = new Error('Path outside upload directory') as NodeJS.ErrnoException
    err.code = 'ENOENT'
    throw err
  }
  return fs.readFileSync(absPath)
}
