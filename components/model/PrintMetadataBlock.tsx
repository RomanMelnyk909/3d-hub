import { cn } from '@/lib/utils'
import type { Model } from '@/types/model'

interface PrintMetadataBlockProps {
  model: Pick<Model, 'layerHeightMm' | 'infillPercent' | 'supportsRequired' | 'filamentType'>
}

export function PrintMetadataBlock({ model }: PrintMetadataBlockProps) {
  const fields = [
    { label: 'Layer Height (mm)', value: model.layerHeightMm !== null ? `${model.layerHeightMm} mm` : '—' },
    { label: 'Infill %',          value: model.infillPercent !== null ? `${model.infillPercent}%`  : '—' },
    { label: 'Supports Required', value: model.supportsRequired !== null ? (model.supportsRequired ? 'Yes' : 'No') : '—' },
    { label: 'Filament Type',     value: model.filamentType ?? '—' },
  ]

  return (
    <div>
      <h2 className="text-base font-semibold text-text-primary mb-3">Print Settings</h2>
      <dl className="grid grid-cols-2 gap-3">
        {fields.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-[12px] font-[500] text-text-muted leading-none mb-1">{label}</dt>
            <dd className={cn('text-sm font-medium', value === '—' ? 'text-text-muted' : 'text-text-primary')}>
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
