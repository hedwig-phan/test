import { Ollama } from "@langchain/ollama";

export class AiUseCase {
    constructor(private url: string, private model: string) {}

    async generateText(prompt: string) {
        try {
            if (!prompt || prompt.trim() === '') {
                throw new Error('Empty prompt provided');
            }

            console.log('Received prompt:', prompt);
            console.log('Using model:', this.model);
            console.log('Ollama URL:', this.url);

            const model = new Ollama({
                baseUrl: this.url,
                model: this.model,
            });

            const response = await model.invoke(prompt);
            console.log('AI Response:', response);
            return response;
            
        } catch (error) {
            console.error('Ollama API Error:', error);
            if (error instanceof Error) {
                throw new Error(`AI generation failed: ${error.message}`);
            }
            throw new Error('AI generation failed: Unknown error');
        }
    }
}