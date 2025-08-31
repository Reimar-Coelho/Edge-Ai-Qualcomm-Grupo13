interface TopNavigationProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export function TopNavigation({ activePage, onNavigate }: TopNavigationProps) {
  const navItems = [
    { label: "Início", page: "home" },
    { label: "Linha do tempo", page: "timeline" },
    { label: "HUD", page: "hud" },
    { label: "Configurações", page: "settings" },
  ];

  return (
    <div className="flex items-center justify-between py-4 px-6 bg-white dark:bg-gray-900 border-b dark:border-gray-800">
      <div className="flex items-center gap-8">
        <div className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center rounded">
          <span className="text-sm">✱</span>
        </div>
        
        <nav className="flex gap-6">
          {navItems.map((item, index) => (
            <button
              key={index}
              onClick={() => onNavigate(item.page)}
              className={`text-sm transition-colors ${
                activePage === item.page
                  ? "text-blue-600" 
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}