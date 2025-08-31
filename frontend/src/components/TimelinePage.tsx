import { Calendar, Clock, Users, ArrowLeft, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface TimelinePageProps {
  onNavigate: (page: string, meetingId?: string) => void;
}

export function TimelinePage({ onNavigate }: TimelinePageProps) {
  const pastMeetings = [
    {
      id: "meeting-1",
      title: "Alinhamento da Estratégia de Vendas do 3° Trimestre",
      date: "26 de Outubro, 2025",
      time: "10:00 - 11:30",
      duration: "1h 30m",
      participants: 3,
      company: "Tech Solutions Corp",
      status: "completed",
      sentiment: "positive",
      pendingTasks: 3,
      completedTasks: 1,
      keyOutcome: "Oportunidade em estágio avançado"
    },
    {
      id: "meeting-2", 
      title: "Apresentação de Proposta - Sistema CRM",
      date: "24 de Outubro, 2025",
      time: "14:00 - 15:00",
      duration: "1h 00m",
      participants: 2,
      company: "InnovaCorp Ltd",
      status: "completed",
      sentiment: "neutral",
      pendingTasks: 2,
      completedTasks: 3,
      keyOutcome: "Aguardando decisão do cliente"
    },
    {
      id: "meeting-3",
      title: "Discovery Call - Necessidades de Automação",
      date: "22 de Outubro, 2025",
      time: "09:00 - 10:00",
      duration: "1h 00m",
      participants: 4,
      company: "Global Systems Inc",
      status: "completed",
      sentiment: "negative",
      pendingTasks: 1,
      completedTasks: 2,
      keyOutcome: "Objeções sobre preço identificadas"
    },
    {
      id: "meeting-4",
      title: "Follow-up - Implementação Q4",
      date: "20 de Outubro, 2025",
      time: "16:00 - 16:30",
      duration: "30m",
      participants: 2,
      company: "StartupXYZ",
      status: "completed",
      sentiment: "positive",
      pendingTasks: 0,
      completedTasks: 4,
      keyOutcome: "Contrato fechado"
    }
  ];

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-500';
      case 'negative': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return CheckCircle2;
      case 'negative': return XCircle;
      default: return AlertCircle;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Dashboard
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl text-gray-900 dark:text-gray-100 mb-2">Histórico de Reuniões</h1>
        <p className="text-gray-600 dark:text-gray-400">Visualize suas reuniões passadas e acompanhe o progresso das ações</p>
      </div>

      {/* Meetings List */}
      <div className="space-y-4">
        {pastMeetings.map((meeting) => {
          const SentimentIcon = getSentimentIcon(meeting.sentiment);
          
          return (
            <div 
              key={meeting.id}
              className="bg-white dark:bg-gray-800 rounded-lg border p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onNavigate('meeting-details', meeting.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Meeting Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg text-gray-900 dark:text-gray-100">{meeting.title}</h3>
                    <Badge 
                      variant="secondary" 
                      className={`${getSentimentColor(meeting.sentiment)} text-white text-xs flex items-center gap-1`}
                    >
                      <SentimentIcon className="w-3 h-3" />
                      {meeting.sentiment}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{meeting.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{meeting.time} ({meeting.duration})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{meeting.participants} participantes</span>
                    </div>
                    <div>
                      <span className="text-blue-600 dark:text-blue-400">{meeting.company}</span>
                    </div>
                  </div>

                  {/* Key Outcome */}
                  <div className="mb-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Resultado Principal:</span> {meeting.keyOutcome}
                    </p>
                  </div>

                  {/* Tasks Status */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-400">
                        {meeting.pendingTasks} tarefas pendentes
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-400">
                        {meeting.completedTasks} tarefas concluídas
                      </span>
                    </div>
                  </div>
                </div>

                {/* Arrow indicator */}
                <div className="text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total de Reuniões</p>
              <p className="text-2xl text-gray-900 dark:text-gray-100">12</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tarefas Pendentes</p>
              <p className="text-2xl text-orange-600">6</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Taxa de Sucesso</p>
              <p className="text-2xl text-green-600">78%</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>
    </div>
  );
}