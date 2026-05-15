/**
 * DESIGN REVIEW R001 V3.0
 */

document.addEventListener('DOMContentLoaded', () => {
    const perfBarFill = document.getElementById('perf-bar-fill');
    const perfStatusText = document.getElementById('perf-status-text');
    const modelSelect = document.getElementById('model-select');
    const connDot = document.getElementById('conn-dot');
    const errorOverlay = document.getElementById('error-overlay');
    const copyCorsBtn = document.getElementById('copy-cors-btn');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const chatBox = document.getElementById('chat-box');

    let currentLevel = 3;
    const configs = {
        1: { name: 'ECO MODE', width: '20%', gpu: 5, vram: 1, mem: 2 },
        2: { name: 'BALANCED', width: '40%', gpu: 20, vram: 3, mem: 5 },
        3: { name: 'POWER HIGH', width: '60%', gpu: 50, vram: 7, mem: 10 },
        4: { name: 'ULTRA SPEC', width: '80%', gpu: 80, vram: 12, mem: 18 },
        5: { name: 'OVERCLOCK', width: '100%', gpu: 98, vram: 22, mem: 32 }
    };

    // Performance Bar Interaction
    document.querySelectorAll('.perf-node').forEach(node => {
        node.addEventListener('click', () => {
            currentLevel = node.dataset.level;
            const config = configs[currentLevel];
            perfBarFill.style.width = config.width;
            perfStatusText.textContent = `${config.name} (L${currentLevel})`;
            updateResources(config);
        });
    });

    function updateResources(config) {
        document.getElementById('gpu-bar').style.width = config.gpu + '%';
        document.getElementById('vram-bar').style.width = (config.vram / 24 * 100) + '%';
        document.getElementById('mem-bar').style.width = (config.mem / 64 * 100) + '%';
    }

    // Ollama Logic
    async function checkConnection() {
        const models = await window.OllamaAPI.getModels();
        if (models && models.length > 0) {
            modelSelect.innerHTML = models.map(m => `<option value="${m.name}">${m.name}</option>`).join('');
            connDot.style.background = '#00ff88';
            errorOverlay.style.display = 'none';
        } else {
            errorOverlay.style.display = 'flex';
            connDot.style.background = '#ff0044';
        }
    }

    copyCorsBtn.addEventListener('click', () => {
        navigator.clipboard.writeText('setx OLLAMA_ORIGINS "*"');
        alert('명령어가 복사되었습니다! 터미널(PowerShell)에 붙여넣고 Ollama를 재시작하세요.');
    });

    sendBtn.addEventListener('click', async () => {
        const text = userInput.value.trim();
        if (!text) return;

        userInput.value = '';
        const userMsg = document.createElement('div');
        userMsg.style.textAlign = 'right';
        userMsg.style.padding = '10px';
        userMsg.style.background = 'rgba(255,255,255,0.1)';
        userMsg.style.margin = '5px 0';
        userMsg.style.borderRadius = '5px';
        userMsg.textContent = text;
        chatBox.appendChild(userMsg);

        const aiMsg = document.createElement('div');
        aiMsg.style.padding = '10px';
        aiMsg.style.margin = '5px 0';
        aiMsg.style.background = 'rgba(0,255,136,0.1)';
        aiMsg.style.borderRadius = '5px';
        aiMsg.textContent = 'Thinking...';
        chatBox.appendChild(aiMsg);

        try {
            let full = '';
            await window.OllamaAPI.chat(modelSelect.value, [{role:'user', content:text}], {}, (chunk) => {
                full += chunk;
                aiMsg.textContent = full;
                chatBox.scrollTop = chatBox.scrollHeight;
            });
        } catch (e) {
            aiMsg.textContent = 'Connection Error. Please check Ollama.';
        }
    });

    checkConnection();
    updateResources(configs[3]);
});
