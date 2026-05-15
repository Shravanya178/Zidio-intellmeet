import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  LayoutDashboard, Video, ClipboardList, Users,
  BarChart3, LogOut, Search, Bell, Menu, X, ChevronRight,
} from 'lucide-react'
import { ThemeToggle } from '../components/ThemeToggle'
import { useLogout } from '../hooks/useLogout'
import { useAuthStore } from '../store/useAuthStore'
import { meetingsService } from '../services/meetings.service'

const navigation = [
  { name: 'Dashboard',    href: '/dashboard', icon: LayoutDashboard },
  { name: 'Meetings',     href: '/meetings',  icon: Video           },
  { name: 'Action Items', href: '/tasks',     icon: ClipboardList   },
  { name: 'Team',         href: '/teams',     icon: Users           },
  { name: 'Analytics',    href: '/analytics', icon: BarChart3       },
]

export default function DashboardLayout() {
  const location    = useLocation()
  const navigate    = useNavigate()
  const [sidebarOpen,  setSidebarOpen]  = useState(false)
  const [notifOpen,    setNotifOpen]    = useState(false)
  const [searchQuery,  setSearchQuery]  = useState('')
  const [readIds,      setReadIds]      = useState<Set<string>>(new Set())
  const logout = useLogout()
  const user   = useAuthStore((s) => s.user)

  const { data: meetings = [] } = useQuery({
    queryKey: ['meetings'],
    queryFn: meetingsService.getAll,
    enabled: !!user,
  })

  // Build real notifications from meetings data
  const notifications = [
    ...meetings
      .filter((m) => m.status === 'active')
      .map((m) => ({ id: `active-${m._id}`, text: `"${m.title}" is live now`, time: 'Now', unread: true })),
    ...meetings
      .filter((m) => m.status === 'ended' && m.summary)
      .slice(0, 2)
      .map((m) => ({ id: `summary-${m._id}`, text: `AI summary ready for "${m.title}"`, time: 'Recent', unread: !readIds.has(`summary-${m._id}`) })),
    ...meetings
      .filter((m) => m.status === 'scheduled')
      .slice(0, 1)
      .map((m) => ({ id: `sched-${m._id}`, text: `"${m.title}" is scheduled`, time: m.scheduledAt ? new Date(m.scheduledAt).toLocaleDateString() : 'Upcoming', unread: false })),
  ].slice(0, 5)

  const unreadCount = notifications.filter((n) => n.unread && !readIds.has(n.id)).length

  const markAllRead = () => setReadIds(new Set(notifications.map((n) => n.id)))

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  const currentPage = navigation.find((n) => location.pathname.startsWith(n.href))

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/meetings`)
      setSearchQuery('')
    }
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-border flex flex-col
        transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/30">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
                <path d="M15 10l4.553-2.069A1 1 0 0121 8.87V15.13a1 1 0 01-1.447.899L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground">IntellMeet</span>
          </div>
          <button className="lg:hidden text-muted-foreground hover:text-foreground transition-colors" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navigation.map((item) => {
            const active = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'text-sidebar-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <item.icon size={17} />
                {item.name}
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground/60" />}
              </Link>
            )
          })}
        </nav>

        {/* User + Logout */}
        <div className="p-3 border-t border-border space-y-1">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/40">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{user?.name ?? 'User'}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email ?? ''}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/8 rounded-xl transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3 flex-1">
            <button
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumb */}
            <div className="hidden lg:flex items-center gap-1.5 text-sm">
              <span className="text-muted-foreground">IntellMeet</span>
              <ChevronRight size={13} className="text-muted-foreground/50" />
              <span className="font-semibold text-foreground">{currentPage?.name ?? 'Page'}</span>
            </div>

            <div className="relative hidden sm:block w-full max-w-72 lg:ml-4">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                placeholder="Search... (Enter)"
                className="w-full h-9 bg-background border border-input rounded-xl py-2 px-4 pl-9 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60 focus:border-primary/50 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative w-9 h-9 rounded-xl bg-muted hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center border-2 border-card">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                      <span className="font-semibold text-sm text-foreground">Notifications</span>
                      <span className="text-xs text-primary font-medium cursor-pointer hover:underline" onClick={markAllRead}>Mark all read</span>
                    </div>
                    <div className="divide-y divide-border">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
                          <Bell size={22} className="opacity-30" />
                          <p className="text-xs">No notifications yet</p>
                        </div>
                      ) : notifications.map((n) => (
                        <div key={n.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors cursor-pointer ${n.unread && !readIds.has(n.id) ? 'bg-primary/5' : ''}`}
                          onClick={() => { setReadIds((p) => new Set([...p, n.id])); navigate('/meetings') }}>
                          {n.unread && !readIds.has(n.id) && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                          {(!n.unread || readIds.has(n.id)) && <span className="w-2 h-2 shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground leading-snug">{n.text}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2.5 border-t border-border">
                      <button className="text-xs text-primary font-medium hover:underline w-full text-center">View all notifications</button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold border-2 border-background shadow-sm cursor-pointer hover:bg-primary/30 transition-colors">
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-7 bg-background/60">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
