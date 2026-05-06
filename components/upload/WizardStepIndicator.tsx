'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = ['Files', 'Photos', 'Details', 'Tags', 'Preview']

interface WizardStepIndicatorProps {
  currentStep: number
}

export function WizardStepIndicator({ currentStep }: WizardStepIndicatorProps) {
  return (
    <div role="tablist" className="flex items-start justify-between w-full mb-8">
      {STEPS.map((label, index) => {
        const step = index + 1
        const isCompleted = step < currentStep
        const isActive = step === currentStep

        return (
          <div key={step} className="flex-1 flex flex-col items-center relative">
            {/* Connecting line before (except first) */}
            {index > 0 && (
              <div
                className={cn(
                  'absolute top-4 right-1/2 w-full h-0.5 -translate-y-1/2',
                  step < currentStep ? 'bg-brand-primary' : 'bg-muted',
                )}
              />
            )}

            <div
              role="tab"
              aria-current={isActive ? 'step' : undefined}
              className={cn(
                'relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2',
                isCompleted && 'bg-brand-primary border-brand-primary text-white',
                isActive && 'bg-brand-primary border-brand-primary text-white',
                !isCompleted && !isActive && 'bg-bg-page border-muted text-text-muted',
              )}
            >
              {isCompleted ? <Check size={14} /> : step}
            </div>

            <span
              className={cn(
                'text-xs mt-1',
                isActive ? 'text-brand-primary font-medium' : 'text-text-muted',
              )}
            >
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
