import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Video, Clock, CheckCircle2, Plus, CalendarClock, Sparkles, ArrowRight, Zap,
  Users, Shield, Brain, Rocket, Star, Quote, Award, TrendingUp, Globe,
  Mail, Phone, MapPin, Github, Twitter, Linkedin, Heart
} from 'lucide-react'
import { WelcomeHeader } from '../../components/dashboard/WelcomeHeader'
import { StatsCard } from '../../components/dashboard/StatsCard'
import { RecentMeetings } from '../../components/dashboard/RecentMeetings'
import { PriorityActionItems } from '../../components/dashboard/PriorityActionsItems'
import { meetingsService } from '../../services/meetings.service'

const tips = [
  'AI summaries reduce follow-up time by up to 60%.',
  'Assign action items during meetings to boost accountability.',
  'Use the Kanban board to track tasks from every meeting.',
  'Schedule recurring meetings to keep your team aligned.',
  'Review analytics weekly to spot productivity trends.',
]

const features = [
  {
    icon: <Brain className="text-primary" size={24} />,
    title: 'AI-Powered Intelligence',
    description: 'Automatic transcription, smart summaries, and action item extraction powered by advanced AI.',
    color: 'bg-blue-500/10 border-blue-500/20'
  },
  {
    icon: <Shield className="text-emerald-600" size={24} />,
    title: 'Enterprise Security',
    description: 'End-to-end encryption, SOC 2 compliance, and enterprise-grade security for your meetings.',
    color: 'bg-emerald-500/10 border-emerald-500/20'
  },
  {
    icon: <Users className="text-purple-600" size={24} />,
    title: 'Team Collaboration',
    description: 'Real-time collaboration tools, shared workspaces, and seamless team integration.',
    color: 'bg-purple-500/10 border-purple-500/20'
  },
  {
    icon: <Rocket className="text-orange-600" size={24} />,
    title: 'Productivity Boost',
    description: 'Increase meeting efficiency by 60% with automated workflows and smart insights.',
    color: 'bg-orange-500/10 border-orange-500/20'
  }
]

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'VP of Engineering',
    company: 'TechCorp',
    avatar: 'SC',
    rating: 5,
    text: 'IntellMeet transformed how our team conducts meetings. The AI summaries alone save us 2 hours per week!'
  },
  {
    name: 'Marcus Johnson',
    role: 'Product Manager',
    company: 'InnovateLab',
    avatar: 'MJ',
    rating: 5,
    text: 'The action item tracking is phenomenal. Nothing falls through the cracks anymore. Game changer!'
  },
  {
    name: 'Elena Rodriguez',
    role: 'CEO',
    company: 'StartupXYZ',
    avatar: 'ER',
    rating: 5,
    text: 'Best meeting platform we\'ve used. The analytics help us optimize our team\'s productivity continuously.'
  }
]

const stats_global = [
  { label: '10M+', desc: 'Meetings Hosted' },
  { label: '500K+', desc: 'Happy Users' },
  { label: '99.9%', desc: 'Uptime' },
  { label: '150+', desc: 'Countries' }
]

function Skeleton({ className = '' }) {
  return <div className={`bg-muted/60 rounded-xl animate-pulse ${className}`} />
}

