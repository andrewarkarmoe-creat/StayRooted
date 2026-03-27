import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Category } from '@/types'
import { useUserKeys } from '@/hooks/useUserKeys'
import { useVoiceEntries } from '@/hooks/useVoiceEntries'
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder'
import { transcribeAudio } from '@/lib/transcribe'
import { aiFixText } from '@/lib/ai-fix'
import { sendToNotion } from '@/lib/notion'
import { VoiceRecordButton } from '@/components/VoiceRecordButton'
import { AudioUploadButton } from '@/components/AudioUploadButton'
import { NoteArea } from '@/components/NoteArea'
import { HistoryList } from '@/components/HistoryList'
import { SetupKeysModal } from '@/components/SetupKeysModal'

interface AppScreenProps {
  user: { id: string; email?: string; displayName?: string }
  onLogout: () => void
}

export function AppScreen({ user, onLogout }: AppScreenProps) {
  const [displayText, setDisplayText] = useState('')
  const [category, setCategory] = useState<Category>('task')
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isFixing, setIsFixing] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [showSetup, setShowSetup] = useState(false)

  const { keys, saveKeys, isLoading: keysLoading, isSaving } = useUserKeys(user.id)
  const { entries, createEntry, updateEntry, isLoading: entriesLoading } = useVoiceEntries(user.id)

  const handleTranscription = useCallback(async (base64: string) => {
    setIsTranscribing(true)
    try {
      const text = await transcribeAudio(base64)
      setDisplayText(text)
      toast.success('Transcription complete!')
    } catch {
      toast.error('Transcription failed. Please try again.')
    } finally {
      setIsTranscribing(false)
    }
  }, [])

  const { isRecording, startRecording, stopRecording } = useVoiceRecorder({
    onRecordingComplete: handleTranscription,
  })

  const handleAiFix = async () => {
    if (!displayText) return
    setIsFixing(true)
    try {
      const fixed = await aiFixText(displayText)
      setDisplayText(fixed)
      toast.success('Text cleaned up!')
    } catch {
      toast.error('AI fix failed. Please try again.')
    } finally {
      setIsFixing(false)
    }
  }

  const handleCopy = async () => {
    if (!displayText) return
    try {
      await navigator.clipboard.writeText(displayText)
      toast.success('Copied to clipboard!')
    } catch {
      toast.error('Failed to copy.')
    }
  }

  const handleSendToNotion = async () => {
    if (!displayText || !keys?.notionToken || !keys?.notionDatabaseId) return
    setIsSending(true)
    try {
      const { pageId } = await sendToNotion({
        notionToken: keys.notionToken,
        databaseId: keys.notionDatabaseId,
        text: displayText,
        category,
      })
      const entry = await createEntry({
        originalText: displayText,
        fixedText: displayText,
        category,
      })
      await updateEntry({
        id: entry.id,
        sentToNotion: 1,
        notionPageId: pageId,
      })
      toast.success('Sent to Notion! 🚀')
      setDisplayText('')
      setCategory('task')
    } catch {
      toast.error('Failed to send to Notion.')
    } finally {
      setIsSending(false)
    }
  }

  const handleSaveKeys = async (params: {
    notionToken: string
    notionDatabaseId: string
    geminiModel: string
  }) => {
    await saveKeys(params)
    toast.success('Keys saved!')
  }

  const userInitial = (user.displayName?.[0] ?? user.email?.[0] ?? '?').toUpperCase()
  const hasKeys = !!(keys?.notionToken && keys?.notionDatabaseId)
  const isProcessing = isTranscribing

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Mesh gradient background orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full animate-mesh-1 opacity-80"
          style={{
            background:
              'radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-[300px] h-[300px] rounded-full animate-mesh-2 opacity-80"
          style={{
            background:
              'radial-gradient(circle, hsl(var(--accent) / 0.04) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Top bar */}
      <header className="sticky top-0 z-30 glass-strong border-b border-border/40">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-gradient font-serif text-lg font-semibold tracking-tight">
            StayRooted
          </h1>
          <div className="flex items-center gap-2">
            {/* Settings */}
            <button
              onClick={() => setShowSetup(true)}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center',
                'text-muted-foreground hover:text-foreground hover:bg-muted/60',
                'transition-all duration-200 hover:scale-105 active:scale-95'
              )}
              title="Setup Keys"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
            {/* User avatar */}
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center',
                'bg-primary text-primary-foreground text-xs font-semibold',
                'shadow-sm transition-transform duration-200 hover:scale-105'
              )}
              title={user.displayName ?? user.email ?? ''}
            >
              {userInitial}
            </div>
            {/* Logout */}
            <button
              onClick={onLogout}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center',
                'text-muted-foreground hover:text-destructive hover:bg-destructive/10',
                'transition-all duration-200 hover:scale-105 active:scale-95'
              )}
              title="Sign out"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-lg mx-auto px-4 py-8 space-y-8">
        {/* Keys setup nudge */}
        {!keysLoading && !hasKeys && (
          <div
            className={cn(
              'flex items-center gap-3 p-3 rounded-2xl',
              'glass border-accent/20',
              'animate-fade-in'
            )}
          >
            <span className="text-lg">🔑</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground font-medium">Set up your Notion keys</p>
              <p className="text-[10px] text-muted-foreground">Connect to start syncing your voice notes.</p>
            </div>
            <button
              onClick={() => setShowSetup(true)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium',
                'bg-accent text-accent-foreground',
                'hover:scale-[1.03] active:scale-[0.97]',
                'transition-all duration-200'
              )}
            >
              Setup
            </button>
          </div>
        )}

        {/* Record section */}
        <div className="flex flex-col items-center gap-3 pt-4">
          <VoiceRecordButton
            isRecording={isRecording}
            isProcessing={isProcessing}
            onStart={startRecording}
            onStop={stopRecording}
          />
          <AudioUploadButton
            onFileSelected={handleTranscription}
            disabled={isRecording || isProcessing}
          />
        </div>

        {/* Note area */}
        <NoteArea
          text={displayText}
          onTextChange={setDisplayText}
          category={category}
          onCategoryChange={setCategory}
          onAiFix={handleAiFix}
          isFixing={isFixing}
          onCopy={handleCopy}
          onSendToNotion={handleSendToNotion}
          isSending={isSending}
          hasKeys={hasKeys}
          disabled={isRecording || isTranscribing}
        />

        {/* Divider */}
        <div className="border-t border-border/40" />

        {/* History */}
        <HistoryList entries={entries} isLoading={entriesLoading} />
      </main>

      {/* Setup Keys Modal */}
      <SetupKeysModal
        isOpen={showSetup}
        onClose={() => setShowSetup(false)}
        currentKeys={keys}
        onSave={handleSaveKeys}
        isSaving={isSaving}
      />
    </div>
  )
}
