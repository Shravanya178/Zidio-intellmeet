import { useQuery } from '@tanstack/react-query'
import { Video, CheckCircle2, BarChart3, Clock, TrendingUp, Zap, Download, Target } from 'lucide-react'
import { meetingsService } from '../../services/meetings.service'
import { useToast } from '../../components/Toast'

interface StatCardProps {
  label: string; value: string | number; sub: string
  icon: React.ReactNode; accent?: string; trend?: string
}

function StatCard({ label, value, sub, icon, accent = 'bg-primary/10', trend }: StatCardProps) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 transition-all duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${accent} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
          {icon}
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
            <TrendingUp size={9} /> {trend}
          </span>
        )}
      </div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      <h3 className="text-2xl font-bold text-foreground mt-1 tabular-nums">{value}</h3>
      <p className="text-xs text-primary font-medium mt-1">{sub}</p>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map((i) => <div key={i} className="h-32 bg-muted/60 rounded-2xl animate-pulse" />)}
      </div>
      <div className="h-40 bg-muted/60 rounded-2xl animate-pulse" />
      <div className="h-64 bg-muted/60 rounded-2xl animate-pulse" />
    </div>
  )
}

function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="flex items-end gap-3 h-32 pt-2">
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-2">
          <span className="text-xs font-bold text-foreground tabular-nums">{d.value}</span>
          <div className="w-full rounded-t-lg overflow-hidden bg-muted/60 relative" style={{ height: '80px' }}>
            <div
              className={`w-full ${d.color} rounded-t-lg transition-all duration-700 ease-out absolute bottom-0`}
              style={{ height: `${Math.max((d.value / max) * 80, d.value > 0 ? 4 : 0)}px` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground text-center leading-tight">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

function DonutChart({ rate }: { rate: number }) {
  const r = 40
  const circ = 2 * Math.PI * r
  const dash = (rate / 100) * circ
  return (
    <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90">
      <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="12" className="text-muted/50" />
      <circle
        cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="12"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        className="text-primary transition-all duration-1000 ease-out"
      />
    </svg>
  )
}

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: meetingsService.getAnalytics,
  })
  const { toast } = useToast()

  const rate = data && data.totalActionItems > 0
    ? Math.round((data.completedActionItems / data.totalActionItems) * 100)
    : 0

  const exportCSV = () => {
    if (!data?.recentMeetings?.length) { toast('warning', 'No data to export.'); return }
    const rows = [
      ['Meeting', 'Date', 'Duration (min)', 'Action Items'],
      ...data.recentMeetings.map((m) => {
        const dur = m.startedAt && m.endedAt
          ? Math.round((new Date(m.endedAt).getTime() - new Date(m.startedAt).getTime()) / 60000)
          : ''
        return [m.title, m.endedAt ? new Date(m.endedAt).toLocaleDateString() : '', dur, m.actionItems.length]
      }),
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `intellmeet-analytics-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    toast('success', 'Analytics exported as CSV!')
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Meeting productivity insights and team performance metrics.
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 bg-card border border-border text-foreground px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-muted/60 transition-all shrink-0 active:scale-[0.98]"
        >
          <Download size={15} />
          Export CSV
        </button>
      </div>

      {isLoading ? <Skeleton /> : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Meetings" value={data?.total ?? 0}
              sub="All time" trend={data?.total ? '+' + data.total : undefined}
              icon={<Video size={18} className="text-primary" />}
            />
            <StatCard
              label="Completed" value={data?.ended ?? 0}
              sub={`${data?.active ?? 0} active now`}
              icon={<CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />}
              accent="bg-emerald-100 dark:bg-emerald-900/30"
            />
            <StatCard
              label="Action Items" value={data?.totalActionItems ?? 0}
              sub={`${data?.completedActionItems ?? 0} resolved`}
              icon={<BarChart3 size={18} className="text-violet-600 dark:text-violet-400" />}
              accent="bg-violet-100 dark:bg-violet-900/30"
            />
            <StatCard
              label="Completion Rate" value={`${rate}%`}
              sub="Tasks resolved"
              icon={<Zap size={18} className="text-amber-600 dark:text-amber-400" />}
              accent="bg-amber-100 dark:bg-amber-900/30"
            />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Bar chart */}
            <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
              <div className="flex items-center gap-2">
                <BarChart3 size={16} className="text-primary" />
                <h2 className="font-bold text-foreground text-sm">Meeting Overview</h2>
              </div>
              <BarChart data={[
                { label: 'Total',     value: data?.total ?? 0,                  color: 'bg-primary/70' },
                { label: 'Completed', value: data?.ended ?? 0,                  color: 'bg-emerald-500/70' },
                { label: 'Active',    value: data?.active ?? 0,                 color: 'bg-amber-500/70' },
                { label: 'Tasks',     value: data?.totalActionItems ?? 0,       color: 'bg-violet-500/70' },
                { label: 'Resolved',  value: data?.completedActionItems ?? 0,   color: 'bg-blue-500/70' },
              ]} />
              <div className="flex flex-wrap gap-3 pt-1">
                {[
                  { label: 'Total',     color: 'bg-primary/70' },
                  { label: 'Completed', color: 'bg-emerald-500/70' },
                  { label: 'Active',    color: 'bg-amber-500/70' },
                  { label: 'Tasks',     color: 'bg-violet-500/70' },
                  { label: 'Resolved',  color: 'bg-blue-500/70' },
                ].map((l) => (
                  <span key={l.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className={`w-2.5 h-2.5 rounded-sm ${l.color}`} />
                    {l.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Donut + progress */}
            <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target size={18} className="text-primary" />
                </div>
                <div>
                  <h2 className="font-bold text-foreground text-sm">Action Item Completion</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {data?.completedActionItems ?? 0} of {data?.totalActionItems ?? 0} tasks completed
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="relative shrink-0">
                  <DonutChart rate={rate} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-foreground tabular-nums">{rate}%</span>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold text-foreground">{rate}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" style={{ width: `${rate}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Target (80%)</span>
                      <span className="font-semibold text-foreground">80%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-muted-foreground/30 rounded-full" style={{ width: '80%' }} />
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${rate >= 80 ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'}`}>
                    {rate >= 80 ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                    {rate >= 80 ? '🎉 Target achieved!' : `${80 - rate}% more to reach target`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent meetings table */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
              <h2 className="font-bold text-foreground">Recent Completed Meetings</h2>
              <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full font-medium">
                {data?.recentMeetings?.length ?? 0} meetings
              </span>
            </div>

            {!data?.recentMeetings?.length ? (
              <div className="flex flex-col items-center justify-center py-14 gap-3 text-muted-foreground">
                <BarChart3 size={32} className="opacity-30" />
                <p className="text-sm">No completed meetings yet.</p>
                <p className="text-xs opacity-70">Complete a meeting to see analytics here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase text-muted-foreground tracking-wider bg-muted/20">
                      <th className="px-6 py-3 font-semibold">Meeting</th>
                      <th className="px-6 py-3 font-semibold">Date</th>
                      <th className="px-6 py-3 font-semibold">Duration</th>
                      <th className="px-6 py-3 font-semibold">Action Items</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.recentMeetings.map((m) => {
                      const duration = m.startedAt && m.endedAt
                        ? Math.round((new Date(m.endedAt).getTime() - new Date(m.startedAt).getTime()) / 60000)
                        : null
                      const completedCount = m.actionItems.filter((i) => i.completed).length
                      const total = m.actionItems.length
                      return (
                        <tr key={m._id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <Video size={14} className="text-primary" />
                              </div>
                              <span className="text-sm font-medium text-foreground">{m.title}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {m.endedAt ? new Date(m.endedAt).toLocaleDateString([], { dateStyle: 'medium' }) : '—'}
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {duration != null ? (
                              <span className="flex items-center gap-1">
                                <Clock size={12} /> {duration} min
                              </span>
                            ) : '—'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                                <CheckCircle2 size={10} /> {total} items
                              </span>
                              {completedCount > 0 && (
                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                  {completedCount} done
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
