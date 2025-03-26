import { Ollama, OllamaEmbeddings } from "@langchain/ollama";
import { PgVectorDatabase } from "./db";
import { State } from "./state";
import dotenv from 'dotenv';

dotenv.config();

class LLMService {
    private llm: Ollama;
    private embeddings: OllamaEmbeddings;

    constructor() {
        this.llm = new Ollama({
            baseUrl: process.env.OLLAMA_URL,
            model: process.env.OLLAMA_MODEL,
        });

        this.embeddings = new OllamaEmbeddings({
            baseUrl: process.env.OLLAMA_URL,
            model: process.env.OLLAMA_MODEL_EMBEDDING,
        });
    }

    async generateResponse(prompt: string): Promise<any> {
        // Uncomment and use this method to generate a response
        return await this.llm.invoke(prompt);
    }

    async retrieveVector(question: string): Promise<number[]> {
        const res = await this.convertQuestionToVector(question)
        return res;
    }

    getEmbeddings(): OllamaEmbeddings {
        return this.embeddings;
    }

    retrieve(state: State) {

        return state;
    }

    private convertQuestionToVector(question: string): Promise<number[]> {
        return this.embeddings.embedQuery(question);
    }
}

export { LLMService };
