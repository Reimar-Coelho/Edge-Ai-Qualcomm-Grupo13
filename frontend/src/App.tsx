import { useState } from "react";
import { Play } from "lucide-react";
import { Button } from "./components/ui/button";
import { MeetingSidebar } from "./components/MeetingSidebar";
import { TopNavigation } from "./components/TopNavigation";
import { MeetingList } from "./components/MeetingList";
import { RecentInsights } from "./components/RecentInsights";
import { SetupStatus } from "./components/SetupStatus";
import { TimelinePage } from "./components/TimelinePage";
import { SettingsPage } from "./components/SettingsPage";
import { MeetingDetailsPage } from "./components/MeetingDetailsPage";
import { HUDPage } from "./components/HUDPage";
import { ThemeProvider } from "./components/ThemeProvider";

function AppContent() {
  const [activePage, setActivePage] = useState('home');
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | undefined>();

  const handleNavigate = (page: string, meetingId?: string) => {
    setActivePage(page);
    if (meetingId) {
      setSelectedMeetingId(meetingId);
    }
  };

  const renderContent = () => {
    switch (activePage) {
      case 'timeline':
        return <TimelinePage onNavigate={handleNavigate} />;
      case 'meeting-details':
        return <MeetingDetailsPage onNavigate={handleNavigate} meetingId={selectedMeetingId} />;
      case 'hud':
        return <HUDPage onNavigate={handleNavigate} />;
      case 'settings':
        return <SettingsPage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <MeetingSidebar activePage={activePage} onNavigate={handleNavigate} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <TopNavigation activePage={activePage} onNavigate={handleNavigate} />
          </div>

          {/* Content Area */}
          <main className="flex-1">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}

function HomePage({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl text-gray-900 dark:text-gray-100">Suas reuniões</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Meeting List - Takes up 2 columns on desktop */}
          <div className="lg:col-span-2">
            <MeetingList onNavigate={onNavigate} />
          </div>

          {/* Right Sidebar Content */}
          <div className="space-y-6">
            <RecentInsights />
            <SetupStatus />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 p-6 bg-white dark:bg-gray-800 border rounded-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Start Next Meeting Button */}
            <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
              <Play className="w-4 h-4" />
              Iniciar próxima reunião
            </Button>

            {/* Footer Links */}
            <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <a href="#" className="hover:text-gray-900 dark:hover:text-gray-200">Resources</a>
              <a href="#" className="hover:text-gray-900 dark:hover:text-gray-200">Legal</a>
              <div className="flex items-center gap-2">
                <span>Made with</span>
                <span className="text-purple-600">Visily</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}