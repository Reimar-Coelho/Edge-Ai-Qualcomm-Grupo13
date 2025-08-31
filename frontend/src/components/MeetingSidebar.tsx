import { Home, Clock, Settings, Monitor } from "lucide-react";

interface MeetingSidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export function MeetingSidebar({ activePage, onNavigate }: MeetingSidebarProps) {
  const menuItems = [
    { icon: Home, label: "Início", page: "home" },
    { icon: Clock, label: "Linha do tempo", page: "timeline" },
    { icon: Monitor, label: "HUD", page: "hud" },
    { icon: Settings, label: "Configurações", page: "settings" },
  ];

  return (
    <div className="w-48 bg-gray-50 dark:bg-gray-900 h-full flex flex-col border-r dark:border-gray-800">
      {/* Logo */}
      <div className="p-6">
        <div className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center rounded">
          <span className="text-sm">✱</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activePage === item.page;
          return (
            <div
              key={index}
              onClick={() => onNavigate(item.page)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 cursor-pointer transition-colors ${
                isActive
                  ? "bg-white dark:bg-gray-800 text-blue-600 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-800/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>
    </div>
  );
}