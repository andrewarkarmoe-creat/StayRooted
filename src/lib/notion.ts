/**
 * Send a voice entry to a Notion database via edge-function proxy.
 * The proxy avoids CORS issues with the Notion API.
 * Requires Blink auth token since the function has verify_jwt enabled.
 */

import { blink } from '@/blink/client'

const NOTION_PROXY_URL = 'https://7h5mevut--notion-proxy.functions.blink.new'

interface SendToNotionParams {
  notionToken: string
  databaseId: string
  text: string
  category: string
}

interface SendToNotionResult {
  pageId: string
}

export async function sendToNotion(params: SendToNotionParams): Promise<SendToNotionResult> {
  const { notionToken, databaseId, text, category } = params

  // Get a valid auth token for the edge function (verify_jwt is enabled)
  const token = await blink.auth.getValidToken()

  const response = await fetch(NOTION_PROXY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      notionToken,
      databaseId,
      text,
      category,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      (error as { error?: string }).error ?? `Notion proxy error: ${response.status}`
    )
  }

  const data = (await response.json()) as { success: boolean; pageId: string }
  return { pageId: data.pageId }
}
