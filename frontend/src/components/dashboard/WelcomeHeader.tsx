import { Plus } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

interface WelcomeHeaderProps {
  onScheduleClick?: () => void;
  onNewMeetingClick?: () => void;
}

export function WelcomeHeader({ 
  onScheduleClick, 
  onNewMeetingClick 
}: WelcomeHeaderProps) {
  const user = useAuthStore((state) => state.user);
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here is what's happening with your meetings today.
        </p>
      </div>
      <div className="flex gap-3">
        <button 
          onClick={onScheduleClick}
          className="flex items-center gap-2 bg-secondary text-secondary-foreground border border-border px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
        >
          Schedule
        </button>
        <button 
          onClick={onNewMeetingClick}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-all shadow-md shadow-primary/20"
        >
          <Plus size={18} />
          New Meeting
        </button>
      </div>
    </div>
  );
}