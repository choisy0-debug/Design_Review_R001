/**
 * Ollama API Service for Design Review R001
 */

const OLLAMA_BASE_URL = 'http://localhost:11434';

const OllamaAPI = {
    /**
     * Fetch list of available models
     */
    async getModels() {
        try {
            const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
            if (!response.ok) throw new Error('Ollama not responding');
            const data = await response.json();
            return data.models || [];
        } catch (error) {
            console.error('Failed to fetch models:', error);
            return null;
        }
    },

    /**
     * Send chat request to Ollama
     * @param {string} model Model name
     * @param {Array} messages Chat history
     * @param {Function} onChunk Callback for streaming chunks
     */
    async chat(model, messages, onChunk) {
        try {
            const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: model,
                    messages: messages,
                    stream: true
                })
            });

            if (!response.ok) throw new Error('Chat request failed');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const json = JSON.parse(line);
                        if (json.message && json.message.content) {
                            onChunk(json.message.content);
                        }
                        if (json.done) return;
                    } catch (e) {
                        console.error('Error parsing chunk:', e);
                    }
                }
            }
        } catch (error) {
            console.error('Chat error:', error);
            throw error;
        }
    }
};

window.OllamaAPI = OllamaAPI;
