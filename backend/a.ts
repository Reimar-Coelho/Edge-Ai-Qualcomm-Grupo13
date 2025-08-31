// ============================================
// ARQUIVO: emotion-detector.ts
// ============================================

import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { EventEmitter } from 'events';

/**
 * Detector de emoções usando Python como backend
 * Comunica com script Python via stdin/stdout
 */
export class EmotionDetector extends EventEmitter {
    private pythonProcess: ChildProcess | null = null;
    private pythonScript: string;
    private isInitialized: boolean = false;
    private requestQueue: Map<string, (result: any) => void> = new Map();
    private requestCounter: number = 0;
    private initTimeout: number = 30000; // 30 segundos

    constructor(pythonScriptPath?: string) {
        super();
        this.pythonScript = pythonScriptPath || path.join(__dirname, 'emotion_detector.py');
        
        // Verifica e cria estrutura necessária
        this.setupEnvironment();
        
        console.log(`[IA] Python Bridge configurado`);
    }

    /**
     * Configura o ambiente e cria scripts necessários
     */
    private setupEnvironment(): void {
        // Cria o script Python principal
        if (!fs.existsSync(this.pythonScript)) {
            this.createPythonScript();
        }

        // Cria script de instalação de dependências
        const installScript = path.join(path.dirname(this.pythonScript), 'install_deps.py');
        if (!fs.existsSync(installScript)) {
            this.createInstallScript(installScript);
        }

        // Cria arquivo requirements.txt
        const requirementsFile = path.join(path.dirname(this.pythonScript), 'requirements.txt');
        if (!fs.existsSync(requirementsFile)) {
            this.createRequirementsFile(requirementsFile);
        }

        console.log(`[IA] Ambiente configurado em: ${path.dirname(this.pythonScript)}`);
    }

    /**
     * Cria arquivo requirements.txt
     */
    private createRequirementsFile(filePath: string): void {
        const requirements = `# Dependências para detecção de emoções
fer>=22.5.0
tensorflow>=2.10.0
opencv-python>=4.6.0
pillow>=9.0.0
numpy>=1.21.0
mtcnn>=0.1.1

# Alternativa (descomente se preferir DeepFace)
# deepface>=0.0.79
# opencv-python>=4.6.0
`;
        fs.writeFileSync(filePath, requirements);
        console.log(`[IA] requirements.txt criado`);
    }

    /**
     * Cria script de instalação
     */
    private createInstallScript(filePath: string): void {
        const installScript = `#!/usr/bin/env python3
"""
Script de instalação automática das dependências
"""
import subprocess
import sys
import os

def install_packages():
    """Instala os pacotes necessários"""
    packages = [
        'fer',
        'tensorflow',
        'opencv-python',
        'pillow',
        'numpy',
        'mtcnn'
    ]
    
    print("🔧 Instalando dependências para detecção de emoções...")
    print("-" * 50)
    
    for package in packages:
        print(f"📦 Instalando {package}...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            print(f"✅ {package} instalado com sucesso!")
        except subprocess.CalledProcessError:
            print(f"❌ Erro ao instalar {package}")
            return False
    
    print("-" * 50)
    print("✨ Todas as dependências foram instaladas!")
    return True

def verify_installation():
    """Verifica se as instalações funcionam"""
    print("\\n🔍 Verificando instalação...")
    
    try:
        import fer
        import cv2
        import tensorflow as tf
        print("✅ FER importado com sucesso")
        print(f"✅ TensorFlow versão: {tf.__version__}")
        print(f"✅ OpenCV versão: {cv2.__version__}")
        return True
    except ImportError as e:
        print(f"❌ Erro na verificação: {e}")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("   INSTALADOR DE DEPENDÊNCIAS - EMOTION DETECTOR")
    print("=" * 50)
    
    if install_packages():
        if verify_installation():
            print("\\n🎉 Sistema pronto para uso!")
        else:
            print("\\n⚠️ Instalação concluída mas verificação falhou")
    else:
        print("\\n❌ Falha na instalação")
        sys.exit(1)
`;
        fs.writeFileSync(filePath, installScript);
        fs.chmodSync(filePath, '755'); // Torna executável
        console.log(`[IA] Script de instalação criado`);
    }

