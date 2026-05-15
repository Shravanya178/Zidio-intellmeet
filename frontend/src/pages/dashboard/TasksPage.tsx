import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Circle, Sparkles, Search, Filter, Clock, Video } from 'lucide-react'
import { meetingsService } from '../../services/meetings.service'
import { useToast } from '../../components/Toast'

type FilterTab = 'all' | 'pending' | 'completed'

function Skeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border">
          <div className="w-5 h-5 rounded-full bg-muted animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded-lg w-3/4" />
            <div className="h-3 bg-muted animate-pulse rounded-lg w-1/3" />
          </div>
          <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
        </div>
      ))}
    </div>
  )
}

export default function TasksPage() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterTab>('all')
  const [optimistic, setOptimistic] = useState<Record<string, boolean>>({})

  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ['meetings'],
    queryFn: meetingsService.getAll,
  })

  const toggleMutation = useMutation({
    mutationFn: ({ meetingId, itemId }: { meetingId: string; itemId: string }) =>
      meetingsService.toggleActionItem(meetingId, itemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meetings'] }),
  })

  const allItems = meetings.flatMap((m) =>
    m.actionItems.map((item) => ({
      ...item,
      meetingTitle: m.title,
      meetingId: m._id,
      meetingStatus: m.status,
    }))
  )

  const getCompleted = (id: string, base: boolean) =>
    optimistic[id] !== undefined ? optimistic[id] : base

  const toggle = (meetingId: string, itemId: string, current: boolean) => {
    setOptimistic((p) => ({ ...p, [itemId]: !current }))
    toggleMutation.mutate({ meetingId, itemId })
    toast('success', !current ? 'Task marked complete!' : 'Task marked pending.')
  }

  const filtered = allItems.filter((item) => {
    const completed = getCompleted(item._id, item.completed)
    const matchSearch =
      item.text.toLowerCase().includes(search.toLowerCase()) ||
      item.meetingTitle.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'all' ||
      (filter === 'pending' && !completed) ||
      (filter === 'completed' && completed)
    return matchSearch && matchFilter
  })

  const counts = {
    all: allItems.length,
    pending: allItems.filter((i) => !getCompleted(i._id, i.completed)).length,
    completed: allItems.filter((i) => getCompleted(i._id, i.completed)).length,
  }

  const completionRate = allItems.length > 0
    ? Math.round((counts.completed / allItems.length) * 100)
    : 0

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'completed', label: 'Completed' },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Action Items</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            All tasks extracted from your meetings in one place.
          </p>
        </div>
        {allItems.length > 0 && (
          <div className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3 shrink-0">
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground tabular-nums">{completionRate}%</p>
              <p className="text-xs text-muted-foreground">completion rate</p>
            </div>
            <div className="w-12 h-12 relative shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/50" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3"
                  strokeDasharray={`${completionRate} ${100 - completionRate}`}
                  strokeLinecap="round"
                  className="text-primary transition-all duration-700"
                />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {allItems.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-primary" />
              <span className="font-medium text-foreground">Overall Progress</span>
            </div>
            <span className="text-muted-foreground text-xs">{counts.completed} of {counts.all} tasks done</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-0.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {counts.pending} pending
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {counts.completed} completed
            </span>
          </div>
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks or meetings..."
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
            <CheckCircle2 size={26} className="text-primary" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-foreground">
              {search || filter !== 'all' ? 'No tasks found' : 'No action items yet'}
            </p>
            <p className="text-sm text-muted-foreground">
              {search
                ? `No results for "${search}".`
                : filter === 'completed'
                ? 'No completed tasks yet. Keep going!'
                : filter === 'pending'
                ? '🎉 All tasks are completed!'
                : 'Action items from your meetings will appear here.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => {
            const completed = getCompleted(item._id, item.completed)
            return (
              <button
                key={item._id}
                onClick={() => toggle(item.meetingId, item._id, completed)}
                disabled={toggleMutation.isPending}
                className={`w-full flex items-start gap-4 p-4 rounded-2xl border text-left transition-all duration-200 group ${
                  completed
                    ? 'bg-muted/20 border-border opacity-70 hover:opacity-90'
                    : 'bg-card border-border hover:border-primary/30 hover:shadow-md hover:shadow-primary/5'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200 ${
                  completed ? 'bg-primary border-primary' : 'border-border group-hover:border-primary/60'
                }`}>
                  {completed
                    ? <CheckCircle2 size={12} className="text-primary-foreground" />
                    : <Circle size={12} className="opacity-0 group-hover:opacity-30 transition-opacity" />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium leading-snug ${completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {item.text}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    {item.assignee && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="w-4 h-4 rounded-full bg-primary/15 text-primary text-[9px] font-bold flex items-center justify-center">
                          {item.assignee.charAt(0).toUpperCase()}
                        </span>
                        {item.assignee}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Video size={10} />
                      {item.meetingTitle}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    item.meetingStatus === 'active'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : item.meetingStatus === 'scheduled'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {item.meetingStatus}
                  </span>
                  {completed ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      <Clock size={10} /> Done
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to complete
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
