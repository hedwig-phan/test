// Application-level utilities - service-specific operations
import { AiUtils } from '../../core/utils/ai.utils';

export class AiServiceUtils {
    static async processPrompt(prompt: string) {
        if (!AiUtils.validatePrompt(prompt)) {
            throw new Error('Invalid prompt');
        }
        
        const sanitizedPrompt = AiUtils.sanitizePrompt(prompt);
        return sanitizedPrompt;
    }

    static handleError(error: unknown): Error {
        if (error instanceof Error) {
            return new Error(`AI Service Error: ${error.message}`);
        }
        return new Error('Unknown AI Service Error');
    }
} 