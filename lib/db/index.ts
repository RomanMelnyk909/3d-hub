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

  // ALTER TABLE does not support IF NOT EXISTS — run with try/catch for idempotency
  try {
    db.exec('ALTER TABLE models ADD COLUMN category_id TEXT REFERENCES categories(id)')
  } catch (e) {
    if (!(e instanceof Error) || !e.message.includes('duplicate column name')) throw e
  }
  db.exec('CREATE INDEX IF NOT EXISTS idx_models_category_id ON models(category_id)')

  // Backfill FTS index for models published before this schema was applied
  try {
    db.exec(`
      INSERT INTO models_fts(model_id, title, description, tags)
      SELECT m.id, m.title, COALESCE(m.description, ''),
        COALESCE((
          SELECT GROUP_CONCAT(t.name, ' ')
          FROM tags t JOIN model_tags mt ON t.id = mt.tag_id
          WHERE mt.model_id = m.id
        ), '')
      FROM models m
      WHERE m.is_published = 1
        AND m.id NOT IN (SELECT model_id FROM models_fts)
    `)
  } catch { /* no published models to backfill */ }

  return db
}

export const db: Database.Database =
  global.__db ?? (global.__db = createConnection())
