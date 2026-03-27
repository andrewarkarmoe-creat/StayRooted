import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { UserKeys } from '@/types'

interface SetupKeysModalProps {
  isOpen: boolean
  onClose: () => void
  currentKeys: UserKeys | null
  onSave: (params: {
    notionToken: string
    notionDatabaseId: string
    geminiModel: string
  }) => Promise<void>
  isSaving: boolean
}

const GEMINI_MODELS = [
  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
]

export function SetupKeysModal({
  isOpen,
  onClose,
  currentKeys,
  onSave,
  isSaving,
}: SetupKeysModalProps) {
  const [notionToken, setNotionToken] = useState('')
  const [notionDatabaseId, setNotionDatabaseId] = useState('')
  const [geminiModel, setGeminiModel] = useState('gemini-2.0-flash')
  const [showToken, setShowToken] = useState(false)

  useEffect(() => {
    if (currentKeys) {
      setNotionToken(currentKeys.notionToken ?? '')
      setNotionDatabaseId(currentKeys.notionDatabaseId ?? '')
      setGeminiModel(currentKeys.geminiModel || 'gemini-2.0-flash')
    }
  }, [currentKeys])

  if (!isOpen) return null

  const handleSave = async () => {
    await onSave({ notionToken, notionDatabaseId, geminiModel })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-foreground/30 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative z-10 w-full max-w-md',
          'glass-strong rounded-3xl shadow-2xl',
          'p-6 animate-scale-in'
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={cn(
            'absolute top-4 right-4 w-9 h-9 rounded-full',
            'flex items-center justify-center',
            'text-muted-foreground hover:text-foreground',
            'hover:glass-subtle',
            'transition-all duration-200'
          )}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* Title */}
        <div className="flex items-center gap-2.5 mb-6">
          <span className="text-lg">⚙️</span>
          <h2 className="font-serif text-xl font-semibold text-foreground">Setup Keys</h2>
        </div>

        {/* Fields */}
        <div className="space-y-5">
          {/* Notion Token */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Notion Integration Token
            </label>
            <div className="glass rounded-2xl transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/20">
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={notionToken}
                  onChange={(e) => setNotionToken(e.target.value)}
                  placeholder="secret_..."
                  className={cn(
                    'w-full px-4 py-3 pr-14 rounded-2xl text-sm',
                    'bg-transparent text-foreground placeholder:text-muted-foreground',
                    'focus:outline-none',
                    'transition-all duration-200'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className={cn(
                    'absolute right-3 top-1/2 -translate-y-1/2',
                    'px-2 py-0.5 rounded-lg text-xs font-medium',
                    'text-muted-foreground hover:text-foreground',
                    'transition-colors duration-150'
                  )}
                >
                  {showToken ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          </div>

          {/* Database ID */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Notion Database ID
            </label>
            <div className="glass rounded-2xl transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/20">
              <input
                type="text"
                value={notionDatabaseId}
                onChange={(e) => setNotionDatabaseId(e.target.value)}
                placeholder="abc123..."
                className={cn(
                  'w-full px-4 py-3 rounded-2xl text-sm',
                  'bg-transparent text-foreground placeholder:text-muted-foreground',
                  'focus:outline-none',
                  'transition-all duration-200'
                )}
              />
            </div>
          </div>

          {/* Gemini Model */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Gemini Model
            </label>
            <div className="glass rounded-2xl transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/20">
              <select
                value={geminiModel}
                onChange={(e) => setGeminiModel(e.target.value)}
                className={cn(
                  'w-full px-4 py-3 rounded-2xl text-sm appearance-none',
                  'bg-transparent text-foreground',
                  'focus:outline-none',
                  'transition-all duration-200',
                  'cursor-pointer'
                )}
              >
                {GEMINI_MODELS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving || !notionToken || !notionDatabaseId}
          className={cn(
            'w-full mt-6 px-6 py-3 rounded-2xl text-sm font-medium',
            'bg-primary text-primary-foreground',
            'shadow-md hover:shadow-lg',
            'transition-all duration-200',
            'hover:scale-[1.01] active:scale-[0.99]',
            'disabled:opacity-50 disabled:pointer-events-none',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        >
          {isSaving ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
              Saving…
            </span>
          ) : (
            'Save Keys'
          )}
        </button>
      </div>
    </div>
  )
}
