import { basename } from 'path'
import type { Model, DraftModel } from '@/types/model'
import { db } from './index'

interface DbModelRow {
  id: string
  user_id: string
  title: string
  description: string | null
  layer_height_mm: number | null
  infill_percent: number | null
  supports_required: number | null
  filament_type: string | null
  license: string
  is_published: number
  is_draft: number
  download_count: number
  created_at: number
  published_at: number | null
}

function mapRowToModel(row: DbModelRow): Model {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    layerHeightMm: row.layer_height_mm,
    infillPercent: row.infill_percent,
    supportsRequired: row.supports_required !== null ? Boolean(row.supports_required) : null,
    filamentType: row.filament_type,
    license: row.license,
    isPublished: Boolean(row.is_published),
    isDraft: Boolean(row.is_draft),
    downloadCount: row.download_count,
    createdAt: new Date(row.created_at * 1000).toISOString(),
    publishedAt: row.published_at ? new Date(row.published_at * 1000).toISOString() : null,
  }
}

interface UpdateDraftModelInput {
  title?: string
  description?: string | null
  layerHeightMm?: number | null
  infillPercent?: number | null
  supportsRequired?: boolean | null
  filamentType?: string | null
}

// Inline types to avoid circular import with stores/wizardStore.ts
interface WizardFileInput {
  fileId: string
  filename: string
  size: number
}

interface WizardPhotoInput {
  photoId: string
  filename: string
  previewUrl: string
}

export function createDraftModel(userId: string, data: { title: string }): DraftModel {
  const id = crypto.randomUUID()
  const createdAt = Math.floor(Date.now() / 1000)
  db.prepare(
    `INSERT INTO models (id, user_id, title, is_draft, is_published, download_count, created_at, license)
     VALUES (?, ?, ?, 1, 0, 0, ?, 'free')`
  ).run(id, userId, data.title, createdAt)
  const model = getModelById(id)
  if (!model) throw new Error(`Draft creation failed: ${id}`)
  return model as DraftModel
}

export function updateDraftModel(id: string, userId: string, data: UpdateDraftModelInput): Model {
  type ColVal = { col: string; val: string | number | null }
  const fields: ColVal[] = []

  if ('title' in data)            fields.push({ col: 'title',           val: data.title ?? null })
  if ('description' in data)      fields.push({ col: 'description',     val: data.description ?? null })
  if ('layerHeightMm' in data)    fields.push({ col: 'layer_height_mm', val: data.layerHeightMm ?? null })
  if ('infillPercent' in data)    fields.push({ col: 'infill_percent',  val: data.infillPercent ?? null })
  if ('filamentType' in data)     fields.push({ col: 'filament_type',   val: data.filamentType ?? null })
  if ('supportsRequired' in data) fields.push({
    col: 'supports_required',
    val: data.supportsRequired !== null && data.supportsRequired !== undefined
      ? (data.supportsRequired ? 1 : 0)
      : null,
  })

  if (fields.length > 0) {
    const setClause = fields.map(f => `${f.col} = ?`).join(', ')
    const params: (string | number | null)[] = [...fields.map(f => f.val), id, userId]
    const result = db.prepare(
      `UPDATE models SET ${setClause} WHERE id = ? AND is_draft = 1 AND user_id = ?`
    ).run(...params)
    if (result.changes === 0) throw new Error(`Model not found or not a draft: ${id}`)
  } else {
    const existing = db.prepare(
      'SELECT id FROM models WHERE id = ? AND is_draft = 1 AND user_id = ?'
    ).get(id, userId)
    if (!existing) throw new Error(`Model not found or not a draft: ${id}`)
  }

  const model = getModelById(id)
  if (!model) throw new Error(`Model not found: ${id}`)
  return model
}

export function publishModel(id: string, userId: string): Model {
  const publishedAt = Math.floor(Date.now() / 1000)
  const result = db.prepare(
    `UPDATE models SET is_published = 1, is_draft = 0, published_at = ? WHERE id = ? AND is_draft = 1 AND user_id = ?`
  ).run(publishedAt, id, userId)
  if (result.changes === 0) throw new Error(`Model not found or not a draft: ${id}`)
  const model = getModelById(id)
  if (!model) throw new Error(`Model not found after publish: ${id}`)
  return model
}

export function getModelById(id: string): Model | null {
  const row = db
    .prepare('SELECT * FROM models WHERE id = ?')
    .get(id) as DbModelRow | undefined
  return row ? mapRowToModel(row) : null
}

export function listModelsByUser(userId: string): Model[] {
  const rows = db
    .prepare('SELECT * FROM models WHERE user_id = ? ORDER BY created_at DESC')
    .all(userId) as DbModelRow[]
  return rows.map(mapRowToModel)
}

export function createModelFiles(modelId: string, files: WizardFileInput[]): void {
  const stmt = db.prepare(
    `INSERT INTO model_files (id, model_id, filename, file_size_bytes, original_name, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  )
  db.transaction(() => {
    for (const file of files) {
      const safeName = basename(file.filename)
      stmt.run(
        crypto.randomUUID(),
        modelId,
        'models/' + file.fileId + '/files/' + safeName,
        file.size,
        safeName,
        Math.floor(Date.now() / 1000)
      )
    }
  })()
}

export function createModelPhotos(modelId: string, photos: WizardPhotoInput[], displayOffset = 0): void {
  const stmt = db.prepare(
    `INSERT INTO model_photos (id, model_id, filename, alt_text, display_order, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  )
  db.transaction(() => {
    photos.forEach((photo, idx) => {
      const safeName = basename(photo.filename)
      stmt.run(
        crypto.randomUUID(),
        modelId,
        'models/' + photo.photoId + '/photos/' + safeName,
        null,
        idx + displayOffset,
        Math.floor(Date.now() / 1000)
      )
    })
  })()
}

export function setModelTags(
  modelId: string,
  predefinedTagIds: string[],
  customTagNames: string[]
): void {
  db.transaction(() => {
    db.prepare('DELETE FROM model_tags WHERE model_id = ?').run(modelId)

    for (const tagId of predefinedTagIds) {
      const exists = db.prepare('SELECT id FROM tags WHERE id = ?').get(tagId)
      if (exists) {
        db.prepare('INSERT OR IGNORE INTO model_tags (model_id, tag_id) VALUES (?, ?)').run(modelId, tagId)
      }
    }

    for (const name of customTagNames) {
      const trimmed = name.trim().toLowerCase()
      if (!trimmed) continue
      const existing = db.prepare('SELECT id FROM tags WHERE name = ?').get(trimmed) as { id: string } | undefined
      const tagId = existing?.id ?? crypto.randomUUID()
      if (!existing) {
        db.prepare('INSERT INTO tags (id, name, is_predefined) VALUES (?, ?, 0)').run(tagId, trimmed)
      }
      db.prepare('INSERT OR IGNORE INTO model_tags (model_id, tag_id) VALUES (?, ?)').run(modelId, tagId)
    }
  })()
}
