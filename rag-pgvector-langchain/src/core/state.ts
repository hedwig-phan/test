import { Ollama, OllamaEmbeddings } from "@langchain/ollama";
class State {
    public prompt: string;
    public promptEmbedding: number[];
    public response: string;
    public embeddings: OllamaEmbeddings;

    constructor(prompt: string, response: string, embeddings: OllamaEmbeddings, promptEmbedding: number[]) {
        this.prompt = prompt;
        this.response = response;
        this.embeddings = embeddings;
        this.promptEmbedding = promptEmbedding;
    }
}

export { State };