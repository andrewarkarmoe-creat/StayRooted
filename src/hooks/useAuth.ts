import { useState, useEffect } from 'react'
import { blink } from '@/blink/client'

interface BlinkUser {
  id: string
  email?: string
  displayName?: string
  avatarUrl?: string
  role?: string
}

export function useAuth() {
  const [user, setUser] = useState<BlinkUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user as BlinkUser | null)
      if (!state.isLoading) setIsLoading(false)
    })
    return unsubscribe
  }, [])

  const login = () => blink.auth.login(window.location.href)
  const logout = () => blink.auth.logout()

  return { user, isLoading, login, logout }
}
