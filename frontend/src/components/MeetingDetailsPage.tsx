import { Calendar, Clock, Users, ChevronDown, FileDown, ArrowLeft, Play, MessageSquare, FileText, BarChart3 } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface MeetingDetailsPageProps {
  onNavigate: (page: string) => void;
  meetingId?: string;
}

export function MeetingDetailsPage({ onNavigate, meetingId }: MeetingDetailsPageProps) {
  const keyMoments = [
    {
      title: "Apresentações e Definição da Agenda",
      time: "00:02:15",
      description: "Durante a reunião, o cliente expressou preocupação para com as particularidades",
      sentiment: "neutro",
      sentimentColor: "bg-gray-500"
    },
    {
      title: "Ponto de dor do cliente identificado: Escalabilidade",
      time: "00:10:30",
      description: "Durante a reunião, o cliente expressou preocupação sobre a capacidade da...",
      sentiment: "negativo",
      sentimentColor: "bg-red-500"
    },
    {
      title: "Apresentação da Solução: Infraestrutura em Nuvem",
      time: "00:25:00",
      description: "Demonstração da solução proposta com foco na escalabilidade",
      sentiment: "positivo",
      sentimentColor: "bg-green-500"
    },
    {
      title: "Discussão sobre Preços Iniciada",
      time: "00:38:45",
      description: "Cliente questionou valores e solicitou comparação com concorrentes",
      sentiment: "neutro",
      sentimentColor: "bg-gray-500"
    },
    {
      title: "Próximos passos acordados: Demonstração de acompanhamento",
      time: "00:45:10",
      description: "Agendada demo técnica para próxima semana",
      sentiment: "positivo",
      sentimentColor: "bg-green-500"
    }
  ];

  const tasks = [
    { text: "Enviar proposta detalhada para Infraestrutura em nuvem", checked: false },
    { text: "Agendar demonstração de acompanhamento para a próxima terça-feira, às 10h", checked: true },
    { text: "Coletar requisitos do cliente para integração personalizada", checked: false },
    { text: "Pesquisar preços da concorrência para serviços similares", checked: false }
  ];

  const followUps = [
    "Verificar com a equipe de TI a viabilidade da integração.",
    "Preparar estudos de caso relevantes para o setor do cliente.",
    "Revisar notas das reuniões anteriores para obter contexto adicional."
  ];

  const transcript = [
    {
      speaker: "João Silva",
      time: "00:02:15",
      text: "Bom dia pessoal, vamos começar nossa reunião de alinhamento. Hoje queremos discutir nossa estratégia para o terceiro trimestre."
    },
    {
      speaker: "Maria Santos",
      time: "00:02:45",
      text: "Perfeito, João. Preparei algumas análises que podem nos ajudar a definir as metas. Uma das principais preocupações que identifiquei é a escalabilidade."
    },
    {
      speaker: "Carlos Pereira",
      time: "00:03:20",
      text: "Escalabilidade é realmente crucial. Nossa infraestrutura atual consegue suportar o crescimento previsto?"
    },
    {
      speaker: "João Silva", 
      time: "00:04:00",
      text: "Essa é uma ótima pergunta, Carlos. Acredito que nossa solução em nuvem pode resolver esse problema. Deixe-me mostrar alguns dados..."
    },
    {
      speaker: "Maria Santos",
      time: "00:10:30",
      text: "Os números são impressionantes, mas preciso entender melhor os custos. Como isso se compara com as soluções concorrentes?"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header with breadcrumb */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onNavigate('timeline')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Timeline
        </Button>
      </div>

      {/* Meeting Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
        <h1 className="text-2xl mb-4">Alinhamento da Estratégia de Vendas do 3° Trimestre</h1>
        
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>26, Outubro, 2025</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>10:00 AM - 11:30 AM (1h 30m)</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>3 Participantes</span>
          </div>
        </div>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="transcript" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Transcrição
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Resumo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Key Moments */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
                <h2 className="text-lg mb-4">Momentos chave</h2>
                <div className="space-y-4">
                  {keyMoments.map((moment, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{moment.time}</span>
                          <Badge 
                            variant="secondary" 
                            className={`${moment.sentimentColor} text-white text-xs`}
                          >
                            {moment.sentiment}
                          </Badge>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </div>
                      <h3 className="mb-2">{moment.title}</h3>
                      {moment.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{moment.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tasks */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
                <h2 className="text-lg mb-4">Tarefas</h2>
                <div className="space-y-3">
                  {tasks.map((task, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Checkbox 
                        checked={task.checked}
                        className="mt-1"
                      />
                      <span className={`text-sm ${task.checked ? 'line-through text-gray-500' : ''}`}>
                        {task.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Follow-ups */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
                <h2 className="text-lg mb-4">Follow-ups</h2>
                <div className="space-y-3">
                  {followUps.map((followUp, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{followUp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Meeting Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
                <h3 className="mb-4">Resumo da reunião</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>26, outubro, 2025</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>1h 30m</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>3 Participantes</span>
                  </div>
                </div>
              </div>

              {/* Stage Results */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
                <h3 className="mb-4">Resultado da etapa</h3>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>Oportunidade em estágio avançado</span>
                </div>
              </div>

              {/* Export Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
                <h3 className="mb-4">Exportar resumo</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <FileDown className="w-4 h-4 mr-2" />
                    Exportar para TXT
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileDown className="w-4 h-4 mr-2" />
                    Exportar para JSON
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="transcript" className="mt-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
            <h2 className="text-lg mb-4">Transcrição da Reunião</h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {transcript.map((entry, index) => (
                <div key={index} className="flex gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="text-sm text-gray-500 dark:text-gray-400 w-16 flex-shrink-0">
                    {entry.time}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">
                      {entry.speaker}
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {entry.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="summary" className="mt-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
            <h2 className="text-lg mb-4">Resumo Executivo</h2>
            <div className="space-y-4">
              <div>
                <h3 className="mb-2">Principais Tópicos Discutidos</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>Estratégia de vendas para Q3</li>
                  <li>Preocupações sobre escalabilidade da infraestrutura</li>
                  <li>Apresentação da solução em nuvem</li>
                  <li>Comparação de preços com concorrentes</li>
                  <li>Definição de próximos passos</li>
                </ul>
              </div>
              
              <div>
                <h3 className="mb-2">Decisões Tomadas</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>Implementar solução de infraestrutura em nuvem</li>
                  <li>Agendar demonstração técnica detalhada</li>
                  <li>Realizar pesquisa competitiva de preços</li>
                </ul>
              </div>

              <div>
                <h3 className="mb-2">Próximas Ações</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>Envio de proposta comercial detalhada</li>
                  <li>Agendamento de demo para próxima terça-feira</li>
                  <li>Coleta de requisitos técnicos específicos</li>
                  <li>Análise competitiva de soluções similares</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}