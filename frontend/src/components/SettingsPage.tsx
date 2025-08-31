import { ArrowLeft, FolderOpen, Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useTheme } from "./ThemeProvider";

interface SettingsPageProps {
  onNavigate: (page: string) => void;
}

export function SettingsPage({ onNavigate }: SettingsPageProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
      </div>

      <h1 className="text-2xl mb-8">Configurações e privacidade</h1>

      <div className="space-y-8">
        {/* Theme Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
          <h2 className="text-lg mb-4">Aparência</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
              <div>
                <h3 className="text-sm">Modo escuro</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Alterne entre modo claro e escuro
                </p>
              </div>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
            />
          </div>
        </div>

        {/* Cache Management */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3>Apagar caché</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Remove os dados temporários do aplicativo. Esta ação não pode ser desfeita.
              </p>
            </div>
            <Button variant="outline">Apagar agora</Button>
          </div>
        </div>

        {/* Export Data */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3>Exportar todos os dados das reuniões</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Baixe um arquivo completo com todos os dados gravados de suas reuniões e insights.
              </p>
            </div>
            <Button variant="outline">Exportar dados</Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Localização atual dos dados</span>
            </div>
            <div className="text-xs text-gray-500">
              /Users/salesbeacon/Documents/SalesBeaconData
            </div>
          </div>
          
          <div className="mt-3">
            <Button variant="link" className="text-sm p-0">
              Mudar local dos dados
            </Button>
          </div>
        </div>

        {/* Privacy and Consent */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
          <h2 className="text-lg mb-4">Privacidade e consentimento</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Gerencie suas preferências de compartilhamento de dados e consentimento para garantir que sua privacidade esteja sempre protegida.
          </p>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm">Permitir análise de conteúdo da reunião por IA</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Ative a inteligência artificial para processar as transcrições das reuniões e gerar insights e resumos avançados.
                </p>
              </div>
              <Switch defaultChecked={false} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm">Mostrar lembrete de consentimento ao iniciar</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Exibir um lembrete de consentimento sobre uso de dados toda vez que o aplicativo for iniciado.
                </p>
              </div>
              <Switch defaultChecked={true} />
            </div>
          </div>
        </div>

        {/* Data Storage Policy */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
          <h2 className="text-lg mb-4">Política de Armazenamento de Dados</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Política automatizada para limpeza de dados antigos de reuniões para liberar espaço e manter a privacidade. Configure por quanto tempo os dados ficam armazenados no dispositivo.
          </p>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm">Excluir automaticamente dados com mais de</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Selecione o período após o qual os dados das reuniões serão removidos automaticamente do seu dispositivo.
                </p>
              </div>
              <Select defaultValue="90">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 Dias</SelectItem>
                  <SelectItem value="60">60 Dias</SelectItem>
                  <SelectItem value="90">90 Dias</SelectItem>
                  <SelectItem value="180">180 Dias</SelectItem>
                  <SelectItem value="365">1 Ano</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm">Manter resumos importantes das reuniões indefinidamente.</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Manter resumos e itens de ação críticos das reuniões, mesmo que a gravação completa seja excluída.
                </p>
              </div>
              <Switch defaultChecked={true} />
            </div>
          </div>
        </div>

        {/* Camera and Microphone */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
          <h2 className="text-lg mb-4">Indicações de Câmera e Microfone</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Configure indicadores visuais relacionados à atividade de câmera e do microfone durante as reuniões, garantindo transparência.
          </p>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm">Mostrar indicador de gravação</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Exibir um indicador visual na tela quando uma reunião estiver sendo gravada ativamente.
                </p>
              </div>
              <Switch defaultChecked={true} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm">Acender luz da webcam durante a gravação</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Ativa a luz da sua webcam sempre que estiver gravando ativamente.
                </p>
              </div>
              <Switch defaultChecked={false} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm">Exibir medidor de atividade do microfone</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Exibir um medidor de atividade do microfone em tempo real na tela durante reuniões ao vivo.
                </p>
              </div>
              <Switch defaultChecked={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}