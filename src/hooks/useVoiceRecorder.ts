import { useState, useRef, useEffect, useCallback } from 'react'
import { blobToBase64 } from '@/lib/transcribe'

interface UseVoiceRecorderOptions {
  /** Called with the base64-encoded audio when recording stops */
  onRecordingComplete: (base64: string) => void
}

export function useVoiceRecorder({ onRecordingComplete }: UseVoiceRecorderOptions) {
  const [isRecording, setIsRecording] = useState(false)

  // ✅ Use refs — NOT state — for MediaRecorder internals
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const callbackRef = useRef(onRecordingComplete)

  // Keep callback ref in sync so the onstop handler always calls the latest version
  useEffect(() => {
    callbackRef.current = onRecordingComplete
  }, [onRecordingComplete])

  // Cleanup on unmount — stop tracks to release microphone
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      chunksRef.current = [] // reset

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data) // synchronous push
        }
      }

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        chunksRef.current = [] // clear for next recording

        try {
          const base64 = await blobToBase64(audioBlob)
          callbackRef.current(base64)
        } catch (err) {
          console.error('Failed to convert recording to base64:', err)
        }
      }

      recorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error('Failed to start recording:', err)
      throw err
    }
  }, [])

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop()
    streamRef.current?.getTracks().forEach((t) => t.stop())
    setIsRecording(false)
  }, [])

  return { isRecording, startRecording, stopRecording }
}
