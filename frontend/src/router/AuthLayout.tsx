import { Outlet } from 'react-router-dom'
import { ThemeToggle } from '../components/ThemeToggle'

const features = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Automated Transcription',
    desc: 'Every word captured in real-time.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'AI Smart Summaries',
    desc: 'The essence of every meeting in one click.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Team Collaboration',
    desc: 'Share, assign, and track action items.',
  },
]

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-background flex">

      {/* ── Left Panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] relative overflow-hidden bg-primary p-14">

        {/* Decorative background circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.03] pointer-events-none" />

        {/* Logo */}
        <div className='flex justify-between'>

            <div className="relative flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M15 10l4.553-2.069A1 1 0 0121 8.87V15.13a1 1 0 01-1.447.899L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">IntellMeet</span>
            </div>
            <ThemeToggle/>
        </div>

        {/* Marketing Content */}
        <div className="relative space-y-8">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 bg-white/15 text-white/90 text-xs font-medium px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
              AI-Powered
            </span>
            <h1 className="text-white text-4xl font-bold leading-tight tracking-tight">
              Meetings that<br />
              <span className="text-white/70">work for you.</span>
            </h1>
            <p className="text-white/60 text-base leading-relaxed max-w-sm">
              IntellMeet captures, analyzes, and transforms your meetings into concrete actions — automatically.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-4">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/80 shrink-0 mt-0.5">
                  {f.icon}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{f.title}</p>
                  <p className="text-white/50 text-xs mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer / Testimonial */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <p className="text-white/60 text-sm italic leading-relaxed max-w-xs">
            "IntellMeet reduced our meeting reporting from 2 hours to 5 minutes."
          </p>
          <p className="text-white/40 text-xs mt-2">— Sophie M., Product Director</p>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16">

        {/* Mobile Logo Only */}
        <div className="flex lg:hidden items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
              <path d="M15 10l4.553-2.069A1 1 0 0121 8.87V15.13a1 1 0 01-1.447.899L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-semibold text-foreground">IntellMeet</span>
        </div>

        <div className="w-full max-w-[380px]">
          <Outlet />
        </div>

        <p className="text-muted-foreground text-xs mt-12">
          © 2026 IntellMeet · Zidio Development
        </p>
      </div>

    </div>
  )
}