import { Ollama, OllamaEmbeddings } from "@langchain/ollama";
import { DefaultAzureCredential, getBearerTokenProvider } from '@azure/identity';
import { AzureOpenAI, AzureOpenAIEmbeddings } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { PgVectorDatabase } from "./db";
import { DistanceStrategy, PGVectorStore, PGVectorStoreArgs } from "@langchain/community/vectorstores/pgvector";
import { State } from "./state";
import dotenv from 'dotenv';
import { IOutputParser } from "../service/output_parser";
import { MultiQueryRetriever } from "langchain/retrievers/multi_query";
import { DocumentInterface } from "@langchain/core/documents";
import { Annotation, StateGraph } from "@langchain/langgraph";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { pull } from "langchain/hub";

dotenv.config();

const QUERY_PROMPT = new PromptTemplate({
    inputVariables: ["question"],
    template: `You are an AI language model assistant. Your task is to generate five 
    different versions of the given user question to retrieve relevant documents from a vector 
    database. By generating multiple perspectives on the user question, your goal is to help
    the user overcome some of the limitations of the distance-based similarity search. 
    Provide these alternative questions separated by newlines.
    Original question: {question}`,
});



class LLMService {
    public db: PgVectorDatabase;

    // private llm: Ollama;
    private llm: AzureOpenAI;
    private embeddings: AzureOpenAIEmbeddings;
    private vectorStore: PGVectorStore;
    private outputParser: IOutputParser; // Use the interface type

    //Constructor
    constructor(db: PgVectorDatabase, outputParser: IOutputParser) {

        // //Initialize OLLAMA llm
        // this.llm = new Ollama({
        //     baseUrl: process.env.OLLAMA_URL,
        //     model: process.env.OLLAMA_MODEL,
        // });

        //Initialize embeddings
        // this.embeddings = new OllamaEmbeddings({
        //     baseUrl: process.env.OLLAMA_URL,
        //     model: process.env.OLLAMA_MODEL_EMBEDDING,
        // });

    

        const credentials = new DefaultAzureCredential();
        const azureADTokenProvider = getBearerTokenProvider(
            credentials,
            "https://cognitiveservices.azure.com/.default"
        );


        this.llm = new AzureOpenAI({
            azureADTokenProvider,
            azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
            azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
            azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
            model: process.env.AZURE_OPENAI_AI_MODEL,
            temperature: 0,
            maxTokens: undefined,
            timeout: undefined,
            maxRetries: 2,
        });

        this.embeddings = new AzureOpenAIEmbeddings({
            azureADTokenProvider,
            azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
            azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
            azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
            azureOpenAIApiEmbeddingsDeploymentName: process.env.AZURE_OPENAI_API_EMBEDDING_DEPLOYMENT_NAME
        });


    
        //Initialize output parser
        this.outputParser = outputParser;

        //Initialize db 
        this.db = db;


        //Initialize vector store
        let vectorStoreArgs: PGVectorStoreArgs = {
            postgresConnectionOptions: {
                connectionString: process.env.DATABASE_URL,
            },
            tableName: "invoices",
            schemaName: "public",
            columns: {
                idColumnName: "id",
                vectorColumnName: "vector",
            },
            distanceStrategy: "cosine" as DistanceStrategy
        };

        this.vectorStore = new PGVectorStore(this.embeddings, vectorStoreArgs);
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

    //Process question
    async processQuestion(question: string) {
        try {
            const promptTemplate = await pull<ChatPromptTemplate>("rlm/rag-prompt");

            const InputStateAnnotation = Annotation.Root({
                question: Annotation<string>,
            });

            const StateAnnotation = Annotation.Root({
                question: Annotation<string>,
                context: Annotation<any[]>,
                answer: Annotation<string>,
            });

            const retrieve = async (state: typeof InputStateAnnotation.State) => {
                //Convert question to vector
                let promptEmbedding = await this.convertStringToVector(state.question);

                //Create state
                let states = new State(state.question, "", this.embeddings, promptEmbedding);
                const retrievedRows = await this.db.retrieve(states);
                return { context: retrievedRows.context };
            };

            const generate = async (state: typeof StateAnnotation.State) => {
                const rowsContent = state.context.map((row: any) => JSON.stringify(row)).join("\n");
                const messages = await promptTemplate.invoke({ question: state.question, context: rowsContent });
                const response = await this.llm.invoke(messages);
                return { answer: response };
            };

            // Compile application and test
            const graph = new StateGraph(StateAnnotation)
                .addNode("retrieve", retrieve)
                .addNode("generate", generate)
                .addEdge("__start__", "retrieve")
                .addEdge("retrieve", "generate")
                .addEdge("generate", "__end__")
                .compile();

            let inputs = { question: question };
            const result = await graph.invoke(inputs);

            return result.answer;

            // //Initialize retriever_from_llm
            // let retriever_from_llm = MultiQueryRetriever.fromLLM({     
            //     retriever: this.vectorStore.asRetriever(),
            //     llm: this.llm,
            //     verbose: true, //log
            // });
            
            // const prompt = await QUERY_PROMPT.format({ question });

            // const llmResponse = await retriever_from_llm.invoke(prompt);

            // // const parsedOutput = await this.outputParser.parse(llmResponse);

            // return llmResponse;

        } catch (error) {
            console.error("Error processing question:", error);
            throw error;
        }
    }


    //Get embeddings info
    async getEmbeddingInfor(): Promise<AzureOpenAIEmbeddings> {
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