    /**
     * Cria o script Python principal
     */
    private createPythonScript(): void {
        const pythonCode = `#!/usr/bin/env python3
"""
Detector de Emoções em Python
Usa FER (Facial Expression Recognition) com TensorFlow
"""
import sys
import json
import base64
import numpy as np
from io import BytesIO
from PIL import Image
import traceback
import logging

# Configura logging
logging.basicConfig(level=logging.WARNING)

# Desabilita warnings do TensorFlow
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import warnings
warnings.filterwarnings('ignore')

# Importa bibliotecas de IA
try:
    from fer import FER
    import cv2
    DETECTOR_TYPE = "fer"
    HAS_FER = True
except ImportError:
    HAS_FER = False
    DETECTOR_TYPE = "none"
    print(json.dumps({
        "error": "FER não instalado. Execute: pip install fer tensorflow opencv-python",
        "status": "error"
    }))
    sys.stdout.flush()
    sys.exit(1)

class EmotionDetector:
    def __init__(self):
        """Inicializa o detector de emoções"""
        try:
            # Usa MTCNN para melhor detecção de faces
            self.detector = FER(mtcnn=True)
            self.initialized = True
            
            # Envia confirmação de inicialização
            print(json.dumps({
                "status": "initialized",
                "detector": DETECTOR_TYPE,
                "backend": "tensorflow",
                "features": ["face_detection", "emotion_recognition", "multi_face"]
            }))
            sys.stdout.flush()
            
        except Exception as e:
            print(json.dumps({
                "status": "error",
                "error": f"Erro na inicialização: {str(e)}"
            }))
            sys.stdout.flush()
            sys.exit(1)
    
    def detect_emotions(self, image_array):
        """
        Detecta emoções em uma imagem
        Retorna lista de faces com suas emoções
        """
        try:
            # Detecta emoções
            results = self.detector.detect_emotions(image_array)
            
            if not results:
                return {
                    "success": True,
                    "faces": [],
                    "message": "Nenhuma face detectada"
                }
            
            processed_results = []
            for idx, face in enumerate(results):
                emotions = face['emotions']
                box = face['box']
                
                # Calcula score de confiança da detecção
                area = box[2] * box[3];
                confidence_score = min(1.0, area / (image_array.shape[0] * image_array.shape[1] * 0.3));
                
                # Ordena emoções por confiança
                sorted_emotions = sorted(
                    emotions.items(), 
                    key=lambda x: x[1], 
                    reverse=True
                );
                
                # Calcula emoção secundária (se houver)
                secondary_emotion = None;
                if len(sorted_emotions) > 1 and sorted_emotions[1][1] > 0.1:
                    secondary_emotion = {
                        'emotion': sorted_emotions[1][0],
                        'confidence': sorted_emotions[1][1]
                    };
                
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
                    },
                    'secondaryEmotion': secondary_emotion,
                    'faceConfidence': confidence_score,
                    'emotionIntensity': sorted_emotions[0][1]  # Intensidade da emoção dominante
                });
            }
            
            # Calcula resumo geral
            all_emotions = {};
            for face in processed_results:
                for emotion in face['emotions']:
                    if emotion['emotion'] not in all_emotions:
                        all_emotions[emotion['emotion']] = [];
                    all_emotions[emotion['emotion']].append(emotion['confidence']);
            
            # Média das emoções em todas as faces
            emotion_summary = {
                em: sum(values)/len(values) 
                for em, values in all_emotions.items()
            };
            
            dominant_overall = max(emotion_summary.items(), key=lambda x: x[1]);
            
            return {
                "success": True,
                "faces": processed_results,
                "summary": {
                    "totalFaces": len(processed_results),
                    "dominantEmotion": dominant_overall[0],
                    "emotionDistribution": emotion_summary,
                    "averageFaceConfidence": sum(f['faceConfidence'] for f in processed_results) / len(processed_results)
                }
            };
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "faces": []
            };
    
    def process_image(self, base64_image):
        """Processa imagem codificada em base64"""
        try:
            # Decodifica base64
            image_data = base64.b64decode(base64_image);
            image = Image.open(BytesIO(image_data));
            
            # Converte para RGB se necessário
            if image.mode != 'RGB':
                image = image.convert('RGB');
            
            # Converte para array numpy
            image_array = np.array(image);
            
            # Detecta emoções
            results = self.detect_emotions(image_array);
            
            return results;
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Erro ao processar imagem: {str(e)}",
                "faces": []
            };
    
    def get_status(self):
        """Retorna status do detector"""
        return {
            "status": "alive",
            "detector": DETECTOR_TYPE,
            "initialized": self.initialized,
            "capabilities": {
                "multiface": True,
                "emotions": ["angry", "disgust", "fear", "happy", "sad", "surprise", "neutral"],
                "confidence_scores": True,
                "bounding_boxes": True
            }
        };

# ============================================
# LOOP PRINCIPAL
# ============================================

def main():
    """Loop principal do detector"""
    detector = EmotionDetector();
    
    while True:
        try:
            # Lê linha do stdin
            line = sys.stdin.readline();
            if not line:
                break;
            
            # Parse do comando JSON
            request = json.loads(line.strip());
            request_id = request.get('id', 'unknown');
            command = request.get('command');
            
            # Processa comando
            if command == 'detect':
                image_data = request.get('image');
                if not image_data:
                    response = {
                        'id': request_id,
                        'success': False,
                        'error': 'Nenhuma imagem fornecida'
                    };
                else:
                    results = detector.process_image(image_data);
                    response = {
                        'id': request_id,
                        **results
                    };
                    
            elif command == 'ping':
                response = {
                    'id': request_id,
                    **detector.get_status()
                };
                
            elif command == 'exit':
                print(json.dumps({
                    'id': request_id,
                    'status': 'goodbye'
                }));
                sys.stdout.flush();
                break;
                
            else:
                response = {
                    'id': request_id,
                    'success': False,
                    'error': f'Comando desconhecido: {command}'
                };
            
            # Envia resposta
            print(json.dumps(response));
            sys.stdout.flush();
            
        except json.JSONDecodeError as e:
            print(json.dumps({
                'id': 'error',
                'success': False,
                'error': f'JSON inválido: {str(e)}'
            }));
            sys.stdout.flush();
            
        except KeyboardInterrupt:
            break;
            
        except Exception as e:
            print(json.dumps({
                'id': request_id if 'request_id' in locals() else 'error',
                'success': False,
                'error': f'Erro não tratado: {str(e)}',
                'traceback': traceback.format_exc()
            }));
            sys.stdout.flush();

if __name__ == "__main__":
    main();
`;

        fs.writeFileSync(this.pythonScript, pythonCode);
        fs.chmodSync(this.pythonScript, '755'); // Torna executável
        console.log(`[IA] Script Python principal criado em: ${this.pythonScript}`);
    }

