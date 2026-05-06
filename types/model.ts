export interface PrintMetadata {
  layerHeightMm: number | null
  infillPercent: number | null
  supportsRequired: boolean | null
  filamentType: string | null
}

export interface Model {
  id: string
  userId: string
  title: string
  description: string | null
  layerHeightMm: number | null
  infillPercent: number | null
  supportsRequired: boolean | null
  filamentType: string | null
  license: string
  isPublished: boolean
  isDraft: boolean
  downloadCount: number
  createdAt: string
  publishedAt: string | null
}

export type DraftModel = Model

export interface ModelFile {
  id: string
  modelId: string
  filename: string
  fileSizeBytes: number
  originalName: string
  createdAt: string
}

export interface ModelPhoto {
  id: string
  modelId: string
  filename: string
  altText: string | null
  displayOrder: number
  createdAt: string
}
