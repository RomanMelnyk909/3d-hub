import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { updateDraftModel, setModelTags } from '@/lib/db/models'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface UpdateModelBody {
  title?: string
  description?: string | null
  layerHeightMm?: number | null
  infillPercent?: number | null
  supportsRequired?: string | boolean | null
  filamentType?: string | null
  tagIds?: string[]
  customTagNames?: string[]
}

export async function PATCH(
  request: Request,
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

    const body: UpdateModelBody = await request.json()

    const supportsRequired =
      body.supportsRequired === 'true' || body.supportsRequired === true
        ? true
        : body.supportsRequired === 'false' || body.supportsRequired === false
          ? false
          : null

    let model
    try {
      model = updateDraftModel(id, userId, {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.layerHeightMm !== undefined && { layerHeightMm: body.layerHeightMm }),
        ...(body.infillPercent !== undefined && { infillPercent: body.infillPercent }),
        ...(body.supportsRequired !== undefined && { supportsRequired }),
        ...(body.filamentType !== undefined && { filamentType: body.filamentType }),
      })
    } catch (err) {
      if (err instanceof Error && err.message.includes('not found or not a draft')) {
        return NextResponse.json(
          { error: 'Model not found or not a draft', code: 'NOT_FOUND' },
          { status: 404 }
        )
      }
      throw err
    }

    if (body.tagIds !== undefined || body.customTagNames !== undefined) {
      setModelTags(id, body.tagIds ?? [], body.customTagNames ?? [])
    }

    return NextResponse.json(model)
  } catch (error) {
    console.error('[PATCH /api/models/[id]]', error)
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