    /**
     * Instala dependências Python automaticamente
     */
    async installDependencies(): Promise<boolean> {
        console.log("[IA] Verificando/instalando dependências Python...");
        
        return new Promise((resolve) => {
            const installScript = path.join(path.dirname(this.pythonScript), 'install_deps.py');
            // Use python3 from PATH instead of hardcoded path
            const installProcess = spawn('python3', [installScript]);

            installProcess.stdout?.on('data', (data) => {
                console.log(`[INSTALL] ${data.toString().trim()}`);
            });

            installProcess.stderr?.on('data', (data) => {
                console.error(`[INSTALL ERROR] ${data.toString().trim()}`);
            });

            installProcess.on('exit', (code) => {
                if (code === 0) {
                    console.log("[IA] ✅ Dependências instaladas com sucesso!");
                    resolve(true);
                } else {
                    console.error("[IA] ❌ Falha na instalação das dependências");
                    console.log("[IA] Tente instalar manualmente:");
                    console.log("     pip install fer tensorflow opencv-python pillow numpy mtcnn");
                    resolve(false);
                }
            });
        });
    }

    /**
     * Inicializa o processo Python
     */
    async initialize(autoInstall: boolean = false): Promise<void> {
        if (this.isInitialized) {
            console.log("[IA] Já inicializado");
            return;
        }

        // Opcionalmente instala dependências
        if (autoInstall) {
            const installed = await this.installDependencies();
            if (!installed) {
                throw new Error("Falha na instalação das dependências");
            }
        }

        return new Promise((resolve, reject) => {
            console.log("[IA] Iniciando processo Python...");
            
            // Use python3 from PATH instead of hardcoded virtual env path
            const pythonCommand = 'python3';
            
            // Spawn do processo Python
            this.pythonProcess = spawn(pythonCommand, [this.pythonScript], {
                stdio: ['pipe', 'pipe', 'pipe']
            });

            let initBuffer = '';
            let errorBuffer = '';

            // Handler para stdout
            this.pythonProcess.stdout!.on('data', (data) => {
                const text = data.toString();
                initBuffer += text;
                console.log(`[PYTHON STDOUT] ${text.trim()}`); // Add debugging

                const lines = text.split('\n').filter((line: string) => line.trim());

                lines.forEach((line: string) => {
                    try {
                        const response = JSON.parse(line);
                        
                        if (response.status === 'initialized') {
                            console.log(`[IA] ✅ Python inicializado`);
                            console.log(`[IA] Detector: ${response.detector}`);
                            console.log(`[IA] Backend: ${response.backend}`);
                            console.log(`[IA] Features: ${response.features.join(', ')}`);
                            this.isInitialized = true;
                            
                            // Configura handler permanente
                            this.setupMessageHandler();
                            resolve();
                        } else if (response.id && this.requestQueue.has(response.id)) {
                            const callback = this.requestQueue.get(response.id)!;
                            this.requestQueue.delete(response.id);
                            callback(response);
                        }
                    } catch (e) {
                        // Não é JSON, ignora durante inicialização
                        console.log(`[PYTHON OUTPUT] ${line}`); // Log non-JSON output
                    }
                });
            });

            // Handler para stderr
            this.pythonProcess.stderr!.on('data', (data) => {
                const errorText = data.toString();
                errorBuffer += errorText;
                console.error(`[PYTHON STDERR] ${errorText.trim()}`); // Add debugging
            });

            // Handler para erros
            this.pythonProcess.on('error', (error) => {
                console.error('[IA] ❌ Erro no processo Python:', error);
                console.error('[IA] Certifique-se de que Python 3 está instalado e acessível');
                reject(error);
            });

            // Handler para saída
            this.pythonProcess.on('exit', (code) => {
                console.log(`[IA] Processo Python finalizado com código: ${code}`);
                if (!this.isInitialized && errorBuffer) {
                    console.error('[IA] Erros do Python:', errorBuffer);
                }
                if (!this.isInitialized && code !== 0) {
                    console.error('[IA] Python script failed to start. Check dependencies.');
                    reject(new Error(`Python process exited with code ${code}. Error: ${errorBuffer}`));
                }
                this.isInitialized = false;
                this.pythonProcess = null;
                this.emit('disconnected');
            });

            // Timeout para inicialização
            setTimeout(() => {
                if (!this.isInitialized) {
                    if (errorBuffer) {
                        console.error('[IA] Buffer de erro:', errorBuffer);
                    }
                    console.error('[IA] Verifique se as dependências estão instaladas:');
                    console.error('    pip install fer tensorflow opencv-python pillow numpy mtcnn');
                    reject(new Error('Timeout na inicialização do Python. Verifique se as dependências estão instaladas.'));
                }
            }, this.initTimeout);
        });
    }

