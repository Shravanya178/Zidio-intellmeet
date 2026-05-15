import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Video, Plus, Clock, Users, Play, FileText, X, CalendarClock, Search, Link2, Filter } from 'lucide-react'
import { meetingsService } from '../../services/meetings.service'
import { useToast } from '../../components/Toast'

const statusStyles: Record<string, string> = {
  scheduled: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40',
  active:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40',
  ended:     'bg-muted text-muted-foreground border border-border',
}

type FilterTab = 'all' | 'scheduled' | 'active' | 'ended'

function Skeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {[1,2,3].map((i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-0">
          <div className="w-10 h-10 rounded-xl bg-muted animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded-lg w-48" />
            <div className="h-3 bg-muted animate-pulse rounded-lg w-32" />
          </div>
          <div className="h-7 w-16 bg-muted animate-pulse rounded-lg" />
        </div>
      ))}
    </div>
  )
}

export default function MeetingsPage() {
  const navigate  = useNavigate()
  const qc        = useQueryClient()
  const { toast } = useToast()

  const [showModal,   setShowModal]   = useState(false)
  const [title,       setTitle]       = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [search,      setSearch]      = useState('')
  const [filter,      setFilter]      = useState<FilterTab>('all')

  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ['meetings'],
    queryFn: meetingsService.getAll,
  })

  const createMutation = useMutation({
    mutationFn: meetingsService.create,
    onSuccess: (meeting) => {
      qc.invalidateQueries({ queryKey: ['meetings'] })
      setShowModal(false); setTitle(''); setScheduledAt('')
      toast('success', `"${meeting.title}" created! Joining now...`)
      navigate(`/meeting/${meeting.roomId}`)
    },
    onError: () => toast('error', 'Failed to create meeting. Please try again.'),
  })

  const copyLink = (roomId: string) => {
    const link = `${window.location.origin}/join/${roomId}`
    navigator.clipboard.writeText(link)
    toast('info', 'Meeting invite link copied! Share it on WhatsApp or anywhere.')
  }

  const filtered = meetings.filter((m) => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || m.status === filter
    return matchSearch && matchFilter
  })

  const counts = {
    all:       meetings.length,
    scheduled: meetings.filter((m) => m.status === 'scheduled').length,
    active:    meetings.filter((m) => m.status === 'active').length,
    ended:     meetings.filter((m) => m.status === 'ended').length,
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    createMutation.mutate({ title, scheduledAt: scheduledAt || undefined })
  }

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all',       label: 'All'       },
    { key: 'active',    label: 'Active'    },
    { key: 'scheduled', label: 'Scheduled' },
    { key: 'ended',     label: 'Ended'     },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Meetings</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Schedule, join, and review all your meetings in one place.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-md shadow-primary/25 shrink-0"
        >
          <Plus size={16} />
          New Meeting
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search meetings..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60 focus:border-primary/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border shrink-0">
          <Filter size={13} className="text-muted-foreground ml-1.5 shrink-0" />
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === tab.key
                  ? 'bg-card border border-border text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
              {counts[tab.key] > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${filter === tab.key ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {counts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <Skeleton />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center gap-5 bg-card rounded-2xl border border-dashed border-border">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Video size={26} className="text-primary" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-foreground">
              {search || filter !== 'all' ? 'No meetings found' : 'No meetings yet'}
            </p>
            <p className="text-sm text-muted-foreground">
              {search ? `No results for "${search}".` : filter !== 'all' ? `No ${filter} meetings.` : 'Create your first meeting to get started.'}
            </p>
          </div>
          {!search && filter === 'all' && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-md shadow-primary/20"
            >
              <Plus size={15} />
              New Meeting
            </button>
          )}
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="divide-y divide-border">
            {filtered.map((meeting) => (
              <div
                key={meeting._id}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-accent/40 transition-colors group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                    meeting.status === 'active'
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                      : 'bg-primary/10 group-hover:bg-primary/20 text-primary'
                  }`}>
                    <Video size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">{meeting.title}</p>
                      {meeting.status === 'active' && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          LIVE
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock size={11} />
                        {meeting.scheduledAt
                          ? new Date(meeting.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
                          : new Date(meeting.createdAt).toLocaleDateString([], { dateStyle: 'medium' })}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users size={11} />
                        {meeting.participants.length + 1} participant{meeting.participants.length !== 0 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`hidden sm:inline-flex text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${statusStyles[meeting.status] ?? statusStyles.ended}`}>
                    {meeting.status}
                  </span>

                  {/* Copy link */}
                  <button
                    onClick={() => copyLink(meeting.roomId)}
                    title="Copy meeting link"
                    className="hidden sm:flex w-8 h-8 rounded-lg items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Link2 size={14} />
                  </button>

                  {meeting.status !== 'ended' ? (
                    <button
                      onClick={() => navigate(`/meeting/${meeting.roomId}`)}
                      className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm shadow-primary/20"
                    >
                      <Play size={11} />
                      Join
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/meetings/${meeting._id}`)}
                      className="flex items-center gap-1.5 bg-muted text-foreground px-3.5 py-1.5 rounded-lg text-xs font-medium hover:bg-accent transition-colors border border-border"
                    >
                      <FileText size={11} />
                      Summary
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CalendarClock size={18} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">New Meeting</h2>
                  <p className="text-xs text-muted-foreground">You'll be taken to the room immediately.</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Meeting title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Weekly Product Sync"
                  required
                  autoFocus
                  className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60 focus:border-primary/50 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Schedule <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/60 focus:border-primary/50 transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-11 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted/60 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || !title.trim()}
                  className="flex-1 h-11 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-55 shadow-md shadow-primary/20 flex items-center justify-center gap-2"
                >
                  {createMutation.isPending ? (
                    <>
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <><Play size={14} /> Start Meeting</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
