// ---- Domain Types for StayRooted ----

export type Category = 'task' | 'idea' | 'journal' | 'reminder' | 'note'

export interface UserKeys {
  id: string
  userId: string
  notionToken: string | null
  notionDatabaseId: string | null
  geminiModel: string
  createdAt: string
  updatedAt: string
}

export interface VoiceEntry {
  id: string
  userId: string
  originalText: string
  fixedText: string | null
  category: Category
  /** SQLite stores booleans as "0"/"1" strings */
  sentToNotion: string
  notionPageId: string | null
  createdAt: string
}

/** Main screen application state */
export interface AppState {
  /** Current step in the voice workflow */
  step: 'idle' | 'recording' | 'transcribing' | 'fixing' | 'categorizing' | 'sending' | 'done' | 'error'
  /** Raw transcribed text (Burmese) */
  originalText: string
  /** AI-corrected text */
  fixedText: string
  /** Auto-detected or user-selected category */
  category: Category
  /** Error message if step === 'error' */
  errorMessage: string | null
}

export const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: 'task', label: 'Task', emoji: '✅' },
  { value: 'idea', label: 'Idea', emoji: '💡' },
  { value: 'journal', label: 'Journal', emoji: '📓' },
  { value: 'reminder', label: 'Reminder', emoji: '⏰' },
  { value: 'note', label: 'Note', emoji: '📝' },
]
