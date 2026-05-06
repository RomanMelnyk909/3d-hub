'use client'

import { forwardRef, useEffect, useImperativeHandle } from 'react'
import { useForm, useWatch, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { modelMetadataSchema, type ModelMetadataFormValues } from '@/lib/validations'
import { FILAMENT_TYPES } from '@/lib/constants'
import { useWizardStore } from '@/stores/wizardStore'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface MetadataFormHandle {
  submit: () => void
}

interface Props {
  initialValues?: Partial<ModelMetadataFormValues>
  onSubmitSuccess: () => void
  onCompletenessChange: (isComplete: boolean) => void
}

export const ModelMetadataForm = forwardRef<MetadataFormHandle, Props>(
  ({ initialValues, onSubmitSuccess, onCompletenessChange }, ref) => {
    const setMetadata = useWizardStore((s) => s.setMetadata)
    const {
      control,
      handleSubmit,
      formState: { errors },
    } = useForm<ModelMetadataFormValues>({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resolver: zodResolver(modelMetadataSchema) as any,
      defaultValues: initialValues as ModelMetadataFormValues | undefined,
      mode: 'onSubmit',
    })

    const watched = useWatch({ control }) as Partial<ModelMetadataFormValues>

    useEffect(() => {
      onCompletenessChange(modelMetadataSchema.safeParse(watched).success)
    }, [watched, onCompletenessChange])

    useImperativeHandle(ref, () => ({
      submit: () =>
        handleSubmit((data) => {
          setMetadata(data)
          onSubmitSuccess()
        })(),
    }))

    return (
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-1">
          <Label htmlFor="title">Title</Label>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Input id="title" {...field} placeholder="e.g. Articulated Dragon" />
            )}
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="description">Description</Label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Textarea
                id="description"
                {...field}
                className="resize-none"
                rows={4}
                placeholder="Describe your model..."
              />
            )}
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="layerHeightMm">Layer Height (mm)</Label>
          <Controller
            name="layerHeightMm"
            control={control}
            render={({ field }) => (
              <Input
                id="layerHeightMm"
                type="number"
                step="0.05"
                min="0.05"
                max="1.0"
                {...field}
              />
            )}
          />
          <p className="text-sm text-text-muted">Layer height in mm, e.g. 0.2</p>
          {errors.layerHeightMm && (
            <p className="text-sm text-destructive">{errors.layerHeightMm.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="infillPercent">Infill %</Label>
          <Controller
            name="infillPercent"
            control={control}
            render={({ field }) => (
              <Input
                id="infillPercent"
                type="number"
                min="0"
                max="100"
                {...field}
              />
            )}
          />
          <p className="text-sm text-text-muted">Percentage fill, e.g. 20</p>
          {errors.infillPercent && (
            <p className="text-sm text-destructive">{errors.infillPercent.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="supportsRequired">Supports Required</Label>
          <Controller
            name="supportsRequired"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="supportsRequired">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.supportsRequired && (
            <p className="text-sm text-destructive">{errors.supportsRequired.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="filamentType">Filament Type</Label>
          <Controller
            name="filamentType"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="filamentType">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {FILAMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.filamentType && (
            <p className="text-sm text-destructive">{errors.filamentType.message}</p>
          )}
        </div>
      </form>
    )
  }
)

ModelMetadataForm.displayName = 'ModelMetadataForm'
