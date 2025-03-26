import { Client } from "pg";
import dotenv from 'dotenv';
import pgvector from 'pgvector/pg';
import { State } from "./state";

dotenv.config();

class PgVectorDatabase {
    private client: Client;
    constructor( client: Client) {
        pgvector.registerType(client);
        this.client = client;
    }

    async retrieve(state: { question: string, context: any[], answer: string }): Promise<{ context: any[] }> {
        const queryVector = this.convertQuestionToVector(state.question);
        const query = `
            SELECT id, document
            FROM vectors
            ORDER BY vector <-> $1
            LIMIT 10;
        `;
        const values = [queryVector];

        try {
            const res = await this.client.query(query, values);
            const retrievedDocs = res.rows.map(row => row.document);
            return { context: retrievedDocs };
        } catch (err) {
            console.error('Error executing vector search:', err);
            throw err;
        }
    }

    private convertQuestionToVector(question: string): number[] {
        // Implement your logic to convert a question to a vector
        // This is a placeholder and should be replaced with actual logic
        return [];
    }
}

export {PgVectorDatabase };