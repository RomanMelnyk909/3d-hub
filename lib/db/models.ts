import { basename } from 'path'
import type { Model, DraftModel, ModelCardData } from '@/types/model'
import type { PaginatedResponse } from '@/types/api'
import { db } from './index'
import { PAGE_SIZE } from '@/lib/constants'

export interface DbModelRow {
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
  category_id: string | null
  primary_photo_filename?: string | null
  primary_tag_name?: string | null
}

export function mapRowToModel(row: DbModelRow): Model {
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
    categoryId: row.category_id ?? null,
    isPublished: Boolean(row.is_published),
    isDraft: Boolean(row.is_draft),
    downloadCount: row.download_count,
    createdAt: new Date(row.created_at * 1000).toISOString(),
    publishedAt: row.published_at ? new Date(row.published_at * 1000).toISOString() : null,
  }
}

const MODEL_CARD_FIELDS = `
  m.*,
  (SELECT filename FROM model_photos WHERE model_id = m.id ORDER BY display_order ASC LIMIT 1) AS primary_photo_filename,
  (SELECT t.name FROM tags t JOIN model_tags mt ON t.id = mt.tag_id WHERE mt.model_id = m.id ORDER BY mt.tag_id ASC LIMIT 1) AS primary_tag_name
`

function mapRowToModelCardData(row: DbModelRow): ModelCardData {
  return {
    ...mapRowToModel(row),
    primaryPhotoFilename: row.primary_photo_filename ?? null,
    primaryTagName: row.primary_tag_name ?? null,
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

  const tags = db.prepare(
    `SELECT t.name FROM tags t JOIN model_tags mt ON t.id = mt.tag_id WHERE mt.model_id = ?`
  ).all(id) as { name: string }[]
  const tagString = tags.map(t => t.name).join(' ')

  db.transaction(() => {
    db.prepare('DELETE FROM models_fts WHERE model_id = ?').run(id)
    db.prepare(
      'INSERT INTO models_fts(model_id, title, description, tags) VALUES (?, ?, ?, ?)'
    ).run(id, model.title, model.description ?? '', tagString)
  })()

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

export interface ListPublishedModelsOptions {
  page?: number
  limit?: number
  category?: string
  sort?: 'downloads' | 'newest'
  excludeIds?: string[]
}

export function listPublishedModels(opts: ListPublishedModelsOptions = {}): PaginatedResponse<ModelCardData> {
  const page = Math.max(1, opts.page ?? 1)
  const limit = Math.min(100, Math.max(1, opts.limit ?? PAGE_SIZE))
  const offset = (page - 1) * limit
  const orderByClause = opts.sort === 'newest' ? 'ORDER BY m.created_at DESC' : 'ORDER BY m.download_count DESC'

  let whereClause = 'WHERE m.is_published = 1'
  const params: (string | number)[] = []

  if (opts.category) {
    whereClause += ' AND m.category_id = (SELECT id FROM categories WHERE slug = ?)'
    params.push(opts.category)
  }

  if (opts.excludeIds && opts.excludeIds.length > 0) {
    const placeholders = opts.excludeIds.map(() => '?').join(', ')
    whereClause += ` AND m.id NOT IN (${placeholders})`
    params.push(...opts.excludeIds)
  }

  const total = (db.prepare(
    `SELECT COUNT(*) as count FROM models m ${whereClause}`
  ).get(...params) as { count: number }).count

  const rows = db.prepare(
    `SELECT ${MODEL_CARD_FIELDS} FROM models m ${whereClause} ${orderByClause} LIMIT ? OFFSET ?`
  ).all(...params, limit, offset) as DbModelRow[]

  return {
    items: rows.map(mapRowToModelCardData),
    total,
    page,
    limit,
    hasMore: offset + rows.length < total,
  }
}

export function getFeaturedModels(limit: number): ModelCardData[] {
  const safeLimit = Math.min(100, Math.max(1, limit))
  const rows = db.prepare(
    `SELECT ${MODEL_CARD_FIELDS} FROM models m WHERE m.is_published = 1 ORDER BY m.download_count DESC LIMIT ?`
  ).all(safeLimit) as DbModelRow[]
  return rows.map(mapRowToModelCardData)
}
