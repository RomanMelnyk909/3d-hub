import { db } from './index'

export interface Category {
  id: string
  name: string
  slug: string
}

interface DbCategoryRow {
  id: string
  name: string
  slug: string
}

export function listCategories(): Category[] {
  const rows = db.prepare('SELECT id, name, slug FROM categories ORDER BY name ASC').all() as DbCategoryRow[]
  return rows.map(r => ({ id: r.id, name: r.name, slug: r.slug }))
}

export function getCategoryBySlug(slug: string): Category | null {
  const row = db.prepare('SELECT id, name, slug FROM categories WHERE slug = ?').get(slug) as DbCategoryRow | undefined
  return row ? { id: row.id, name: row.name, slug: row.slug } : null
}
