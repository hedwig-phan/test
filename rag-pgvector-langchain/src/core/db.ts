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

    //Retrieve context from db
    async retrieve(state: State): Promise<{ context: any[] }> {
        const queryVector = state.promptEmbedding;
        const query = `
            SELECT invoices.id, invoices."invoiceName", invoices."serviceFromDate", invoices."serviceToDate", invoices."description", invoices."status", invoices."currency", invoices."billableManMonth", invoices."rateCard", invoices."totalAmount", invoices."discount", invoices."invoiceAmount", invoices."serviceProvider", invoices."buyerName", invoices."billingEmailAddress", invoices."billingAttention", invoices."purchaseOrder", invoices."paymentTerm", invoices."paymentTermType", invoices."dueDate", invoices."paidAmount", invoices."paidDate", invoices."remainAmount"
            FROM invoice_info_vectors
            JOIN invoices
                ON invoice_info_vectors.invoice_id = invoices.id
            ORDER BY invoice_info_vectors.vector <-> $1::vector
            LIMIT 10;
        `;

        const queryVectorString = JSON.stringify(queryVector);
        const values = [queryVectorString];
    
        try {
            const res = await this.client.query(query, values);
            return { context: res.rows };
        } catch (err) {
            console.error('Error executing vector search:', err);
            throw err;
        }
    }

    //Get Client 
    getClient(): Client {
        return this.client;
    }
}

export {PgVectorDatabase };