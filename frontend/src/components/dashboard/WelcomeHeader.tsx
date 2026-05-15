import { Plus, CalendarClock } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'

interface WelcomeHeaderProps {
  onScheduleClick?: () => void
  onNewMeetingClick?: () => void
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export function WelcomeHeader({ onScheduleClick, onNewMeetingClick }: WelcomeHeaderProps) {
  const user = useAuthStore((s) => s.user)
  const firstName = user?.name?.split(' ')[0] ?? 'there'

  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <p className="text-sm text-muted-foreground font-medium">{getGreeting()},</p>
        <h1 className="text-3xl font-bold text-foreground tracking-tight mt-0.5">
          {firstName} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Here's what's happening with your meetings today.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onScheduleClick}
          className="flex items-center gap-2 bg-card text-foreground border border-border px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-muted/60 transition-all duration-200"
        >
          <CalendarClock size={15} />
          Schedule
        </button>
        <button
          onClick={onNewMeetingClick}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all duration-200 shadow-md shadow-primary/25"
        >
          <Plus size={15} />
          New Meeting
        </button>
      </div>
    </div>
  )
}
