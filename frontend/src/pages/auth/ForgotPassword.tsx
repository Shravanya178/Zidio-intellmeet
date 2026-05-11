import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    // Simulation de l'envoi de l'email de récupération
    setTimeout(() => {
      setLoading(false)
      setIsSubmitted(true)
    }, 1200)
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-1">Reset Password</h2>
        <p className="text-muted-foreground text-sm">
          Enter your email and we'll send you a link to reset your password.
        </p>
      </div>

      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-10 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending link...' : 'Send reset link'}
          </button>

          <div className="text-center">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              ← Back to sign in
            </Link>
          </div>
        </form>
      ) : (
        <div className="bg-primary/5 border border-primary/10 p-6 rounded-xl text-center space-y-4">
          <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Check your email</h3>
            <p className="text-sm text-muted-foreground">
              We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>.
            </p>
          </div>
          <button 
            onClick={() => setIsSubmitted(false)}
            className="text-sm text-primary font-medium hover:underline"
          >
            Didn't receive the email? Try again
          </button>
          <div className="pt-2">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-primary">
              Return to sign in
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}