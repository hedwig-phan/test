// Core AI utilities - business logic specific to AI operations
export class AiUtils {
    static validatePrompt(prompt: string): boolean {
        return Boolean(prompt && prompt.trim().length > 0);
    }

    static sanitizePrompt(prompt: string): string {
        return prompt.trim();
    }

    static formatAiResponse(response: any) {
        return {
            text: response,
            timestamp: new Date().toISOString(),
            model: "qwen2.5-coder:0.5b"
        };
    }
} 