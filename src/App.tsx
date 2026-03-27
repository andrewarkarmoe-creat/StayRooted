import { useAuth } from '@/hooks/useAuth'
import { WelcomePage } from '@/components/WelcomePage'
import { AppScreen } from '@/components/AppScreen'

function App() {
  const { user, isLoading, login, logout } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          <p className="text-xs text-muted-foreground">Loading…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <WelcomePage onLogin={login} />
  }

  return <AppScreen user={user} onLogout={logout} />
}

export default App