import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { EventEmitter } from 'events';

/**
 * Detector de emoções usando Python como backend
 * Comunica com script Python via stdin/stdout
 */
export class EmotionDetectorPythonBridge extends EventEmitter {
    private pythonProcess: ChildProcess | null = null;
    private pythonScript: string;
    private isInitialized: boolean = false;
    private requestQueue: Map<string, (result: any) => void> = new Map();
    private requestCounter: number = 0;

    constructor(pythonScriptPath?: string) {
        super();
        this.pythonScript = pythonScriptPath || path.join(__dirname, 'emotion_detector.py');
        
        // Cria o script Python se não existir
        if (!fs.existsSync(this.pythonScript)) {
            this.createPythonScript();
        }
        
        console.log(`[IA] Python Bridge inicializado`);
    }

    /**
     * Cria o script Python para detecção
     */
    private createPythonScript(): void {
        const pythonCode = `
import sys
import json
import base64
import numpy as np
from io import BytesIO
from PIL import Image
import warnings
warnings.filterwarnings('ignore')

# Importa bibliotecas de IA
try:
    from fer import FER
    import cv2
    DETECTOR_TYPE = "fer"
except ImportError:
    try:
        from deepface import DeepFace
        DETECTOR_TYPE = "deepface"
    except ImportError:
        print(json.dumps({"error": "Instale fer ou deepface: pip install fer deepface"}))
        sys.exit(1)

class EmotionDetector:
    def __init__(self):
        if DETECTOR_TYPE == "fer":
            self.detector = FER(mtcnn=True)
        self.initialized = True
        print(json.dumps({"status": "initialized", "detector": DETECTOR_TYPE}))
        sys.stdout.flush()
    
    def detect_fer(self, image_array):
        """Detecção usando FER"""
        results = self.detector.detect_emotions(image_array)
        
        if not results:
            return []
        
        processed_results = []
        for idx, face in enumerate(results):
            emotions = face['emotions']
            box = face['box']
            
            # Ordena emoções por confiança
            sorted_emotions = sorted(
                emotions.items(), 
                key=lambda x: x[1], 
                reverse=True
            )
            
            processed_results.append({
                'faceIndex': idx,
                'boundingBox': {
                    'x': box[0],
                    'y': box[1],
                    'width': box[2],
                    'height': box[3]
                },
                'emotions': [
                    {'emotion': em, 'confidence': conf} 
                    for em, conf in sorted_emotions
                ],
                'dominantEmotion': {
                    'emotion': sorted_emotions[0][0],
                    'confidence': sorted_emotions[0][1]
                }
            })
        
        return processed_results
    
    def detect_deepface(self, image_array):
        """Detecção usando DeepFace"""
        try:
            # Salva temporariamente (DeepFace precisa de arquivo)
            img = Image.fromarray(image_array)
            temp_path = '/tmp/temp_emotion.jpg'
            img.save(temp_path)
            
            # Analisa
            results = DeepFace.analyze(
                temp_path, 
                actions=['emotion'],
                enforce_detection=False
            )
            
            if isinstance(results, list):
                results = results[0]
            
            emotions = results['emotion']
            sorted_emotions = sorted(
                emotions.items(), 
                key=lambda x: x[1], 
                reverse=True
            )
            
            return [{
                'faceIndex': 0,
                'boundingBox': results.get('region', {
                    'x': 0, 'y': 0, 'width': 100, 'height': 100
                }),
                'emotions': [
                    {'emotion': em, 'confidence': conf/100.0} 
                    for em, conf in sorted_emotions
                ],
                'dominantEmotion': {
                    'emotion': results['dominant_emotion'],
                    'confidence': emotions[results['dominant_emotion']]/100.0
                }
            }]
            
        except Exception as e:
            return []
    
    def process_image(self, base64_image):
        """Processa imagem codificada em base64"""
        try:
            # Decodifica base64
            image_data = base64.b64decode(base64_image)
            image = Image.open(BytesIO(image_data))
            
            # Converte para array numpy
            image_array = np.array(image)
            
            # Detecta emoções
            if DETECTOR_TYPE == "fer":
                results = self.detect_fer(image_array)
            else:
                results = self.detect_deepface(image_array)
            
            return results
            
        except Exception as e:
            return {'error': str(e)}

# Loop principal
detector = EmotionDetector()

while True:
    try:
        line = sys.stdin.readline()
        if not line:
            break
        
        request = json.loads(line)
        request_id = request.get('id')
        command = request.get('command')
        
        if command == 'detect':
            image_data = request.get('image')
            results = detector.process_image(image_data)
            response = {
                'id': request_id,
                'results': results
            }
        elif command == 'ping':
            response = {
                'id': request_id,
                'status': 'alive',
                'detector': DETECTOR_TYPE
            }
        else:
            response = {
                'id': request_id,
                'error': f'Unknown command: {command}'
            }
        
        print(json.dumps(response))
        sys.stdout.flush()
        
    except Exception as e:
        print(json.dumps({
            'id': request_id if 'request_id' in locals() else None,
            'error': str(e)
        }))
        sys.stdout.flush()
`;

        fs.writeFileSync(this.pythonScript, pythonCode);
        console.log(`[IA] Script Python criado em: ${this.pythonScript}`);
    }

