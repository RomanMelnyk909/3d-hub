import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { publishModel } from '@/lib/db/models'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const session = await auth()
  if (!session?.user?.userId) {
    return NextResponse.json(
      { error: 'Authentication required', code: 'UNAUTHENTICATED' },
      { status: 401 }
    )
  }
  const userId = session.user.userId

  try {
    const { id } = await params

    if (!UUID_RE.test(id)) {
      return NextResponse.json(
        { error: 'Invalid model ID', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    let model
    try {
      model = publishModel(id, userId)
    } catch {
      return NextResponse.json(
        { error: 'Model not found or not a draft', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    return NextResponse.json(model)
  } catch (error) {
    console.error('[POST /api/models/[id]/publish]', error)
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
