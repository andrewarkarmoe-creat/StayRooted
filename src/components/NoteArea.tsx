import { cn } from '@/lib/utils'
import { CATEGORIES, type Category } from '@/types'

interface NoteAreaProps {
  text: string
  onTextChange: (text: string) => void
  category: Category
  onCategoryChange: (cat: Category) => void
  onAiFix: () => void
  isFixing: boolean
  onCopy: () => void
  onSendToNotion: () => void
  isSending: boolean
  hasKeys: boolean
  disabled: boolean
}

export function NoteArea({
  text,
  onTextChange,
  category,
  onCategoryChange,
  onAiFix,
  isFixing,
  onCopy,
  onSendToNotion,
  isSending,
  hasKeys,
  disabled,
}: NoteAreaProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Category chips — horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onCategoryChange(cat.value)}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium',
              'whitespace-nowrap',
              'transition-all duration-200',
              'hover:scale-[1.04] active:scale-[0.96]',
              category === cat.value
                ? 'glass-strong shadow-sm ring-1 ring-primary/30 text-foreground'
                : 'glass-subtle text-muted-foreground hover:text-foreground'
            )}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Textarea with glass wrapper */}
      <div className="glass rounded-2xl p-1">
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Your voice note will appear here…"
          disabled={disabled}
          className={cn(
            'w-full min-h-[180px] p-4 rounded-xl text-sm leading-relaxed resize-none',
            'bg-transparent text-foreground',
            'placeholder:text-muted-foreground/60',
            'focus:outline-none',
            'transition-all duration-200',
            'disabled:opacity-50'
          )}
        />
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-2">
        {/* AI Fix Text button with shimmer on hover */}
        <button
          onClick={onAiFix}
          disabled={!text || isFixing || disabled}
          className={cn(
            'group relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium',
            'glass overflow-hidden',
            'text-accent-foreground',
            'transition-all duration-200',
            'hover:scale-[1.03] active:scale-[0.97]',
            'disabled:opacity-50 disabled:pointer-events-none'
          )}
        >
          {/* Shimmer overlay on hover */}
          <span
            className={cn(
              'pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100',
              'transition-opacity duration-300',
              'bg-gradient-to-r from-transparent via-primary/10 to-transparent',
              'animate-shimmer'
            )}
          />
          {isFixing ? (
            <>
              <span className="animate-spin rounded-full h-3 w-3 border-[1.5px] border-accent-foreground border-t-transparent" />
              Fixing…
            </>
          ) : (
            <>
              <span>✨</span>
              AI Fix Text
            </>
          )}
        </button>

        {/* Copy button */}
        <button
          onClick={onCopy}
          disabled={!text || disabled}
          className={cn(
            'group relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium',
            'glass overflow-hidden',
            'text-muted-foreground',
            'transition-all duration-200',
            'hover:scale-[1.03] active:scale-[0.97]',
            'hover:text-foreground',
            'disabled:opacity-50 disabled:pointer-events-none'
          )}
        >
          {/* Shimmer overlay on hover */}
          <span
            className={cn(
              'pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100',
              'transition-opacity duration-300',
              'bg-gradient-to-r from-transparent via-primary/10 to-transparent',
              'animate-shimmer'
            )}
          />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copy
        </button>
      </div>

      {/* Send to Notion button */}
      <button
        onClick={onSendToNotion}
        disabled={!text || !hasKeys || isSending || disabled}
        className={cn(
          'w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-medium',
          'bg-primary text-primary-foreground',
          'shadow-md hover:shadow-lg',
          'transition-all duration-200',
          'hover:scale-[1.01] active:scale-[0.99]',
          'disabled:opacity-50 disabled:pointer-events-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
        )}
      >
        {isSending ? (
          <>
            <span className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
            Sending…
          </>
        ) : (
          <>
            <span>🚀</span>
            Send to Notion
          </>
        )}
      </button>

      {!hasKeys && text && (
        <p className="text-xs text-muted-foreground text-center">
          Set up your Notion keys first to send notes.
        </p>
      )}
    </div>
  )
}
