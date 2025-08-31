import { Clock } from "lucide-react";
import { Button } from "./ui/button";

interface Meeting {
  date: string;
  time: string;
  company: string;
  description: string;
  isToday?: boolean;
  isTomorrow?: boolean;
}

interface MeetingListProps {
  onNavigate: (page: string, meetingId?: string) => void;
}

export function MeetingList({ onNavigate }: MeetingListProps) {
  const meetings: Meeting[] = [
    {
      date: "Hoje, 26 Out,",
      time: "10:00 AM",
      company: "Acme Corp",
      description: "Q4 Strategy Review",
      isToday: true,
    },
    {
      date: "Hoje, 26 Out,",
      time: "14:30 PM",
      company: "Global Innovations Inc.",
      description: "Product Launch Discussion",
      isToday: true,
    },
    {
      date: "Amanhã, 27 Out,",
      time: "09:00 AM",
      company: "Tech Solutions Ltd.",
      description: "Annual Partnership Renewal",
      isTomorrow: true,
    },
    {
      date: "Amanhã, 27 Out,",
      time: "16:00 PM",
      company: "Synergy Marketing Group",
      description: "Follow-up on Proposal",
      isTomorrow: true,
    },
  ];

  return (
    <div className="space-y-4">
      {meetings.map((meeting, index) => (
        <div 
          key={index} 
          className="bg-white dark:bg-gray-800 rounded-lg border p-4 hover:shadow-sm transition-shadow cursor-pointer"
          onClick={() => onNavigate('meeting-details', `meeting-${index + 1}`)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className={`${meeting.isToday ? 'text-blue-600' : meeting.isTomorrow ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'}`}>
                  {meeting.date} {meeting.time}
                </span>
              </div>
              <div className="mb-1">
                <h3 className="text-gray-900 dark:text-gray-100">{meeting.company}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{meeting.description}</p>
            </div>
            <Button 
              variant="ghost" 
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('meeting-details', `meeting-${index + 1}`);
              }}
            >
              Ver detalhes
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}