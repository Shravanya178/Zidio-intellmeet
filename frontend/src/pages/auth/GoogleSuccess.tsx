import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'

export default function GoogleSuccessPage() {
  const [params]  = useSearchParams()
  const navigate  = useNavigate()
  const setAuth   = useAuthStore((s) => s.setAuth)

  useEffect(() => {
    const token = params.get('token')
    const id    = params.get('id')
    const name  = params.get('name')
    const email = params.get('email')
    const role  = params.get('role')

    if (token && id && email) {
      setAuth(
        { id, name: name ?? '', email, role: (role as any) ?? 'member', tokenVersion: 0 },
        token
      )
      navigate('/dashboard', { replace: true })
    } else {
      navigate('/login?error=google_failed', { replace: true })
    }
  }, [params, setAuth, navigate])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-muted-foreground">
        <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-sm">Signing you in with Google...</p>
      </div>
    </div>
  )
}
