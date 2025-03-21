import { Ollama } from "@langchain/ollama";
import { AiUtils } from '../../core/utils/ai.utils';
import { AiServiceUtils } from '../utils/ai.service.utils';

export class AiUseCase {
    constructor(private url: string, private model: string) {}

    async generateText(prompt: string) {
        try {
            const processedPrompt = await AiServiceUtils.processPrompt(prompt);

            console.log('Received prompt:', processedPrompt);
            console.log('Using model:', this.model);
            console.log('Ollama URL:', this.url);

            const model = new Ollama({
                baseUrl: this.url,
                model: this.model,
            });

            const response = await model.invoke(processedPrompt);
            console.log('AI Response:', response);
            
            return AiUtils.formatAiResponse(response);
        } catch (error) {
            throw AiServiceUtils.handleError(error);
        }
    }
}