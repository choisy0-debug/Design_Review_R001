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

    let currentModel = '';
    let chatHistory = [];

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
            modelSelect.innerHTML = '<option value="">No models found</option>';
            statusDot.style.background = '#ff4444'; // Error
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

            await window.OllamaAPI.chat(currentModel, apiHistory, (chunk) => {
                aiMsgDiv.classList.remove('loading-dots');
                fullResponse += chunk;
                aiMsgDiv.textContent = fullResponse;
                chatBox.scrollTop = chatBox.scrollHeight;
            });

            chatHistory.push({ role: 'assistant', content: fullResponse });

            // Update Review Panel if it looks like a verification result
            if (fullResponse.length > 50) {
                aiFeedback.innerHTML = fullResponse.replace(/\n/g, '<br>');
            }

        } catch (error) {
            aiMsgDiv.textContent = 'Ollama와 통신하는 중 오류가 발생했습니다. 로컬 서버가 실행 중인지 확인해 주세요.';
            aiMsgDiv.style.color = '#ff4444';
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

    // Editable Original Text
    originalText.setAttribute('contenteditable', 'true');
    originalText.addEventListener('blur', () => {
        console.log('Target content updated');
    });

    // Start initialization
    initModels();
});
