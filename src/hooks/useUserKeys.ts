import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { blink } from '@/blink/client'
import type { UserKeys } from '@/types'

export function useUserKeys(userId: string | undefined) {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['userKeys', userId],
    queryFn: async () => {
      if (!userId) return null
      const rows = await blink.db.userKeys.list({
        where: { userId },
        limit: 1,
      })
      return (rows as UserKeys[])[0] ?? null
    },
    enabled: !!userId,
  })

  const { mutateAsync: saveKeys, isPending: isSaving } = useMutation({
    mutationFn: async (params: {
      notionToken: string
      notionDatabaseId: string
      geminiModel?: string
    }) => {
      if (!userId) throw new Error('Not authenticated')

      const result = await blink.db.userKeys.upsert({
        ...(data?.id ? { id: data.id } : {}),
        userId,
        notionToken: params.notionToken,
        notionDatabaseId: params.notionDatabaseId,
        geminiModel: params.geminiModel ?? 'gemini-2.0-flash',
      })
      return result as UserKeys
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userKeys', userId] })
    },
  })

  return {
    keys: data ?? null,
    saveKeys,
    isLoading,
    isSaving,
  }
}
