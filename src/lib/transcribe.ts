import { blink } from '@/blink/client'

/**
 * Transcribe a base64-encoded audio clip using Blink AI (Whisper).
 * Language is set to Burmese ('my').
 */
export async function transcribeAudio(audioBase64: string): Promise<string> {
  const { text } = await blink.ai.transcribeAudio({
    audio: audioBase64,
    language: 'my', // Burmese
  })
  return text
}

/**
 * Convert a Blob to a base64 string (without the data-URL prefix).
 * Uses FileReader which is safe for large files — never use btoa + fromCharCode.
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      resolve(dataUrl.split(',')[1]) // strip "data:audio/...;base64,"
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
