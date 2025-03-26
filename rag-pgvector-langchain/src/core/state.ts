import { Ollama, OllamaEmbeddings } from "@langchain/ollama";
class State {
    private prompt: string;
    private response: string;
    private embeddings: OllamaEmbeddings;

    constructor(prompt: string, response: string, embeddings: OllamaEmbeddings) {
        this.prompt = prompt;
        this.response = response;
        this.embeddings = embeddings;
    }
}

export { State };