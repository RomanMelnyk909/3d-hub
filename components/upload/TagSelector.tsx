'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { PREDEFINED_TAGS } from '@/lib/constants'
import { useWizardStore } from '@/stores/wizardStore'

export function TagSelector() {
  const [inputValue, setInputValue] = useState('')
  const { selectedPredefinedTagIds, customTagNames, togglePredefinedTag, addCustomTag, removeCustomTag } =
    useWizardStore()

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const trimmed = inputValue.trim()
      if (trimmed && trimmed.length <= 50) {
        addCustomTag(trimmed)
        setInputValue('')
      }
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-text-primary mb-2">Categories</p>
        <div className="flex flex-wrap gap-2">
          {PREDEFINED_TAGS.map((tag) => {
            const selected = selectedPredefinedTagIds.includes(tag.id)
            return (
              <button
                key={tag.id}
                role="checkbox"
                aria-checked={selected}
                onClick={() => togglePredefinedTag(tag.id)}
                className={cn(
                  'px-3 py-1 rounded-full text-sm border-2 transition-colors',
                  selected
                    ? 'bg-brand-primary border-brand-primary text-white'
                    : 'bg-bg-page border-border text-text-muted hover:border-brand-primary/50'
                )}
              >
                {tag.name}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-text-primary mb-2 mt-4">Custom Tags</p>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add custom tag..."
          aria-label="Add custom tag"
          className="w-full rounded-md border border-border bg-bg-page px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
        <div aria-live="polite" className="flex flex-wrap gap-2 mt-2">
          {customTagNames.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-brand-light border border-brand-primary text-text-primary"
            >
              <span>{name}</span>
              <button
                onClick={() => removeCustomTag(name)}
                aria-label={`Remove tag ${name}`}
                className="ml-1 leading-none hover:text-destructive"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
