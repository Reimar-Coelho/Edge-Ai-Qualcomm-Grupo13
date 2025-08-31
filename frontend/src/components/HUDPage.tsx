import { useState } from "react";
import { ArrowLeft, Bookmark, Volume2, Lightbulb, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

interface HUDPageProps {
  onNavigate: (page: string) => void;
}

export function HUDPage({ onNavigate }: HUDPageProps) {
  const [isCallActive, setIsCallActive] = useState(true);
  
  const insights = [
    {
      type: "connection",
      title: "Ligação em andamento",
      subtitle: "12 perguntas feitas",
      status: "active",
      color: "text-green-600"
    },
    {
      type: "objection", 
      title: "Quebra de objeção:",
      subtitle: "Cliente está achando caro",
      status: "warning",
      color: "text-orange-600"
    },
    {
      type: "suggestion",
      title: "Considere perguntar sobre o orçamento.",
      status: "info", 
      color: "text-blue-600"
    },
    {
      type: "reminder",
      title: "Não se esqueça de confirmar os próximos passos.",
      status: "info",
      color: "text-blue-600"  
    }
  ];

  const speakingStats = [
    { name: "Você", percentage: 35, color: "bg-blue-500" },
    { name: "Cliente", percentage: 65, color: "bg-purple-500" }
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
      {/* Background content area - simulating meeting interface */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-gray-400 dark:text-gray-600">
          <p className="text-lg mb-2">Esta área representa o conteúdo principal da</p>
          <p className="text-lg mb-4">call. Os elementos do HUD foram projetados</p>
          <p className="text-lg mb-4">para flutuar de forma não intrusiva sobre ele,</p>
          <p className="text-lg mb-4">fornecendo insights em tempo real e ações</p>
          <p className="text-lg">rápidas durante uma chamada ou reunião ativa.</p>
        </div>
      </div>

      {/* Back button - top left */}
      <div className="absolute top-4 left-4 z-50">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Button>
      </div>

      {/* HUD Elements */}
      
      {/* Connection Status - Top Left */}
      <div className="absolute top-4 left-20 bg-white dark:bg-gray-800 rounded-lg border shadow-lg p-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-600 dark:text-green-400">Ligação em andamento</span>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <Badge variant="outline" className="text-xs">Análise</Badge>
          <span className="text-xs text-gray-600 dark:text-gray-400">12 perguntas feitas</span>
        </div>
      </div>

      {/* Speaking Balance Chart - Left Side */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg border shadow-lg p-4 w-64">
        <h3 className="text-sm mb-3">Balanceamento da vez de falar</h3>
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Agora</div>
        
        <div className="space-y-3 mb-4">
          {speakingStats.map((stat, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">{stat.name}</span>
                <span className="text-sm">{stat.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`${stat.color} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${stat.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-gray-600 dark:text-gray-400">
          <p>Ouvir um pouco mais! É típico equilibrar</p>
          <p>40%:60% durante o discovery,</p>
          <p>65%:35% ao apresentar.</p>
        </div>
      </div>

      {/* Insights Panel - Right Side */}
      <div className="absolute right-4 top-1/4 bg-white dark:bg-gray-800 rounded-lg border shadow-lg p-4 w-80 max-h-96 overflow-y-auto">
        {insights.map((insight, index) => (
          <div key={index} className={`flex items-start gap-3 p-3 mb-2 rounded-lg ${insight.color}`}>
            <div className="flex-shrink-0 mt-0.5">
              {insight.status === 'active' && <CheckCircle className="w-4 h-4" />}
              {insight.status === 'warning' && <AlertTriangle className="w-4 h-4" />}
              {insight.status === 'info' && <Lightbulb className="w-4 h-4" />}
            </div>
            <div className="flex-1">
              <p className="text-sm">{insight.title}</p>
              {insight.subtitle && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{insight.subtitle}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Control Panel */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-full border shadow-lg px-6 py-3">
        <div className="flex items-center gap-4">
          <Button 
            size="sm" 
            variant="ghost"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600"
            onClick={() => {/* Mark moment functionality */}}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Mark Moment
          </Button>

          <Button 
            size="sm" 
            variant="ghost"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600"
          >
            <Bookmark className="w-4 h-4" />
            Bookmark
          </Button>

          <Button 
            size="sm" 
            variant="ghost"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600"
          >
            <Volume2 className="w-4 h-4" />
            Mute AI
          </Button>

          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => {
              setIsCallActive(false);
              // Navigate to meeting summary or timeline
              onNavigate('timeline');
            }}
          >
            Encerrar Reunião e Ver Resumo
          </Button>
        </div>
      </div>

      {/* Call Duration - Top Right */}
      <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg border shadow-lg p-2">
        <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
          <div className="text-xs">Duração</div>
          <div className="text-lg font-mono">00:15:42</div>
        </div>
      </div>

      {/* Audio Activity Indicator - Bottom Left */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg border shadow-lg p-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Audio ativo</span>
        </div>
        <div className="flex items-center gap-1 mt-2">
          {/* Audio level bars */}
          {Array.from({length: 5}).map((_, i) => (
            <div
              key={i}
              className={`w-1 bg-blue-500 rounded-full transition-all duration-150 ${
                i < 3 ? 'h-3' : 'h-1 bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}