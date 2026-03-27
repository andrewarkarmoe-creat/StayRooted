import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { blink } from '@/blink/client'
import type { VoiceEntry, Category } from '@/types'

export function useVoiceEntries(userId: string | undefined) {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['voiceEntries', userId],
    queryFn: async () => {
      if (!userId) return []
      const rows = await blink.db.voiceEntries.list({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        limit: 50,
      })
      return rows as VoiceEntry[]
    },
    enabled: !!userId,
  })

  const { mutateAsync: createEntry, isPending: isCreating } = useMutation({
    mutationFn: async (params: {
      originalText: string
      fixedText?: string
      category?: Category
    }) => {
      if (!userId) throw new Error('Not authenticated')
      const result = await blink.db.voiceEntries.create({
        userId,
        originalText: params.originalText,
        fixedText: params.fixedText ?? null,
        category: params.category ?? 'task',
        sentToNotion: 0,
      })
      return result as VoiceEntry
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voiceEntries', userId] })
    },
  })

  const { mutateAsync: updateEntry, isPending: isUpdating } = useMutation({
    mutationFn: async (params: {
      id: string
      sentToNotion?: number
      notionPageId?: string
      fixedText?: string
      category?: Category
    }) => {
      const { id, ...updates } = params
      const result = await blink.db.voiceEntries.update(id, updates)
      return result as VoiceEntry
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voiceEntries', userId] })
    },
  })

  return {
    entries: data ?? [],
    createEntry,
    updateEntry,
    isLoading,
    isCreating,
    isUpdating,
  }
}
