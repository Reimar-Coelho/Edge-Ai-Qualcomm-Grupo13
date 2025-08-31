#!/usr/bin/env python3
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
    print("\n🔍 Verificando instalação...")
    
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
            print("\n🎉 Sistema pronto para uso!")
        else:
            print("\n⚠️ Instalação concluída mas verificação falhou")
    else:
        print("\n❌ Falha na instalação")
        sys.exit(1)
