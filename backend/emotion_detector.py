#!/usr/bin/env python3
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
                area = box[2] * box[3]
                confidence_score = min(1.0, area / (image_array.shape[0] * image_array.shape[1] * 0.3))
                
                # Ordena emoções por confiança
                sorted_emotions = sorted(
                    emotions.items(), 
                    key=lambda x: x[1], 
                    reverse=True
                )
                
                # Calcula emoção secundária (se houver)
                secondary_emotion = None
                if len(sorted_emotions) > 1 and sorted_emotions[1][1] > 0.1:
                    secondary_emotion = {
                        'emotion': sorted_emotions[1][0],
                        'confidence': sorted_emotions[1][1]
                    }
                
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
                })
            
            # Calcula resumo geral
            all_emotions = {}
            for face in processed_results:
                for emotion in face['emotions']:
                    if emotion['emotion'] not in all_emotions:
                        all_emotions[emotion['emotion']] = []
                    all_emotions[emotion['emotion']].append(emotion['confidence'])
            
            # Média das emoções em todas as faces
            emotion_summary = {
                em: sum(values)/len(values) 
                for em, values in all_emotions.items()
            }
            
            dominant_overall = max(emotion_summary.items(), key=lambda x: x[1])
            
            return {
                "success": True,
                "faces": processed_results,
                "summary": {
                    "totalFaces": len(processed_results),
                    "dominantEmotion": dominant_overall[0],
                    "emotionDistribution": emotion_summary,
                    "averageFaceConfidence": sum(f['faceConfidence'] for f in processed_results) / len(processed_results)
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "faces": []
            }
    
    def process_image(self, base64_image):
        """Processa imagem codificada em base64"""
        try:
            # Decodifica base64
            image_data = base64.b64decode(base64_image)
            image = Image.open(BytesIO(image_data))
            
            # Converte para RGB se necessário
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Converte para array numpy
            image_array = np.array(image)
            
            # Detecta emoções
            results = self.detect_emotions(image_array)
            
            return results
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Erro ao processar imagem: {str(e)}",
                "faces": []
            }
    
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
        }

# ============================================
# LOOP PRINCIPAL
# ============================================

def main():
    """Loop principal do detector"""
    detector = EmotionDetector()
    
    while True:
        try:
            # Lê linha do stdin
            line = sys.stdin.readline()
            if not line:
                break
            
            # Parse do comando JSON
            request = json.loads(line.strip())
            request_id = request.get('id', 'unknown')
            command = request.get('command')
            
            # Processa comando
            if command == 'detect':
                image_data = request.get('image')
                if not image_data:
                    response = {
                        'id': request_id,
                        'success': False,
                        'error': 'Nenhuma imagem fornecida'
                    }
                else:
                    results = detector.process_image(image_data)
                    response = {
                        'id': request_id,
                        **results
                    }
                    
            elif command == 'ping':
                response = {
                    'id': request_id,
                    **detector.get_status()
                }
                
            elif command == 'exit':
                print(json.dumps({
                    'id': request_id,
                    'status': 'goodbye'
                }))
                sys.stdout.flush()
                break
                
            else:
                response = {
                    'id': request_id,
                    'success': False,
                    'error': f'Comando desconhecido: {command}'
                }
            
            # Envia resposta
            print(json.dumps(response))
            sys.stdout.flush()
            
        except json.JSONDecodeError as e:
            print(json.dumps({
                'id': 'error',
                'success': False,
                'error': f'JSON inválido: {str(e)}'
            }))
            sys.stdout.flush()
            
        except KeyboardInterrupt:
            break
            
        except Exception as e:
            print(json.dumps({
                'id': request_id if 'request_id' in locals() else 'error',
                'success': False,
                'error': f'Erro não tratado: {str(e)}',
                'traceback': traceback.format_exc()
            }))
            sys.stdout.flush()

if __name__ == "__main__":
    main()
