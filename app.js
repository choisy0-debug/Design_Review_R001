/**
 * Design Review R001 - Main Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const modelSelect = document.getElementById('model-select');
    const statusDot = document.getElementById('connection-status');
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const aiFeedback = document.getElementById('ai-feedback');
    const originalText = document.getElementById('original-text');
    const perfLevel = document.getElementById('perf-level');
    const perfLabel = document.getElementById('perf-label');

    let currentModel = '';
    let chatHistory = [];
    let currentPerfOptions = { num_gpu: 20, num_ctx: 8192, num_thread: 8 };

    // Perf Level Config (Priority: GPU > Memory > CPU)
    const perfConfigs = {
        1: { name: 'Eco', options: { num_gpu: 0, num_ctx: 2048, num_thread: 2 }, metrics: { gpu: 5, vram: 1.2, mem: 2.1, cpu: 15, npu: 2 } },
        2: { name: 'Balanced', options: { num_gpu: 10, num_ctx: 4096, num_thread: 4 }, metrics: { gpu: 25, vram: 3.5, mem: 4.8, cpu: 30, npu: 10 } },
        3: { name: 'Power', options: { num_gpu: 20, num_ctx: 8192, num_thread: 8 }, metrics: { gpu: 55, vram: 6.2, mem: 9.1, cpu: 50, npu: 25 } },
        4: { name: 'Ultra', options: { num_gpu: 35, num_ctx: 16384, num_thread: 12 }, metrics: { gpu: 85, vram: 10.5, mem: 16.2, cpu: 75, npu: 45 } },
        5: { name: 'Overclock', options: { num_gpu: 99, num_ctx: 32768, num_thread: 24 }, metrics: { gpu: 98, vram: 22.1, mem: 31.5, cpu: 95, npu: 80 } }
    };

    function updateResources(metrics, active = false) {
        const boost = active ? 1.2 : 1.0;
        const jitter = () => (Math.random() * 5 - 2.5);

        const gpu = Math.min(100, Math.round(metrics.gpu * boost + jitter()));
        const vram = (metrics.vram * boost + jitter() / 10).toFixed(1);
        const mem = (metrics.mem * boost + jitter() / 10).toFixed(1);
        const cpu = Math.min(100, Math.round(metrics.cpu * boost + jitter()));
        const npu = Math.min(100, Math.round(metrics.npu * boost + jitter()));

        document.getElementById('gpu-val').textContent = gpu + '%';
        document.getElementById('gpu-bar').style.width = gpu + '%';
        
        document.getElementById('vram-val').textContent = vram + 'GB';
        document.getElementById('vram-bar').style.width = Math.min(100, (vram / 24) * 100) + '%';

        document.getElementById('mem-val').textContent = mem + 'GB';
        document.getElementById('mem-bar').style.width = Math.min(100, (mem / 64) * 100) + '%';

        document.getElementById('cpu-val').textContent = cpu + '%';
        document.getElementById('cpu-bar').style.width = cpu + '%';

        document.getElementById('npu-val').textContent = npu + '%';
        document.getElementById('npu-bar').style.width = npu + '%';
    }

    // Initialize Models
    async function initModels() {
        const models = await window.OllamaAPI.getModels();
        
        if (models && models.length > 0) {
            modelSelect.innerHTML = '';
            models.forEach(m => {
                const option = document.createElement('option');
                option.value = m.name;
                option.textContent = m.name;
                modelSelect.appendChild(option);
            });
            currentModel = models[0].name;
            statusDot.style.background = '#00ff00'; // Success
            statusDot.classList.remove('pulse');
        } else {
            modelSelect.innerHTML = '<option value="">Ollama Connection Error</option>';
            statusDot.style.background = '#ff4444'; // Error
            
            // Add a helpful message to the chat box
            addMessage('ai', 'Ollama 모델을 불러올 수 없습니다. 다음 사항을 확인해 주세요:\n\n' +
                '1. Ollama가 실행 중인가요? (http://localhost:11434)\n' +
                '2. CORS 설정이 되어 있나요? (터미널에서 setx OLLAMA_ORIGINS "*" 입력 후 재시작)\n' +
                '3. 설치된 모델이 있나요? (ollama list 명령어로 확인)');
        }
    }

    // Add message to chat box
    function addMessage(role, content) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${role}`;
        msgDiv.textContent = content;
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
        return msgDiv;
    }

    // Handle Send Action
    async function handleSend() {
        const text = userInput.value.trim();
        if (!text || !currentModel) return;

        // Clear input
        userInput.value = '';

        // Add user message to UI and history
        addMessage('user', text);
        chatHistory.push({ role: 'user', content: text });

        // Add AI message placeholder
        const aiMsgDiv = addMessage('ai', '');
        aiMsgDiv.classList.add('loading-dots');

        // Resource boost during active generation
        const currentLevel = perfLevel.value;
        const metricsInterval = setInterval(() => updateResources(perfConfigs[currentLevel].metrics, true), 1000);

        let fullResponse = '';
        
        try {
            // Include context of original text if available
            const contextPrompt = `
Context for review:
${originalText.textContent}

User says: ${text}
            `;

            // We update the history temporarily with context for the API call
            const apiHistory = [...chatHistory];
            apiHistory[apiHistory.length - 1].content = contextPrompt;

            await window.OllamaAPI.chat(currentModel, apiHistory, currentPerfOptions, (chunk) => {
                aiMsgDiv.classList.remove('loading-dots');
                fullResponse += chunk;
                aiMsgDiv.textContent = fullResponse;
                chatBox.scrollTop = chatBox.scrollHeight;
            });

            clearInterval(metricsInterval);
            updateResources(perfConfigs[currentLevel].metrics, false);

            chatHistory.push({ role: 'assistant', content: fullResponse });

            // Update Review Panel if it looks like a verification result
            if (fullResponse.length > 50) {
                aiFeedback.innerHTML = fullResponse.replace(/\n/g, '<br>');
            }

        } catch (error) {
            aiMsgDiv.textContent = 'Ollama와 통신하는 중 오류가 발생했습니다. 로컬 서버가 실행 중인지 확인해 주세요.';
            aiMsgDiv.style.color = '#ff4444';
            clearInterval(metricsInterval);
        }
    }

    // Event Listeners
    sendBtn.addEventListener('click', handleSend);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    modelSelect.addEventListener('change', (e) => {
        currentModel = e.target.value;
        console.log('Model changed to:', currentModel);
    });

    perfLevel.addEventListener('input', (e) => {
        const level = e.target.value;
        const config = perfConfigs[level];
        perfLabel.textContent = config.name + ` (L${level})`;
        currentPerfOptions = config.options;
        updateResources(config.metrics);
        console.log('Performance updated:', config);
    });

    // Initial resource display
    updateResources(perfConfigs[3].metrics);

    // Editable Original Text
    originalText.setAttribute('contenteditable', 'true');
    originalText.addEventListener('blur', () => {
        console.log('Target content updated');
    });

    // Start initialization
    initModels();
});
