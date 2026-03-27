import { useRef } from 'react'
import { cn } from '@/lib/utils'
import { blobToBase64 } from '@/lib/transcribe'

interface AudioUploadButtonProps {
  onFileSelected: (base64: string) => void
  disabled: boolean
}

export function AudioUploadButton({ onFileSelected, disabled }: AudioUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const base64 = await blobToBase64(file)
    onFileSelected(base64)

    // Reset input so the same file can be re-selected
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="text-center">
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className={cn(
          'text-xs text-muted-foreground/80 hover:text-accent',
          'underline underline-offset-2 decoration-muted-foreground/30 hover:decoration-accent',
          'transition-all duration-200',
          'disabled:opacity-50 disabled:pointer-events-none'
        )}
      >
        or upload an audio file
      </button>
    </div>
  )
}
