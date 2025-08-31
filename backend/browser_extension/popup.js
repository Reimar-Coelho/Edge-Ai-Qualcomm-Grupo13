const toggleButton = document.getElementById('toggleStream');
const statusDiv = document.getElementById('status');
let isStreaming = false;

// Sincroniza o estado do botão com o que está salvo
chrome.storage.local.get(['isStreaming'], (result) => {
    isStreaming = !!result.isStreaming;
    updateUI();
});

toggleButton.addEventListener('click', () => {
    isStreaming = !isStreaming;
    
    // Envia uma mensagem para o script de background para iniciar ou parar
    chrome.runtime.sendMessage({ action: isStreaming ? 'startStream' : 'stopStream' });

    // Salva o estado e atualiza a UI
    chrome.storage.local.set({ isStreaming });
    updateUI();
});

function updateUI() {
    if (isStreaming) {
        toggleButton.textContent = 'Parar Análise';
        toggleButton.style.backgroundColor = '#DB4437';
        statusDiv.textContent = 'Status: Analisando...';
    } else {
        toggleButton.textContent = 'Iniciar Análise';
        toggleButton.style.backgroundColor = '#4285F4';
        statusDiv.textContent = 'Status: Inativo';
    }
}
