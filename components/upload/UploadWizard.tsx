'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { useWizardStore } from '@/stores/wizardStore'
import { WizardStepIndicator } from './WizardStepIndicator'
import { FileUploadZone } from './FileUploadZone'
import { PhotoUploadZone } from './PhotoUploadZone'
import { ModelMetadataForm, type MetadataFormHandle } from './ModelMetadataForm'
import { TagSelector } from './TagSelector'
import { PublishPreview } from './PublishPreview'
import { Button } from '@/components/ui/button'

export function UploadWizard() {
  const {
    currentStep,
    files,
    photos,
    draftId,
    metadata,
    selectedPredefinedTagIds,
    customTagNames,
    goToStep,
    reset,
    setDraftId,
  } = useWizardStore()

  const metadataFormRef = useRef<MetadataFormHandle>(null)
  const [isMetadataFormComplete, setIsMetadataFormComplete] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)

  // Shows when persisted draft exists but no files/photos are loaded yet (cold start)
  const showResumePrompt = !dismissed && draftId !== null && files.length === 0 && photos.length === 0

  const isContinueDisabled =
    (currentStep === 1 && files.length === 0) ||
    (currentStep === 2 && photos.length === 0) ||
    (currentStep === 3 && !isMetadataFormComplete)

  function handleContinueClick() {
    if (currentStep === 3) {
      metadataFormRef.current?.submit()
      return
    }
    goToStep(currentStep + 1)
  }

  async function handleSaveDraft() {
    if (!metadata || isSavingDraft) return
    setIsSavingDraft(true)
    try {
      if (draftId === null) {
        const res = await fetch('/api/models', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: metadata.title,
            description: metadata.description,
            layerHeightMm: metadata.layerHeightMm,
            infillPercent: metadata.infillPercent,
            supportsRequired: metadata.supportsRequired,
            filamentType: metadata.filamentType,
            files,
            photos,
            tagIds: selectedPredefinedTagIds,
            customTagNames,
          }),
        })
        const data = await res.json()
        if (!res.ok) {
          toast.error(data.error ?? 'Failed to save draft')
          return
        }
        setDraftId(data.id)
      } else {
        const res = await fetch(`/api/models/${draftId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: metadata.title,
            description: metadata.description,
            layerHeightMm: metadata.layerHeightMm,
            infillPercent: metadata.infillPercent,
            supportsRequired: metadata.supportsRequired,
            filamentType: metadata.filamentType,
            tagIds: selectedPredefinedTagIds,
            customTagNames,
          }),
        })
        const data = await res.json()
        if (!res.ok) {
          toast.error(data.error ?? 'Failed to save draft')
          return
        }
      }
      toast('Draft saved')
    } catch {
      toast.error('Failed to save draft')
    } finally {
      setIsSavingDraft(false)
    }
  }

  return (
    <div>
      {showResumePrompt && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-border bg-bg-subtle p-3 text-sm">
          <span className="text-text-primary">You have an unsaved draft. Resume or Start New?</span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                reset()
                setDismissed(true)
              }}
            >
              Start New
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setDismissed(true)}
            >
              Resume
            </Button>
          </div>
        </div>
      )}

      <WizardStepIndicator currentStep={currentStep} />

      <div className="mb-8">
        {currentStep === 1 && <FileUploadZone />}
        {currentStep === 2 && <PhotoUploadZone />}
        {currentStep === 3 && (
          <ModelMetadataForm
            ref={metadataFormRef}
            initialValues={metadata ?? undefined}
            onSubmitSuccess={() => goToStep(4)}
            onCompletenessChange={setIsMetadataFormComplete}
          />
        )}
        {currentStep === 4 && <TagSelector />}
        {currentStep === 5 && <PublishPreview />}
      </div>

      <div className="flex items-center justify-between">
        {currentStep > 1 ? (
          <Button variant="ghost" onClick={() => goToStep(currentStep - 1)}>
            Back
          </Button>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-3">
          {currentStep >= 3 && metadata !== null && currentStep < 5 && (
            <Button variant="outline" onClick={handleSaveDraft} disabled={isSavingDraft}>
              {isSavingDraft ? 'Saving…' : 'Save Draft'}
            </Button>
          )}

          <div className="flex flex-col items-end gap-1">
            {currentStep < 5 && (
              <Button
                variant="default"
                disabled={isContinueDisabled}
                onClick={handleContinueClick}
              >
                Continue
              </Button>
            )}
            {currentStep === 2 && photos.length === 0 && (
              <p className="text-sm text-text-muted text-center mt-2">At least 1 photo required</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
