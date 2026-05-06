import type { Model } from '@/types/model'

export interface SearchQuery {
  q: string
  category?: string
  uploader?: string
  sort?: 'downloads' | 'newest' | 'az'
  page?: number
  limit?: number
}

export type SearchResult = Model

export interface SearchSuggestion {
  type: 'model' | 'tag' | 'creator'
  id: string
  label: string
  url: string
}
