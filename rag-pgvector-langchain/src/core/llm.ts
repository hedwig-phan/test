import { Ollama, OllamaEmbeddings } from "@langchain/ollama";
import { PgVectorDatabase } from "./db";
import { State } from "./state";
import dotenv from 'dotenv';

dotenv.config();

class LLMService {
    private llm: Ollama;
    private embeddings: OllamaEmbeddings;
    public db: PgVectorDatabase;
    //Constructor
    constructor(db: PgVectorDatabase) {
        this.llm = new Ollama({
            baseUrl: process.env.OLLAMA_URL,
            model: process.env.OLLAMA_MODEL,
        });

        this.embeddings = new OllamaEmbeddings({
            baseUrl: process.env.OLLAMA_URL,
            model: process.env.OLLAMA_MODEL_EMBEDDING,
        });

        this.db = db;
    }


    //Generate response from llm chat bot
    async generateResponse(prompt: string): Promise<any> {
        // Uncomment and use this method to generate a response
        return await this.llm.invoke(prompt);
    }

    //Retrieve vector from embeddings
    async retrieveVector(question: string): Promise<number[]> {
        const res = await this.convertStringToVector(question)
        return res;
    }


    //Get embeddings info
    async getEmbeddingInfor(): Promise<OllamaEmbeddings> {
        return this.embeddings;
    }

    //Retrieve similarity from embeddings
    async retrieveSimilarity(prompt: string) : Promise<{ context: any[] }>{
        
        //Convert question to vector
        let promptEmbedding = await this.convertStringToVector(prompt);

        //Create state
        let state = new State(prompt, "", this.embeddings, promptEmbedding);

        //Retrieve context from db
        const context = await this.db.retrieve(state);
        return context;
    }


    //Convert question to vector
    async convertStringToVector(question: string): Promise<number[]> {
        return this.embeddings.embedQuery(question);
    }

    //Convert document  to vector
    async convertDocumentToVector(document: string[]): Promise<number[][]> {
        return this.embeddings.embedDocuments(document);
    }
}

export { LLMService };
