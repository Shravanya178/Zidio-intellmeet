import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email,     setEmail]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [cooldown,  setCooldown]  = useState(0)
  const [touched,   setTouched]   = useState(false)

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!emailValid) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
      // 60s resend cooldown
      setCooldown(60)
      const t = setInterval(() => {
        setCooldown((c) => { if (c <= 1) { clearInterval(t); return 0 } return c - 1 })
      }, 1000)
    }, 1200)
  }

  const handleResend = () => {
    if (cooldown > 0) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setCooldown(60)
      const t = setInterval(() => {
        setCooldown((c) => { if (c <= 1) { clearInterval(t); return 0 } return c - 1 })
      }, 1000)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {!submitted ? (
        <>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Reset your password</h2>
            <p className="text-muted-foreground text-sm">
              Enter your email and we'll send you a reset link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched(true)}
                  placeholder="you@company.com"
                  className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200 ${
                    touched && !emailValid
                      ? 'border-destructive/50 focus:ring-destructive/30 bg-destructive/5'
                      : 'border-input focus:ring-ring/60 focus:border-primary/50'
                  }`}
                />
              </div>
              {touched && !emailValid && (
                <p className="text-xs text-destructive flex items-center gap-1 animate-in fade-in duration-150">
                  <AlertCircle size={11} /> Please enter a valid email address.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-55 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-primary/25"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Sending link...
                </>
              ) : (
                <><Send size={14} /> Send reset link</>
              )}
            </button>
          </form>

          <Link
            to="/login"
            className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} /> Back to sign in
          </Link>
        </>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle2 size={30} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-foreground">Check your inbox</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We sent a reset link to{' '}
                <span className="font-semibold text-foreground">{email}</span>.
                <br />It expires in 15 minutes.
              </p>
            </div>
          </div>

          <div className="bg-muted/40 border border-border rounded-xl px-4 py-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground text-sm">Didn't receive it?</p>
            <p>Check your spam folder, or make sure you entered the correct email address.</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleResend}
              disabled={cooldown > 0 || loading}
              className="w-full h-11 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted/60 transition-all duration-200 disabled:opacity-55 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" /> Resending...</>
              ) : cooldown > 0 ? (
                `Resend in ${cooldown}s`
              ) : (
                'Resend email'
              )}
            </button>
            <Link
              to="/login"
              className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={14} /> Back to sign in
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
