import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ModelMetadataFormValues } from '@/lib/validations'

export interface WizardFile {
  fileId: string
  filename: string
  size: number
}

export interface WizardPhoto {
  photoId: string
  filename: string
  previewUrl: string
}

export type { ModelMetadataFormValues }

interface WizardState {
  currentStep: number
  files: WizardFile[]
  photos: WizardPhoto[]
  draftId: string | null
  metadata: ModelMetadataFormValues | null
  selectedPredefinedTagIds: string[]
  customTagNames: string[]
  addFile: (file: WizardFile) => void
  removeFile: (fileId: string) => void
  addPhoto: (photo: WizardPhoto) => void
  removePhoto: (photoId: string) => void
  goToStep: (step: number) => void
  reset: () => void
  setDraftId: (id: string) => void
  setMetadata: (m: ModelMetadataFormValues) => void
  togglePredefinedTag: (id: string) => void
  addCustomTag: (name: string) => void
  removeCustomTag: (name: string) => void
}

export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      currentStep: 1,
      files: [],
      photos: [],
      draftId: null,
      metadata: null,
      selectedPredefinedTagIds: [],
      customTagNames: [],
      addFile: (file) => set((state) => ({ files: [...state.files, file] })),
      removeFile: (fileId) => set((state) => ({ files: state.files.filter((f) => f.fileId !== fileId) })),
      addPhoto: (photo) => set((state) => ({ photos: [...state.photos, photo] })),
      removePhoto: (photoId) => set((state) => ({ photos: state.photos.filter((p) => p.photoId !== photoId) })),
      goToStep: (step) => set({ currentStep: Math.max(1, Math.min(5, step)) }),
      reset: () => set({
        currentStep: 1,
        files: [],
        photos: [],
        draftId: null,
        metadata: null,
        selectedPredefinedTagIds: [],
        customTagNames: [],
      }),
      setDraftId: (id) => set({ draftId: id }),
      setMetadata: (m) => set({ metadata: m }),
      togglePredefinedTag: (id) => set((state) => ({
        selectedPredefinedTagIds: state.selectedPredefinedTagIds.includes(id)
          ? state.selectedPredefinedTagIds.filter((t) => t !== id)
          : [...state.selectedPredefinedTagIds, id],
      })),
      addCustomTag: (name) => set((state) => ({
        customTagNames: state.customTagNames.includes(name)
          ? state.customTagNames
          : [...state.customTagNames, name],
      })),
      removeCustomTag: (name) => set((state) => ({
        customTagNames: state.customTagNames.filter((t) => t !== name),
      })),
    }),
    {
      name: '3d-hub-wizard',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        draftId: s.draftId,
        currentStep: s.currentStep,
        metadata: s.metadata,
        selectedPredefinedTagIds: s.selectedPredefinedTagIds,
        customTagNames: s.customTagNames,
      }),
    }
  )
)
