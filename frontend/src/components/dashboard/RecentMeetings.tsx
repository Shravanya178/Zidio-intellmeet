import { Video, Clock, ChevronRight, Sparkles } from 'lucide-react'
import type { Meeting } from '../../services/meetings.service'
import { useNavigate } from 'react-router-dom'

interface RecentMeetingsProps {
  meetings: Meeting[]
  isLoading?: boolean
  onViewAll?: () => void
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

function duration(m: Meeting) {
  if (!m.startedAt || !m.endedAt) return null
  const mins = Math.round((new Date(m.endedAt).getTime() - new Date(m.startedAt).getTime()) / 60000)
  return mins > 0 ? `${mins} min` : null
}

export function RecentMeetings({ meetings, isLoading, onViewAll }: RecentMeetingsProps) {
  const navigate = useNavigate()

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h2 className="font-bold text-foreground">Recent Meetings</h2>
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline underline-offset-4 transition-colors"
        >
          View all <ChevronRight size={13} />
        </button>
      </div>

      {isLoading ? (
        <div className="divide-y divide-border">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5">
              <div className="w-9 h-9 rounded-xl bg-muted animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-muted animate-pulse rounded-lg w-40" />
                <div className="h-3 bg-muted animate-pulse rounded-lg w-24" />
              </div>
              <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
            </div>
          ))}
        </div>
      ) : meetings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
          <Video size={28} className="opacity-30" />
          <p className="text-sm">No meetings yet</p>
          <p className="text-xs text-muted-foreground/70">Create your first meeting to get started</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {meetings.slice(0, 5).map((m) => (
            <div
              key={m._id}
              onClick={() => m.status !== 'ended' ? navigate(`/meeting/${m.roomId}`) : undefined}
              className={`flex items-center gap-4 px-5 py-3.5 transition-colors group ${m.status !== 'ended' ? 'cursor-pointer hover:bg-accent/40' : 'hover:bg-muted/20'}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                m.status === 'active'
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-muted group-hover:bg-primary/10 text-muted-foreground group-hover:text-primary'
              }`}>
                <Video size={17} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground truncate">{m.title}</p>
                  {m.status === 'active' && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      LIVE
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                  <Clock size={10} />
                  <span>{timeAgo(m.createdAt)}</span>
                  {duration(m) && <><span>·</span><span>{duration(m)}</span></>}
                </div>
              </div>
              {m.status === 'ended' && m.summary ? (
                <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                  <Sparkles size={9} /> AI Ready
                </span>
              ) : m.status === 'ended' ? (
                <span className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border uppercase tracking-wider">
                  Ended
                </span>
              ) : (
                <span className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40 uppercase tracking-wider">
                  {m.status}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
