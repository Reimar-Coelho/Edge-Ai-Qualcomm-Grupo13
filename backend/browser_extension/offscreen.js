// Este script ouve uma mensagem do background, inicia a captura da aba,
// e começa a enviar os frames de vídeo de volta para o background.

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.target === 'offscreen' && message.action === 'startCapture') {
    startCapture();
  }
});

async function startCapture() {
  let stream;
  try {
    // MUDANÇA PRINCIPAL: Troca getUserMedia por getDisplayMedia para capturar a aba.
    stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        // Pede que o navegador sugira a aba atual, tornando mais fácil para o usuário.
        displaySurface: "browser",
      },
      audio: false // Não precisamos do áudio para a análise de emoções.
    });
    
    const videoElement = document.createElement('video');
    videoElement.srcObject = stream;
    videoElement.muted = true;
    videoElement.play();

    const canvas = new OffscreenCanvas(640, 480);
    const canvasContext = canvas.getContext('2d');

    videoElement.onloadedmetadata = () => {
      const intervalId = setInterval(() => {
        // Para o intervalo se o compartilhamento de tela for interrompido pelo usuário
        if (!stream.active) {
          clearInterval(intervalId);
          // Informa ao background para parar tudo
          chrome.runtime.sendMessage({ action: 'captureError', error: 'O compartilhamento de tela foi interrompido.' });
          return;
        }

        canvasContext.drawImage(videoElement, 0, 0, 640, 480);
        canvas.convertToBlob({ type: 'image/png' }).then(blob => {
          const reader = new FileReader();
          reader.onload = () => {
            // Envia o frame de volta para o background.js
            chrome.runtime.sendMessage({ action: 'videoFrame', data: reader.result });
          };
          reader.readAsDataURL(blob);
        });
      }, 2000);
    };
  } catch (error) {
    console.error('[Offscreen] Erro ao capturar:', error);
    // Informa ao background que algo deu errado
    chrome.runtime.sendMessage({ action: 'captureError', error: error.message });
    // Garante que a stream seja parada em caso de erro
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
  }
}