    /**
     * Configura handler de mensagens após inicialização
     */
    private setupMessageHandler(): void {
        if (!this.pythonProcess) return;

        // Remove listeners antigos
        this.pythonProcess.stdout!.removeAllListeners('data');

        // Novo handler
        this.pythonProcess.stdout!.on('data', (data) => {
            const lines = data.toString().split('\n').filter((line: string) => line.trim());

            lines.forEach((line: string) => {
                try {
                    const response = JSON.parse(line);
                    
                    if (response.id && this.requestQueue.has(response.id)) {
                        const callback = this.requestQueue.get(response.id)!;
                        this.requestQueue.delete(response.id);
                        callback(response);
                    }
                } catch (e) {
                    console.error("[IA] Erro ao parsear resposta:", e);
                }
            });
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
                if (!response.success && response.error) {
                    reject(new Error(response.error));
                } else {
                    resolve(response);
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
    async detectEmotion(imageBuffer: Buffer): Promise<EmotionDetectionResult> {
        if (!this.isInitialized) {
            throw new Error("Detector não inicializado. Chame initialize() primeiro.");
        }

        if (!imageBuffer || imageBuffer.length === 0) {
            return {
                success: false,
                faces: [],
                message: "Buffer de imagem inválido"
            };
        }

        try {
            // Converte para base64
            const base64Image = imageBuffer.toString('base64');
            
            // Envia para Python
            const response = await this.sendCommand({
                command: 'detect',
                image: base64Image
            });

            // Log resumido
            if (response.success && response.faces && response.faces.length > 0) {
                console.log(`[IA] ${response.faces.length} face(s) detectada(s)`);
                response.faces.forEach((face: any) => {
                    const emotion = face.dominantEmotion;
                    const secondary = face.secondaryEmotion;
                    console.log(`  Face ${face.faceIndex}: ${emotion.emotion} (${(emotion.confidence * 100).toFixed(1)}%)`);
                    if (secondary && secondary.confidence > 0.2) {
                        console.log(`    Secundária: ${secondary.emotion} (${(secondary.confidence * 100).toFixed(1)}%)`);
                    }
                });
                
                if (response.summary) {
                    console.log(`  Emoção geral: ${response.summary.dominantEmotion}`);
                }
            } else if (!response.success) {
                console.error(`[IA] Erro na detecção: ${response.error || 'Desconhecido'}`);
            } else {
                console.log("[IA] Nenhuma face detectada");
            }

            return response;
            
        } catch (error) {
            console.error("[IA] Erro na detecção:", error);
            return {
                success: false,
                faces: [],
                error: error instanceof Error ? error.message : String(error)
            };
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
     * Obtém status detalhado do detector
     */
    async getStatus(): Promise<any> {
        try {
            return await this.sendCommand({ command: 'ping' });
        } catch (error) {
            return {
                status: 'error',
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    /**
     * Finaliza o processo Python
     */
    dispose(): void {
        if (this.pythonProcess) {
            console.log("[IA] Finalizando processo Python...");
            
            // Tenta enviar comando de saída
            if (this.isInitialized) {
                this.pythonProcess.stdin!.write(JSON.stringify({ command: 'exit' }) + '\n');
            }
            
            // Aguarda um pouco e força saída
            setTimeout(() => {
                if (this.pythonProcess) {
                    this.pythonProcess.kill();
                }
            }, 1000);
            
            this.pythonProcess = null;
            this.isInitialized = false;
            this.requestQueue.clear();
            console.log("[IA] Processo finalizado");
        }
    }
}

// ============================================
// TIPOS
// ============================================

export interface EmotionScore {
    emotion: string;
    confidence: number;
}

export interface Face {
    faceIndex: number;
    boundingBox: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    emotions: EmotionScore[];
    dominantEmotion: EmotionScore;
    secondaryEmotion?: EmotionScore;
    faceConfidence: number;
    emotionIntensity: number;
}

export interface EmotionDetectionResult {
    success: boolean;
    faces: Face[];
    message?: string;
    error?: string;
    summary?: {
        totalFaces: number;
        dominantEmotion: string;
        emotionDistribution: Record<string, number>;
        averageFaceConfidence: number;
    };
}

// ============================================
// EXEMPLO DE USO COMPLETO
// ============================================

async function example() {
    const detector = new EmotionDetector();
    
    try {
        console.log('\n' + '='.repeat(50));
        console.log('   SISTEMA DE DETECÇÃO DE EMOÇÕES');
        console.log('='.repeat(50));
        
        // Inicializa (com instalação automática opcional)
        console.log('\n📋 Inicializando detector...');
        await detector.initialize(false); // mude para true para instalar deps automaticamente
        
        // Verifica status
        const status = await detector.getStatus();
        console.log('\n📊 Status do sistema:');
        console.log(`   Detector: ${status.detector}`);
        console.log(`   Emoções suportadas: ${status.capabilities.emotions.join(', ')}`);
        
        console.log('\n🏓 Testando conexão...');
        const isAlive = await detector.ping();
        console.log(`   Python processo: ${isAlive ? '✅ Ativo' : '❌ Inativo'}`);
        
        console.log('\n✅ Sistema inicializado com sucesso!');
        console.log('💡 Para usar o detector, chame detector.detectEmotion(imageBuffer)');
        
        /* Para testar com uma imagem real, descomente:
        // Carrega imagem de teste
        console.log('\n🖼️  Carregando imagem...');
        const imageBuffer = fs.readFileSync('./test_image.jpg');
        console.log(`   Tamanho: ${(imageBuffer.length / 1024).toFixed(2)} KB`);
        
        // Detecta emoções
        console.log('\n🔍 Analisando emoções...');
        const result = await detector.detectEmotion(imageBuffer);
        
        if (result.success && result.faces.length > 0) {
            console.log('\n✅ Análise concluída!');
            console.log('─'.repeat(50));
            
            // Mostra resultados por face
            result.faces.forEach(face => {
                console.log(`\n👤 Face ${face.faceIndex + 1}:`);
                console.log(`   Posição: (${face.boundingBox.x}, ${face.boundingBox.y})`);
                console.log(`   Tamanho: ${face.boundingBox.width}x${face.boundingBox.height}`);
                console.log(`   Confiança da detecção: ${(face.faceConfidence * 100).toFixed(1)}%`);
                console.log(`\n   Emoções detectadas:`);
                
                // Top 3 emoções
                face.emotions.slice(0, 3).forEach((e, i) => {
                    const bar = '█'.repeat(Math.round(e.confidence * 20));
                    const emoji = getEmoji(e.emotion);
                    console.log(`   ${i + 1}. ${emoji} ${e.emotion.padEnd(10)} ${bar} ${(e.confidence * 100).toFixed(1)}%`);
                });
                
                if (face.secondaryEmotion && face.secondaryEmotion.confidence > 0.2) {
                    console.log(`\n   💭 Emoção secundária: ${face.secondaryEmotion.emotion}`);
                }
            });
            
            // Mostra resumo se disponível
            if (result.summary) {
                console.log('\n' + '─'.repeat(50));
                console.log('📈 RESUMO GERAL:');
                console.log(`   Total de faces: ${result.summary.totalFaces}`);
                console.log(`   Emoção dominante: ${getEmoji(result.summary.dominantEmotion)} ${result.summary.dominantEmotion}`);
                console.log(`   Confiança média: ${(result.summary.averageFaceConfidence * 100).toFixed(1)}%`);
                
                console.log('\n   Distribuição:');
                Object.entries(result.summary.emotionDistribution)
                    .sort(([,a], [,b]) => b - a)
                    .forEach(([emotion, value]) => {
                        const bar = '▫'.repeat(Math.round(value * 10));
                        console.log(`   ${getEmoji(emotion)} ${emotion.padEnd(10)} ${bar} ${(value * 100).toFixed(1)}%`);
                    });
            }
        } else {
            console.log('\n⚠️ Nenhuma face detectada na imagem');
            if (result.error) {
                console.log(`   Erro: ${result.error}`);
            }
        }
        */
        
    } catch (error) {
        console.error('\n❌ Erro:', error);
        console.log('\n💡 Dicas:');
        console.log('   1. Certifique-se de ter Python 3 instalado');
        console.log('   2. Instale as dependências: pip install fer tensorflow opencv-python');
        console.log('   3. Verifique se o arquivo test_image.jpg existe');
    } finally {
        // Limpa recursos
        console.log('\n🧹 Finalizando...');
        detector.dispose();
        console.log('👋 Processo encerrado\n');
    }
}

// Helper para emojis
function getEmoji(emotion: string): string {
    const emojis: Record<string, string> = {
        'happy': '😊',
        'sad': '😢',
        'angry': '😠',
        'fear': '😨',
        'fearful': '😨',
        'disgust': '🤢',
        'disgusted': '🤢',
        'surprise': '😲',
        'surprised': '😲',
        'neutral': '😐'
    };
    return emojis[emotion.toLowerCase()] || '🎭';
}

// ============================================
// EXPORTAÇÕES
// ============================================

export default EmotionDetector;

// Se executado diretamente, roda o exemplo
if (require.main === module) {
    example().catch(console.error);
}