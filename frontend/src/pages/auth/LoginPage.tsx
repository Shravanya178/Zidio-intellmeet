import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { authService } from '../../services/auth.service'
import { useMutation } from '@tanstack/react-query'
import { Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useToast } from '../../components/Toast'

export default function LoginPage() {
  const navigate  = useNavigate()
  const setAuth   = useAuthStore((s) => s.setAuth)
  const { toast } = useToast()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [remember, setRemember] = useState(false)
  const [touched,  setTouched]  = useState({ email: false, password: false })

  const emailValid    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const passwordValid = password.length >= 8

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken)
      toast('success', `Welcome back, ${data.user.name?.split(' ')[0] ?? 'there'}!`)
      const redirect = sessionStorage.getItem('redirectAfterLogin')
      if (redirect) { sessionStorage.removeItem('redirectAfterLogin'); navigate(redirect) }
      else navigate('/dashboard')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ email: true, password: true })
    if (!emailValid || !passwordValid) return
    loginMutation.mutate({ email, password })
  }

  const inputBase = 'w-full h-11 pl-10 rounded-xl border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200'
  const inputOk   = 'border-input focus:ring-ring/60 focus:border-primary/50'
  const inputErr  = 'border-destructive/50 focus:ring-destructive/30 bg-destructive/5'

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Welcome back</h2>
        <p className="text-muted-foreground text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline underline-offset-4">
            Create one free
          </Link>
        </p>
      </div>

      {loginMutation.isError && (
        <div className="flex items-start gap-2.5 bg-destructive/8 border border-destructive/20 text-destructive rounded-xl px-4 py-3 text-sm animate-in fade-in duration-200">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>Invalid email or password. Please check your credentials and try again.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Email address</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((p) => ({ ...p, email: true }))}
              placeholder="you@company.com"
              className={`${inputBase} pr-4 ${touched.email && !emailValid ? inputErr : inputOk}`}
            />
          </div>
          {touched.email && !emailValid && (
            <p className="text-xs text-destructive flex items-center gap-1 animate-in fade-in duration-150">
              <AlertCircle size={11} /> Please enter a valid email address.
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Password</label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline underline-offset-4">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((p) => ({ ...p, password: true }))}
              placeholder="••••••••"
              className={`${inputBase} pr-10 ${touched.password && !passwordValid ? inputErr : inputOk}`}
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {touched.password && !passwordValid && (
            <p className="text-xs text-destructive flex items-center gap-1 animate-in fade-in duration-150">
              <AlertCircle size={11} /> Password must be at least 8 characters.
            </p>
          )}
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer group w-fit">
          <div className="relative">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="sr-only" />
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-150 ${remember ? 'bg-primary border-primary' : 'border-border group-hover:border-primary/50'}`}>
              {remember && (
                <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                  <path d="M1 3.5l2.5 2.5 4.5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Remember me for 30 days</span>
        </label>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full h-11 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-55 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-primary/25"
        >
          {loginMutation.isPending ? (
            <>
              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Signing in...
            </>
          ) : (
            <>Sign in <ArrowRight size={15} /></>
          )}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center"><span className="bg-background px-3 text-xs text-muted-foreground">or continue with</span></div>
      </div>

      <button
        onClick={authService.loginWithGoogle}
        className="w-full h-11 flex items-center justify-center gap-3 rounded-xl border border-border bg-background hover:bg-muted/60 text-foreground text-sm font-medium transition-all duration-200 active:scale-[0.98]"
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>
    </div>
  )
}
