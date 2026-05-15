import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { useMutation } from '@tanstack/react-query'
import { authService } from '../../services/auth.service'
import { User, Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff, Check } from 'lucide-react'
import { useToast } from '../../components/Toast'


function getPasswordStrength(pwd: string): { score: number; label: string; color: string } {
  if (pwd.length === 0) return { score: 0, label: '', color: '' }
  let score = 0
  if (pwd.length >= 8) score++
  if (pwd.length >= 12) score++
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++
  if (/\d/.test(pwd)) score++
  if (/[^a-zA-Z0-9]/.test(pwd)) score++

  if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' }
  if (score === 3) return { score, label: 'Fair', color: 'bg-amber-500' }
  if (score === 4) return { score, label: 'Good', color: 'bg-emerald-500' }
  return { score, label: 'Strong', color: 'bg-emerald-600' }
}

export default function RegisterPage() {
  const navigate  = useNavigate()
  const setAuth   = useAuthStore((s) => s.setAuth)
  const { toast } = useToast()

  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [showPwd, setShowPwd] = useState({ password: false, confirm: false })
  const [touched, setTouched] = useState({ fullName: false, email: false, password: false, confirmPassword: false })

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
  const passwordValid = form.password.length >= 8
  const confirmValid = form.confirmPassword === form.password && form.confirmPassword.length > 0
  const strength = getPasswordStrength(form.password)

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken)
      toast('success', `Welcome to IntellMeet, ${data.user.name?.split(' ')[0] ?? 'there'}!`)
      navigate('/dashboard')
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ fullName: true, email: true, password: true, confirmPassword: true })
    if (!form.fullName.trim() || !emailValid || !passwordValid || !confirmValid) return
    registerMutation.mutate({ name: form.fullName, email: form.email, password: form.password })
  }

  const inputBase = 'w-full h-11 pl-10 rounded-xl border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200'
  const inputOk   = 'border-input focus:ring-ring/60 focus:border-primary/50'
  const inputErr  = 'border-destructive/50 focus:ring-destructive/30 bg-destructive/5'

  const errorMsg = registerMutation.isError
    ? ((registerMutation.error as any)?.response?.data?.message ?? 'Registration failed. Please try again.')
    : null

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Create your account</h2>
        <p className="text-muted-foreground text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-2.5 bg-destructive/8 border border-destructive/20 text-destructive rounded-xl px-4 py-3 text-sm animate-in fade-in duration-200">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Full name</label>
          <div className="relative">
            <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              name="fullName"
              type="text"
              value={form.fullName}
              onChange={handleChange}
              onBlur={() => setTouched((p) => ({ ...p, fullName: true }))}
              placeholder="Jane Smith"
              className={`${inputBase} pr-4 ${touched.fullName && !form.fullName.trim() ? inputErr : inputOk}`}
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Email address</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
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

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Password</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              name="password"
              type={showPwd.password ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              onBlur={() => setTouched((p) => ({ ...p, password: true }))}
              placeholder="Min. 8 characters"
              minLength={8}
              className={`${inputBase} pr-10 ${touched.password && !passwordValid ? inputErr : inputOk}`}
            />
            <button
              type="button"
              onClick={() => setShowPwd((p) => ({ ...p, password: !p.password }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPwd.password ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {/* Password strength */}
          {form.password.length > 0 && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${(strength.score / 5) * 100}%` }}
                  />
                </div>
                <span className={`text-xs font-semibold ${strength.score <= 2 ? 'text-red-600 dark:text-red-400' : strength.score === 3 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {strength.label}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                <div className={`flex items-center gap-1.5 ${form.password.length >= 8 ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                  <Check size={11} className={form.password.length >= 8 ? '' : 'opacity-30'} />
                  8+ characters
                </div>
                <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(form.password) && /[a-z]/.test(form.password) ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                  <Check size={11} className={/[A-Z]/.test(form.password) && /[a-z]/.test(form.password) ? '' : 'opacity-30'} />
                  Upper & lowercase
                </div>
                <div className={`flex items-center gap-1.5 ${/\d/.test(form.password) ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                  <Check size={11} className={/\d/.test(form.password) ? '' : 'opacity-30'} />
                  Number
                </div>
                <div className={`flex items-center gap-1.5 ${/[^a-zA-Z0-9]/.test(form.password) ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                  <Check size={11} className={/[^a-zA-Z0-9]/.test(form.password) ? '' : 'opacity-30'} />
                  Special character
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Confirm password</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              name="confirmPassword"
              type={showPwd.confirm ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={handleChange}
              onBlur={() => setTouched((p) => ({ ...p, confirmPassword: true }))}
              placeholder="••••••••"
              className={`${inputBase} pr-10 ${touched.confirmPassword && !confirmValid ? inputErr : inputOk}`}
            />
            <button
              type="button"
              onClick={() => setShowPwd((p) => ({ ...p, confirm: !p.confirm }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPwd.confirm ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {touched.confirmPassword && !confirmValid && (
            <p className="text-xs text-destructive flex items-center gap-1 animate-in fade-in duration-150">
              <AlertCircle size={11} /> Passwords do not match.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full h-11 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-55 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 shadow-md shadow-primary/25"
        >
          {registerMutation.isPending ? (
            <>
              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Creating account...
            </>
          ) : (
            <>Create account <ArrowRight size={15} /></>
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

      <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
        By creating an account you agree to our{' '}
        <a href="#" className="underline hover:text-primary transition-colors">Terms of Service</a>
        {' '}and{' '}
        <a href="#" className="underline hover:text-primary transition-colors">Privacy Policy</a>.
      </p>
    </div>
  )
}
