import { Video } from "lucide-react";

interface Meeting {
  id: number;
  title: string;
  date: string;
  duration: string;
  status: string;
}

interface RecentMeetingsProps {
  meetings?: Meeting[];
  onViewAll?: () => void;
}

const defaultMeetings: Meeting[] = [
  { id: 1, title: "Product Weekly Sync #1", date: "Yesterday", duration: "45 minutes", status: "Summary Ready" },
  { id: 2, title: "Product Weekly Sync #2", date: "Yesterday", duration: "45 minutes", status: "Summary Ready" },
  { id: 3, title: "Product Weekly Sync #3", date: "Yesterday", duration: "45 minutes", status: "Summary Ready" },
];

export function RecentMeetings({ 
  meetings = defaultMeetings, 
  onViewAll 
}: RecentMeetingsProps) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="p-5 border-b border-border flex items-center justify-between bg-muted/30">
        <h2 className="font-bold text-foreground">Recent Meetings</h2>
        <button 
          onClick={onViewAll}
          className="text-primary text-xs font-semibold hover:underline underline-offset-4"
        >
          View All
        </button>
      </div>
      <div className="divide-y divide-border">
        {meetings.map((meeting) => (
          <div key={meeting.id} className="p-4 flex items-center justify-between hover:bg-accent/50 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <Video size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{meeting.title}</p>
                <p className="text-xs text-muted-foreground">{meeting.date} • {meeting.duration}</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
              {meeting.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}