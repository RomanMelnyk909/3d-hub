import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'

declare global {
  var __db: Database.Database | undefined
}

function createConnection(): Database.Database {
  const dbPath = process.env.DATABASE_PATH
  if (!dbPath) {
    throw new Error('DATABASE_PATH environment variable is not set')
  }

  const resolvedPath = path.resolve(process.cwd(), dbPath)
  const db = new Database(resolvedPath)

  // WAL mode allows concurrent reads alongside writes
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  const schemaPath = path.join(process.cwd(), 'lib', 'db', 'schema.sql')
  const schema = fs.readFileSync(schemaPath, 'utf-8')
  db.exec(schema)

  return db
}

export const db: Database.Database =
  global.__db ?? (global.__db = createConnection())
