import { Video, Clock, CheckCircle2 } from "lucide-react";
import { WelcomeHeader } from "../../components/dashboard/WelcomeHeader";
import { StatsCard } from "../../components/dashboard/StatsCard";
import { RecentMeetings } from "../../components/dashboard/RecentMeetings";
import { PriorityActionItems } from "../../components/dashboard/PriorityActionsItems";


export default function DashboardHome() {
  const stats = [
    { 
      label: 'Total Meetings', 
      value: '24', 
      detail: '+12% from last month', 
      icon: <Video className="text-primary" size={20} />,
    },
    { 
      label: 'Time Saved (AI)', 
      value: '18.5h', 
      detail: 'Target: 40-60%', 
      icon: <Clock className="text-primary" size={20} />,
    },
    { 
      label: 'Pending Tasks', 
      value: '7', 
      detail: 'From last 3 meetings', 
      icon: <CheckCircle2 className="text-primary" size={20} />,
    },
  ];

  const handleSchedule = () => {
    console.log('Schedule clicked');
  };

  const handleNewMeeting = () => {
    console.log('New meeting clicked');
  };

  const handleViewAllMeetings = () => {
    console.log('View all meetings clicked');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      <WelcomeHeader 
        userName="Sophie"
        onScheduleClick={handleSchedule}
        onNewMeetingClick={handleNewMeeting}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentMeetings onViewAll={handleViewAllMeetings} />
        <PriorityActionItems />
      </div>
    </div>
  );
}