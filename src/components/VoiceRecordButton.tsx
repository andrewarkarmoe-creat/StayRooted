import { cn } from '@/lib/utils'

interface VoiceRecordButtonProps {
  isRecording: boolean
  isProcessing: boolean
  onStart: () => void
  onStop: () => void
}

export function VoiceRecordButton({
  isRecording,
  isProcessing,
  onStart,
  onStop,
}: VoiceRecordButtonProps) {
  const handleClick = () => {
    if (isProcessing) return
    if (isRecording) {
      onStop()
    } else {
      onStart()
    }
  }

  const statusText = isProcessing
    ? 'Processing…'
    : isRecording
      ? 'Recording… tap to stop'
      : 'Tap to record'

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Button wrapper with pulse rings */}
      <div className="relative flex items-center justify-center">
        {/* Aesthetic outer ring frame */}
        <div className="absolute w-28 h-28 rounded-full border border-primary/10" />

        {/* Pulse rings when recording */}
        {isRecording && (
          <>
            <span className="absolute w-24 h-24 rounded-full bg-destructive/25 animate-pulse-ring" />
            <span
              className="absolute w-24 h-24 rounded-full bg-destructive/25 animate-pulse-ring"
              style={{ animationDelay: '0.7s' }}
            />
          </>
        )}

        {/* Main button */}
        <button
          onClick={handleClick}
          disabled={isProcessing}
          className={cn(
            'relative z-10 w-24 h-24 rounded-full',
            'flex items-center justify-center',
            'shadow-lg transition-all duration-300',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            'hover:scale-105 active:scale-95',
            'disabled:opacity-60 disabled:pointer-events-none',
            isRecording
              ? 'bg-destructive text-destructive-foreground animate-glow-red'
              : 'bg-primary text-primary-foreground animate-glow'
          )}
        >
          {isRecording ? (
            /* Wave bars animation */
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className="w-1 rounded-full bg-destructive-foreground wave-bar"
                  style={{
                    animationDelay: `${i * 0.15}s`,
                    height: '8px',
                  }}
                />
              ))}
            </div>
          ) : isProcessing ? (
            <span className="animate-spin rounded-full h-7 w-7 border-2 border-primary-foreground border-t-transparent" />
          ) : (
            <span className="text-3xl" role="img" aria-label="microphone">
              🎙️
            </span>
          )}
        </button>
      </div>

      {/* Status text */}
      <p className="text-xs text-muted-foreground font-medium tracking-wide">
        {statusText}
      </p>
    </div>
  )
}
