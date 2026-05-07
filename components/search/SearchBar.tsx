'use client'

import { Fragment, useReducer, useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/useModelSearch'
import type { SearchSuggestion } from '@/types/search'

type SuggestState = {
  suggestions: SearchSuggestion[]
  isLoading: boolean
  isOpen: boolean
}

type SuggestAction =
  | { type: 'loading' }
  | { type: 'success'; suggestions: SearchSuggestion[] }
  | { type: 'error' }
  | { type: 'close' }
  | { type: 'reset' }

function suggestReducer(state: SuggestState, action: SuggestAction): SuggestState {
  switch (action.type) {
    case 'loading': return { ...state, isLoading: true }
    case 'success': return { suggestions: action.suggestions, isLoading: false, isOpen: action.suggestions.length > 0 }
    case 'error': return { suggestions: [], isLoading: false, isOpen: false }
    case 'close': return { ...state, isOpen: false }
    case 'reset': return { suggestions: [], isLoading: false, isOpen: false }
  }
}

export function SearchBar() {
  const router = useRouter()
  const [value, setValue] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const [suggest, dispatch] = useReducer(suggestReducer, { suggestions: [], isLoading: false, isOpen: false })
  const debouncedValue = useDebounce(value, 300)
  const inputRef = useRef<HTMLInputElement>(null)

  const showDropdown = suggest.isOpen && debouncedValue.length >= 2 && suggest.suggestions.length > 0

  useEffect(() => {
    if (debouncedValue.length < 2) {
      dispatch({ type: 'reset' })
      return
    }
    let cancelled = false
    dispatch({ type: 'loading' })
    fetch(`/api/search?q=${encodeURIComponent(debouncedValue)}&suggest=1`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data: unknown) => {
        if (!cancelled) {
          if (Array.isArray(data)) {
            dispatch({ type: 'success', suggestions: data as SearchSuggestion[] })
            setActiveIndex(-1)
          } else {
            dispatch({ type: 'error' })
          }
        }
      })
      .catch(() => { if (!cancelled) dispatch({ type: 'error' }) })
    return () => { cancelled = true }
  }, [debouncedValue])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (inputRef.current && !inputRef.current.closest('form')?.contains(e.target as Node)) {
        dispatch({ type: 'close' })
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value
    setValue(next)
    setActiveIndex(-1)
    if (next.length < 2) dispatch({ type: 'close' })
  }

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    if (!value.trim()) return
    dispatch({ type: 'close' })
    router.push(`/search?q=${encodeURIComponent(value.trim())}`)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      dispatch({ type: 'close' })
      setActiveIndex(-1)
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, suggest.suggestions.length - 1))
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, -1))
    }
    if (e.key === 'Enter') {
      if (activeIndex >= 0 && suggest.suggestions[activeIndex]) {
        e.preventDefault()
        dispatch({ type: 'close' })
        router.push(suggest.suggestions[activeIndex].url)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className={cn(
        'flex items-center rounded-md border bg-bg-card px-3 py-2 gap-2 transition-colors',
        'border-border focus-within:border-brand-primary'
      )}>
        {suggest.isLoading
          ? <Loader2 size={16} className="text-text-muted shrink-0 animate-spin" />
          : <Search size={16} className="text-text-muted shrink-0" />
        }
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Search models, tags, creators…"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="search-suggestions"
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
          className="flex-1 bg-transparent outline-none text-sm text-text-primary placeholder:text-text-muted"
        />
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-bg-card border border-border rounded-md shadow-lg z-50 max-h-72 overflow-y-auto">
          <div
            id="search-suggestions"
            role="listbox"
            aria-live="polite"
            aria-label="Search suggestions"
          >
            {suggest.suggestions.map((s, i) => {
              const showHeader = s.type !== suggest.suggestions[i - 1]?.type
              return (
                <Fragment key={`${s.type}-${s.id}`}>
                  {showHeader && (
                    <div role="presentation" className="px-4 pt-2 pb-1 text-xs font-semibold text-text-muted uppercase tracking-wider">
                      {s.type === 'model' ? 'Models' : s.type === 'tag' ? 'Tags' : 'Creators'}
                    </div>
                  )}
                  <div
                    id={`suggestion-${i}`}
                    role="option"
                    aria-selected={i === activeIndex}
                    className={cn(
                      'px-4 py-2 cursor-pointer text-sm',
                      i === activeIndex ? 'bg-brand-primary/10 text-brand-primary' : 'hover:bg-muted'
                    )}
                    onMouseDown={(e) => { e.preventDefault(); setValue(s.label); router.push(s.url) }}
                  >
                    {s.label}
                  </div>
                </Fragment>
              )
            })}
          </div>
        </div>
      )}
    </form>
  )
}
