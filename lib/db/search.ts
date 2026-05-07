import { db } from './index'
import type { ModelCardData } from '@/types/model'
import type { SearchQuery, SearchSuggestion } from '@/types/search'
import type { PaginatedResponse } from '@/types/api'
import { PAGE_SIZE } from '@/lib/constants'
import { mapRowToModelCardData, type DbModelRow } from './models'

const SEARCH_CARD_FIELDS = `
  m.*,
  (SELECT filename FROM model_photos WHERE model_id = m.id ORDER BY display_order ASC LIMIT 1) AS primary_photo_filename,
  (SELECT t.name FROM tags t JOIN model_tags mt ON t.id = mt.tag_id WHERE mt.model_id = m.id ORDER BY mt.tag_id ASC LIMIT 1) AS primary_tag_name
`

export function searchModels(query: SearchQuery): PaginatedResponse<ModelCardData> {
  const page = Math.max(1, query.page ?? 1)
  const limit = Math.min(100, Math.max(1, query.limit ?? PAGE_SIZE))
  const offset = (page - 1) * limit

  const q = query.q ?? ''
  const sanitized = q.replace(/"/g, '').trim()
  if (!sanitized) return { items: [], total: 0, page, limit, hasMore: false }
  const ftsQuery = `"${sanitized}"`

  const joinClause = `
    FROM models_fts fts
    JOIN models m ON m.id = fts.model_id
    WHERE fts MATCH ? AND m.is_published = 1
  `
  const baseParams: (string | number)[] = [ftsQuery]

  let filterClause = ''
  const filterParams: (string | number)[] = []

  if (query.category) {
    filterClause += ' AND m.category_id = (SELECT id FROM categories WHERE slug = ?)'
    filterParams.push(query.category)
  }
  if (query.uploader) {
    filterClause += ' AND m.user_id = (SELECT id FROM users WHERE username = ?)'
    filterParams.push(query.uploader)
  }

  const orderBy = query.sort === 'newest'
    ? 'ORDER BY m.created_at DESC'
    : query.sort === 'az'
      ? 'ORDER BY m.title ASC'
      : query.sort === 'downloads'
        ? 'ORDER BY m.download_count DESC'
        : 'ORDER BY fts.rank'

  const allParams = [...baseParams, ...filterParams]

  try {
    const total = (db.prepare(
      `SELECT COUNT(*) as count ${joinClause}${filterClause}`
    ).get(...allParams) as { count: number }).count

    const rows = db.prepare(
      `SELECT ${SEARCH_CARD_FIELDS} ${joinClause}${filterClause} ${orderBy} LIMIT ? OFFSET ?`
    ).all(...allParams, limit, offset) as DbModelRow[]

    return {
      items: rows.map(mapRowToModelCardData),
      total,
      page,
      limit,
      hasMore: offset + rows.length < total,
    }
  } catch (e) {
    console.error('[searchModels] query failed:', e)
    return { items: [], total: 0, page, limit, hasMore: false }
  }
}

export function getSearchSuggestions(query: string): SearchSuggestion[] {
  const sanitized = query.replace(/"/g, '').trim()
  if (sanitized.length < 2) return []
  const suggestions: SearchSuggestion[] = []
  // Phrase-prefix: "term"* is valid FTS5 syntax for prefix matching on a quoted phrase
  const ftsQuery = `"${sanitized}"*`
  // Escape LIKE metacharacters using ! as the escape character
  const likeQuery = `%${sanitized.replace(/[%_!]/g, '!$&')}%`

  try {
    const models = db.prepare(
      `SELECT m.id, m.title FROM models_fts fts
       JOIN models m ON m.id = fts.model_id
       WHERE fts MATCH ? AND m.is_published = 1
       ORDER BY fts.rank LIMIT 2`
    ).all(ftsQuery) as { id: string; title: string }[]
    for (const m of models) {
      suggestions.push({ type: 'model', id: m.id, label: m.title, url: `/models/${m.id}` })
    }
  } catch { /* malformed query */ }

  try {
    // Only suggest predefined tags or tags from published models — prevents draft tag leakage
    const tags = db.prepare(
      `SELECT t.id, t.name FROM tags t
       WHERE t.name LIKE ? ESCAPE '!'
       AND (t.is_predefined = 1 OR EXISTS (
         SELECT 1 FROM model_tags mt JOIN models m ON mt.model_id = m.id
         WHERE mt.tag_id = t.id AND m.is_published = 1
       )) LIMIT 2`
    ).all(likeQuery) as { id: string; name: string }[]
    for (const t of tags) {
      suggestions.push({ type: 'tag', id: t.id, label: t.name, url: `/?tag=${encodeURIComponent(t.name)}` })
    }
  } catch { /* db error */ }

  try {
    const creators = db.prepare(
      `SELECT id, username FROM users WHERE username LIKE ? ESCAPE '!' LIMIT 1`
    ).all(likeQuery) as { id: string; username: string }[]
    for (const c of creators) {
      suggestions.push({ type: 'creator', id: c.id, label: c.username, url: `/users/${c.username}` })
    }
  } catch { /* db error */ }

  return suggestions.slice(0, 5)
}
