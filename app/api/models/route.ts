import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  createDraftModel,
  updateDraftModel,
  createModelFiles,
  createModelPhotos,
  setModelTags,
} from '@/lib/db/models'

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

interface CreateModelBody {
  title: string
  description?: string | null
  layerHeightMm?: number | null
  infillPercent?: number | null
  supportsRequired?: string | boolean | null
  filamentType?: string | null
  files: WizardFileInput[]
  photos: WizardPhotoInput[]
  tagIds?: string[]
  customTagNames?: string[]
}

export async function POST(request: Request): Promise<Response> {
  const session = await auth()
  if (!session?.user?.userId) {
    return NextResponse.json(
      { error: 'Authentication required', code: 'UNAUTHENTICATED' },
      { status: 401 }
    )
  }
  const userId = session.user.userId

  let body: CreateModelBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  try {
    if (!body.title) {
      return NextResponse.json(
        { error: 'Title is required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    const customTagNames = body.customTagNames ?? []
    if (
      customTagNames.length > 20 ||
      customTagNames.some((n) => typeof n !== 'string' || n.length > 50)
    ) {
      return NextResponse.json(
        { error: 'Invalid custom tags: max 20 tags, each 50 characters or fewer', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    const supportsRequired =
      body.supportsRequired === 'true' || body.supportsRequired === true
        ? true
        : body.supportsRequired === 'false' || body.supportsRequired === false
          ? false
          : null

    const draft = createDraftModel(userId, { title: body.title })

    const hasExtraFields =
      body.description !== undefined ||
      body.layerHeightMm !== undefined ||
      body.infillPercent !== undefined ||
      body.supportsRequired !== undefined ||
      body.filamentType !== undefined

    const model = hasExtraFields
      ? updateDraftModel(draft.id, userId, {
          description: body.description ?? undefined,
          layerHeightMm: body.layerHeightMm ?? undefined,
          infillPercent: body.infillPercent ?? undefined,
          supportsRequired,
          filamentType: body.filamentType ?? undefined,
        })
      : draft

    if (body.files && body.files.length > 0) {
      createModelFiles(model.id, body.files)
    }

    if (body.photos && body.photos.length > 0) {
      createModelPhotos(model.id, body.photos)
    }

    if (body.tagIds || customTagNames.length > 0) {
      setModelTags(model.id, body.tagIds ?? [], customTagNames)
    }

    return NextResponse.json(model, { status: 201 })
  } catch (error) {
    console.error('[POST /api/models]', error)
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
