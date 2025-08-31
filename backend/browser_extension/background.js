let socket;
const WEBSOCKET_URL = 'ws://localhost:8080';

// Ouve as mensagens do popup (cliques no botão)
chrome.runtime.onMessage.addListener((request) => {
    if (request.action === 'startStream') {
        startStreaming();
    } else if (request.action === 'stopStream') {
        stopStreaming();
    }
});

// Ouve as mensagens do Offscreen Document (frames de vídeo)
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'videoFrame') {
        // Retransmite o frame para o backend via WebSocket
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(message.data);
        }
    } else if (message.action === 'captureError') {
        console.error('Erro na captura do Offscreen Document:', message.error);
        stopStreaming();
    }
});

async function startStreaming() {
    console.log('[Background] Iniciando transmissão...');
    // Cria o documento invisível que irá de fato acessar a câmera
    await setupOffscreenDocument('offscreen.html');
    // Envia uma mensagem para o documento invisível para ele começar a capturar
    chrome.runtime.sendMessage({ target: 'offscreen', action: 'startCapture' });
    // Inicia a conexão com o nosso backend
    setupWebSocket();
}

async function stopStreaming() {
    console.log('[Background] Parando transmissão...');
    if (socket) socket.close();
    socket = null;
    // Fecha o documento invisível para desligar a câmera
    if (await chrome.offscreen.hasDocument()) {
        await chrome.offscreen.closeDocument();
    }
}

function setupWebSocket() {
    socket = new WebSocket(WEBSOCKET_URL);
    socket.onopen = () => console.log('[Background] Conectado ao servidor WebSocket do backend!');
    socket.onclose = () => {
        console.log('[Background] Conexão WebSocket fechada.');
        stopStreaming();
        chrome.storage.local.set({ isStreaming: false });
    };
    socket.onerror = (err) => console.error('[Background] Erro no WebSocket:', err);
}

// --- Gerenciamento do Offscreen Document ---
let creating; 
async function setupOffscreenDocument(path) {
    const offscreenUrl = chrome.runtime.getURL(path);
    const existingContexts = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT'],
        documentUrls: [offscreenUrl]
    });

    if (existingContexts.length > 0) return;

    if (creating) {
        await creating;
    } else {
        creating = chrome.offscreen.createDocument({
            url: path,
            reasons: ['USER_MEDIA'],
            justification: 'Capturar a aba para análise de emoções.'
        });
        await creating;
        creating = null;
    }
}

