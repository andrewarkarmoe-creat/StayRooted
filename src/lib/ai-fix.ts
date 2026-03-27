import { blink } from '@/blink/client'

const BURMESE_PROOFREADER_PROMPT = `You are a Burmese text proofreader. Your ONLY job is to fix spelling mistakes, spacing issues, and punctuation errors in the given Burmese text. Rules:
- Do NOT change the meaning of the text
- Do NOT rephrase, summarize, or expand the text
- Do NOT translate the text
- Do NOT add explanations
- Only output the corrected text, nothing else
- If the text is already correct, return it unchanged`

/**
 * Fix spelling / spacing / punctuation in Burmese text using AI.
 * The model is instructed to never change meaning — only fix surface errors.
 */
export async function aiFixText(text: string): Promise<string> {
  const { text: fixed } = await blink.ai.generateText({
    messages: [
      { role: 'system', content: BURMESE_PROOFREADER_PROMPT },
      { role: 'user', content: text },
    ],
    maxTokens: 2000,
    temperature: 0.1,
  })
  return fixed
}