    /**
     * Inicializa o processo Python
     */
    async initialize(): Promise<void> {
        if (this.isInitialized) {
            console.log("[IA] Já inicializado");
            return;
        }

        return new Promise((resolve, reject) => {
            console.log("[IA] Iniciando processo Python...");
            
            // Spawn do processo Python
            this.pythonProcess = spawn('python3', [this.pythonScript], {
                stdio: ['pipe', 'pipe', 'pipe']
            });

            // Handler para stdout
            this.pythonProcess.stdout!.on('data', (data) => {
                const lines = data.toString().split('\n').filter(line => line.trim());
                
                lines.forEach(line => {
                    try {
                        const response = JSON.parse(line);
                        
                        if (response.status === 'initialized') {
                            console.log(`[IA] Python inicializado com: ${response.detector}`);
                            this.isInitialized = true;
                            resolve();
                        } else if (response.id && this.requestQueue.has(response.id)) {
                            const callback = this.requestQueue.get(response.id)!;
                            this.requestQueue.delete(response.id);
                            callback(response);
                        }
                    } catch (e) {
                        console.error("[IA] Erro ao parsear resposta:", e);
                    }
                });
            });

            // Handler para stderr
            this.pythonProcess.stderr!.on('data', (data) => {
                console.error(`[IA Python Error]: ${data}`);
            });

            // Handler para erros
            this.pythonProcess.on('error', (error) => {
                console.error('[IA] Erro no processo Python:', error);
                reject(error);
            });

            // Handler para saída
            this.pythonProcess.on('exit', (code) => {
                console.log(`[IA] Processo Python finalizado com código: ${code}`);
                this.isInitialized = false;
                this.pythonProcess = null;
            });

            // Timeout para inicialização
            setTimeout(() => {
                if (!this.isInitialized) {
                    reject(new Error('Timeout na inicialização do Python'));
                }
            }, 30000);
        });
    }

    /**
     * Envia comando para o processo Python
     */
    private sendCommand(command: any): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.pythonProcess || !this.isInitialized) {
                reject(new Error('Processo Python não inicializado'));
                return;
            }

            const requestId = `req_${++this.requestCounter}`;
            command.id = requestId;

            this.requestQueue.set(requestId, (response) => {
                if (response.error) {
                    reject(new Error(response.error));
                } else {
                    resolve(response.results);
                }
            });

            // Envia comando
            this.pythonProcess.stdin!.write(JSON.stringify(command) + '\n');

            // Timeout
            setTimeout(() => {
                if (this.requestQueue.has(requestId)) {
                    this.requestQueue.delete(requestId);
                    reject(new Error('Timeout na resposta do Python'));
                }
            }, 10000);
        });
    }

    /**
     * Detecta emoções em uma imagem
     */
    async detectEmotion(imageBuffer: Buffer): Promise<EmotionResult[]> {
        if (!this.isInitialized) {
            await this.initialize();
        }

        if (!imageBuffer || imageBuffer.length === 0) {
            console.warn("[IA] Buffer de imagem inválido");
            return [];
        }

        try {
            // Converte para base64
            const base64Image = imageBuffer.toString('base64');
            
            // Envia para Python
            const results = await this.sendCommand({
                command: 'detect',
                image: base64Image
            });

            if (Array.isArray(results) && results.length > 0) {
                console.log(`[IA] ${results.length} face(s) detectada(s)`);
                results.forEach(r => {
                    console.log(`  Face ${r.faceIndex}: ${r.dominantEmotion.emotion} (${(r.dominantEmotion.confidence * 100).toFixed(1)}%)`);
                });
            }

            return results || [];
            
        } catch (error) {
            console.error("[IA] Erro na detecção:", error);
            return [];
        }
    }

    /**
     * Verifica se o processo está vivo
     */
    async ping(): Promise<boolean> {
        try {
            const response = await this.sendCommand({ command: 'ping' });
            return response.status === 'alive';
        } catch {
            return false;
        }
    }

    /**
     * Finaliza o processo Python
     */
    dispose(): void {
        if (this.pythonProcess) {
            console.log("[IA] Finalizando processo Python...");
            this.pythonProcess.kill();
            this.pythonProcess = null;
            this.isInitialized = false;
            this.requestQueue.clear();
        }
    }
}

interface EmotionResult {
    faceIndex: number;
    boundingBox: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    emotions: Array<{
        emotion: string;
        confidence: number;
    }>;
    dominantEmotion: {
        emotion: string;
        confidence: number;
    };
}

// ===== EXEMPLO DE USO =====

async function example() {
    const detector = new EmotionDetectorPythonBridge();
    
    try {
        // Inicializa
        console.log('\n=== Inicializando Python Bridge ===');
        await detector.initialize();
        
        // Verifica conexão
        const isAlive = await detector.ping();
        console.log('Python processo ativo:', isAlive);
        
        // Carrega imagem
        const imageBuffer = fs.readFileSync('./test_image.jpg');
        
        // Detecta emoções
        console.log('\n=== Detectando Emoções ===');
        const results = await detector.detectEmotion(imageBuffer);
        
        if (results.length > 0) {
            results.forEach(result => {
                console.log(`\nFace ${result.faceIndex}:`);
                console.log('Top 3 emoções:');
                result.emotions.slice(0, 3).forEach((e, i) => {
                    console.log(`  ${i + 1}. ${e.emotion}: ${(e.confidence * 100).toFixed(2)}%`);
                });
            });
        } else {
            console.log('Nenhuma face detectada');
        }
        
    } catch (error) {
        console.error('Erro:', error);
    } finally {
        // Limpa recursos
        detector.dispose();
    }
}