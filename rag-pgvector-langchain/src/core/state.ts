import { Ollama, OllamaEmbeddings } from "@langchain/ollama";
import { AzureOpenAIEmbeddings } from "@langchain/openai";

class State {
    public prompt: string;
    public promptEmbedding: number[];
    public response: string;
    public embeddings: AzureOpenAIEmbeddings;

    constructor(prompt: string, response: string, embeddings: AzureOpenAIEmbeddings, promptEmbedding: number[]) {
        this.prompt = prompt;
        this.response = response;
        this.embeddings = embeddings;
        this.promptEmbedding = promptEmbedding;
    }
}

export { State };