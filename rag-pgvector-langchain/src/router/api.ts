import { LLMService } from '../core/llm';
import { PgVectorDatabase } from '../core/db';
import { StoringVectorService } from '../service/storing _vector';
import { LineListOutputParser } from '../service/output_parser';
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";

import express from 'express';
export const createApp = (pgvector: PgVectorDatabase) => {
    const app = express();
    const lineOutputParser = new LineListOutputParser();
    const llmService = new LLMService(pgvector, lineOutputParser);
    const storingVectorService = new StoringVectorService(pgvector, llmService);
    
    app.use(express.json());

    // generate response from llm with rag
    app.get('/generate-response', async (req, res) => {
        try {
            const { prompt } = req.body;
            const response = await llmService.processQuestion(prompt);
            res.json({ response });
        } catch (error) {
            res.status(500).json({ error: 'Failed to generate response' });
        }
    });

    // retrieve vectorize of prompt
    app.get('/retrieve-vector', async (req, res) => {
        const { prompt } = req.body;
        const vector = await llmService.retrieveVector(prompt);
        res.json({ vector });
    });

    // get infor of embedding model
    app.get('/embeddings', async (req, res) => {
        try {
            const embeddings = await llmService.getEmbeddingInfor();
            res.json({ embeddings });
        } catch (error) {
            res.status(500).json({ error: 'Failed to retrieve embeddings' });
        }
    });

    // retrieve similarity of prompt
    app.get('/retrieve-similarity', async (req, res) => {
        const { prompt } = req.body;
        const result = await llmService.retrieveSimilarity(prompt);
        res.json({ result });
    });

    // store invoice vector
    app.post('/store-invoice-vector', async (req, res) => {
        const { invoiceId } = req.body;
        const result = await storingVectorService.storeInvoiceToVector(invoiceId);
        res.json({ result });
    });

    // store all invoice vector
    app.post('/store-all-invoice-vector', async (req, res) => {
        const result = await storingVectorService.storeInvoicesToVector();
        res.json({ result });
    });

    // store all invoice vector in invoices table
    app.get('/store-all-invoice-vector-invoices-table', async (req, res) => {
        const result = await storingVectorService.storeInvoicesToVectorInvoicesTable();
        res.json({ result });
    });

    return app;
}