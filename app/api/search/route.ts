import { NextRequest, NextResponse } from 'next/server'
import { searchModels, getSearchSuggestions } from '@/lib/db/search'
import type { SearchQuery } from '@/types/search'

const MAX_QUERY_LENGTH = 200

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q = (searchParams.get('q') ?? '').slice(0, MAX_QUERY_LENGTH)

  if (searchParams.get('suggest') === '1') {
    if (q.length < 2) return NextResponse.json([])
    try {
      const suggestions = getSearchSuggestions(q)
      return NextResponse.json(suggestions)
    } catch (error) {
      console.error({ path: '/api/search', q, error })
      return NextResponse.json({ error: 'Search failed', code: 'INTERNAL_ERROR' }, { status: 500 })
    }
  }

  const query: SearchQuery = {
    q,
    category: searchParams.get('category') ?? undefined,
    uploader: searchParams.get('uploader') ?? undefined,
    sort: (searchParams.get('sort') as SearchQuery['sort']) ?? 'downloads',
    page: Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1),
  }

  try {
    const result = searchModels(query)
    return NextResponse.json(result)
  } catch (error) {
    console.error({ path: '/api/search', query, error })
    return NextResponse.json({ error: 'Search failed', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
