import { cn } from '@/lib/utils'
import { CATEGORIES, type VoiceEntry } from '@/types'

interface HistoryListProps {
  entries: VoiceEntry[]
  isLoading: boolean
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = Math.max(0, now - then)
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function getCategoryDisplay(category: string) {
  return CATEGORIES.find((c) => c.value === category) ?? { emoji: '📝', label: 'Note' }
}

export function HistoryList({ entries, isLoading }: HistoryListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-serif text-sm font-semibold text-foreground">Recent</h3>
        </div>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="glass rounded-2xl p-4 animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="h-3 w-16 bg-muted rounded mb-2" />
            <div className="h-3 w-full bg-muted rounded mb-1" />
            <div className="h-3 w-2/3 bg-muted rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-10">
        <span className="text-3xl mb-2 block">🌱</span>
        <p className="text-sm text-muted-foreground">
          No entries yet. Start speaking!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {/* Section header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-serif text-sm font-semibold text-foreground">Recent</h3>
        <span className="glass-subtle rounded-full px-2.5 py-0.5 text-xs text-muted-foreground">
          {entries.length}
        </span>
      </div>

      {/* Entry cards */}
      <div className="glass rounded-2xl overflow-hidden">
        {entries.map((entry, index) => {
          const cat = getCategoryDisplay(entry.category)
          const displayText = entry.fixedText ?? entry.originalText
          const isSynced = entry.sentToNotion === '1'
          const isLast = index === entries.length - 1

          return (
            <div
              key={entry.id}
              className={cn(
                'p-4',
                'transition-all duration-300',
                'hover:bg-card/40 hover:shadow-md',
                'animate-fade-in',
                !isLast && 'border-b border-border/30'
              )}
              style={{ animationDelay: `${index * 60}ms` }}
            >
              {/* Top row: badge + timestamp + sync indicator */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 glass-subtle rounded-full px-2 py-0.5 text-[10px] font-medium',
                    'text-muted-foreground'
                  )}
                >
                  <span>{cat.emoji}</span>
                  {cat.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">
                    {timeAgo(entry.createdAt)}
                  </span>
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full',
                      isSynced ? 'bg-primary' : 'bg-muted-foreground/30'
                    )}
                    title={isSynced ? 'Sent to Notion' : 'Not sent'}
                  />
                </div>
              </div>

              {/* Text preview — 2 lines max */}
              <p className="text-sm leading-relaxed text-card-foreground line-clamp-2">
                {displayText}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
