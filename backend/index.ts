// index.ts
import * as path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';

// ✅ importe correto do detector (ajuste o caminho para o seu projeto)
// Se você compila TS → JS e roda o JS, pode precisar trocar a extensão para .js
import { EmotionDetector } from './src/modules/IdentifyFaceExpression';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ❌ NÃO use barra inicial aqui
// const MODELS_PATH = path.join(__dirname, '/src/models');
// ✅ correto:
const MODELS_PATH = path.join(__dirname, 'src', 'models');

async function main() {
  console.log('--- Iniciando Servidor de Análise de Emoções ---');

  // 1) Inicializa o Detector
  const emotionDetector = new EmotionDetector(MODELS_PATH);
  await emotionDetector.loadModels();

  // 2) Servidor WS
  const wss = new WebSocketServer({ port: 8080 });
  console.log('[Servidor] Aguardando conexão da extensão do Chrome na porta 8080...');

  wss.on('connection', (ws: WebSocket) => {
    console.log('[Servidor] Extensão conectada!');

    ws.on('message', async (raw: WebSocket.RawData) => {
      try {
        // RawData pode ser Buffer | ArrayBuffer | Buffer[]
        let buf: Buffer;
        if (Array.isArray(raw)) buf = Buffer.concat(raw as Buffer[]);
        else if (raw instanceof ArrayBuffer) buf = Buffer.from(raw);
        else buf = raw as Buffer;

        // Pode vir data URL, base64 puro ou JSON { image: "data:..." }
        let text = buf.toString('utf-8');

        // Se veio JSON com { image: "..." }
        if (text.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(text);
            if (parsed?.image && typeof parsed.image === 'string') {
              text = parsed.image;
            }
          } catch {
            // segue o fluxo; pode não ser JSON
          }
        }

        // Se for data URL, remove o cabeçalho
        const commaIdx = text.indexOf(',');
        const base64Data = commaIdx >= 0 ? text.slice(commaIdx + 1) : text;

        if (!base64Data || base64Data.length < 8) {
          console.warn('[Servidor] Frame vazio ou inválido.');
          return;
        }

        const imageBuffer = Buffer.from(base64Data, 'base64');

        console.log('\n[Servidor] Frame recebido. Analisando emoção...');
        const expressions = await emotionDetector.detectEmotion(imageBuffer);

        if (!expressions || expressions.length === 0) {
          console.log('[Servidor] Nenhuma face detectada.');
          // Opcional: informe o cliente
          ws.send(JSON.stringify({ faces: 0, results: [] }));
          return;
        }

        console.log('[Servidor] Emoções detectadas:');
        const results = expressions.map((face: Record<string, number>, i: number) => {
          // ✅ pegue a melhor emoção corretamente
          const [emotion, score] = Object.entries(face).reduce<[string, number]>(
            (best, [k, v]) => (Number(v) > best[1] ? [k, Number(v)] : best),
            ['none', 0]
          );

          console.log(`  - Rosto ${i + 1}: ${emotion} (${(score * 100).toFixed(2)}%)`);
          return { face: i + 1, emotion, score };
        });

        // Devolva para a extensão (útil para UI em tempo real)
        ws.send(JSON.stringify({ faces: results.length, results }));
      } catch (err) {
        console.error('[Servidor] Erro ao processar frame:', err);
        try {
          ws.send(JSON.stringify({ error: 'failed_to_process_frame' }));
        } catch {}
      }
    });

    ws.on('close', () => console.log('[Servidor] Extensão desconectada.'));
    ws.on('error', (e) => console.error('[Servidor] Erro WS:', e));
  });
}

main().catch((e) => {
  console.error('Falha fatal ao iniciar:', e);
  process.exit(1);
});