export default function DashboardHome() {
  const navigate = useNavigate()
  const [time, setTime] = useState(new Date())
  const [tip] = useState(() => tips[Math.floor(Math.random() * tips.length)])

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: meetingsService.getAnalytics,
  })

  const { data: meetings = [], isLoading: meetingsLoading } = useQuery({
    queryKey: ['meetings'],
    queryFn: meetingsService.getAll,
  })

  const isLoading = analyticsLoading || meetingsLoading
  const pendingTasks = meetings.reduce((acc, m) => acc + m.actionItems.filter((i) => !i.completed).length, 0)
  const timeSavedHours = ((analytics?.ended ?? 0) * 15 / 60).toFixed(1)

  const stats = [
    {
      label: 'Total Meetings',
      value: isLoading ? '—' : String(analytics?.total ?? 0),
      detail: analytics?.active ? `${analytics.active} active now` : 'All time',
      icon: <Video className="text-primary" size={20} />,
    },
    {
      label: 'Time Saved (AI)',
      value: isLoading ? '—' : `${timeSavedHours}h`,
      detail: 'Est. 15 min saved per meeting',
      icon: <Clock className="text-primary" size={20} />,
    },
    {
      label: 'Pending Tasks',
      value: isLoading ? '—' : String(pendingTasks),
      detail: pendingTasks === 0 ? 'All caught up! 🎉' : `From ${meetings.filter(m => m.actionItems.some(i => !i.completed)).length} meetings`,
      icon: <CheckCircle2 className="text-primary" size={20} />,
    },
  ]

  return (
    <div className="min-h-screen bg-background animate-in fade-in duration-500">
      {/* Hero Section with Background */}
      <section 
        className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 border-b border-border"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5" />
        <div className="relative max-w-6xl mx-auto px-4 py-12">
          {/* Header with live clock */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
            <WelcomeHeader
              onScheduleClick={() => navigate('/meetings')}
              onNewMeetingClick={() => navigate('/meetings')}
            />
            <div className="hidden lg:flex flex-col items-end shrink-0 bg-card/80 backdrop-blur-sm border border-border rounded-2xl px-5 py-3 shadow-lg hover:scale-105 transition-transform duration-200">
              <p className="text-2xl font-bold text-foreground tabular-nums tracking-tight">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* AI Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/80 px-6 py-5 flex items-center justify-between gap-4 shadow-xl shadow-primary/25 mb-8 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300">
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
            <div className="absolute -bottom-8 right-32 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent to-white/5 pointer-events-none" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold text-sm">AI Meeting Intelligence is active</p>
                  <span className="flex items-center gap-1 bg-white/15 text-white/90 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE
                  </span>
                </div>
                <p className="text-white/65 text-xs mt-0.5">💡 {tip}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/meetings')}
              className="shrink-0 flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-200 relative z-10 hover:scale-105 active:scale-95"
            >
              <Plus size={13} /> New Meeting
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {isLoading
              ? [1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)
              : stats.map((stat, i) => (
                  <div key={i} className="animate-in slide-in-from-bottom duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                    <StatsCard {...stat} />
                  </div>
                ))
            }
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 space-y-16 py-16">
        {/* Quick Actions */}
        <section className="animate-in slide-in-from-bottom duration-700">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: <Video size={20} className="text-primary" />, title: 'Start instant meeting', desc: 'Launch a room and invite your team', badge: 'Instant' },
              { icon: <CalendarClock size={20} className="text-primary" />, title: 'Schedule a meeting', desc: 'Pick a date and send invites', badge: null },
            ].map((action, i) => (
              <button
                key={i}
                onClick={() => navigate('/meetings')}
                className="group flex items-center gap-4 bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-200 text-left"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors shrink-0">
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{action.title}</p>
                    {action.badge && (
                      <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{action.badge}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                </div>
                <ArrowRight size={16} className="text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 animate-in slide-in-from-bottom duration-700 delay-200">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose IntellMeet?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Experience the future of meetings with AI-powered intelligence, enterprise security, and seamless collaboration.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className={`p-6 rounded-2xl border ${feature.color} backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-105 hover:-translate-y-2 animate-in slide-in-from-bottom delay-${i * 100}`}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Global Stats */}
        <section className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-3xl p-8 border border-primary/20 animate-in slide-in-from-bottom duration-700 delay-300">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Trusted Worldwide</h2>
            <p className="text-muted-foreground">Join millions of users who trust IntellMeet for their meetings</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats_global.map((stat, i) => (
              <div key={i} className="text-center hover:scale-110 transition-transform duration-200">
                <p className="text-3xl font-bold text-primary mb-1">{stat.label}</p>
                <p className="text-sm text-muted-foreground">{stat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="animate-in slide-in-from-bottom duration-700 delay-400">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">What Our Users Say</h2>
            <p className="text-muted-foreground text-lg">Don't just take our word for it</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-lg hover:scale-105 hover:-translate-y-2 transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                
                <div className="mb-4">
                  <Quote size={20} className="text-primary/40 mb-2" />
                  <p className="text-sm text-foreground leading-relaxed">{testimonial.text}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role} at {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Productivity Insight */}
        {!isLoading && (analytics?.ended ?? 0) > 0 && (
          <section className="animate-in slide-in-from-bottom duration-700 delay-500">
            <div className="flex items-center gap-3 bg-card border border-border rounded-2xl px-5 py-3.5 shadow-sm hover:shadow-lg hover:scale-[1.01] transition-all duration-200">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                <Zap size={15} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  You've saved an estimated{' '}
                  <span className="text-primary font-bold">{timeSavedHours} hours</span>{' '}
                  with AI summaries across{' '}
                  <span className="font-semibold">{analytics?.ended} completed meetings</span>.
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {analytics?.completedActionItems ?? 0} of {analytics?.totalActionItems ?? 0} action items resolved.
                </p>
              </div>
              <button
                onClick={() => navigate('/analytics')}
                className="shrink-0 text-xs font-semibold text-primary hover:underline underline-offset-4 flex items-center gap-1 hover:scale-105 transition-transform"
              >
                View analytics <ArrowRight size={12} />
              </button>
            </div>
          </section>
        )}

        {/* Recent meetings + Action Items */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-bottom duration-700 delay-600">
          <div>
            <RecentMeetings
              meetings={meetings}
              isLoading={meetingsLoading}
              onViewAll={() => navigate('/meetings')}
            />
          </div>
          <div>
            <PriorityActionItems
              meetings={meetings}
              isLoading={meetingsLoading}
            />
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
                    <path d="M15 10l4.553-2.069A1 1 0 0121 8.87V15.13a1 1 0 01-1.447.899L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="font-bold text-lg text-foreground">IntellMeet</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI-powered meeting platform that transforms how teams collaborate and communicate.
              </p>
              <div className="flex items-center gap-3">
                {[
                  { icon: <Twitter size={16} />, href: '#' },
                  { icon: <Linkedin size={16} />, href: '#' },
                  { icon: <Github size={16} />, href: '#' },
                ].map((social, i) => (
                  <a
                    key={i}
                    href={social.href}
                    className="w-8 h-8 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all duration-200 hover:scale-110"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {['Features', 'Pricing', 'Security', 'Integrations', 'API'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-primary transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {['About Us', 'Careers', 'Blog', 'Press', 'Partners'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-primary transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Contact</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail size={14} />
                  <span>hello@intellmeet.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} />
                  <span>San Francisco, CA</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © 2026 IntellMeet · Zidio Development. All rights reserved.
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              Made with <Heart size={12} className="text-red-500 mx-1" /> by Zidio Team
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}