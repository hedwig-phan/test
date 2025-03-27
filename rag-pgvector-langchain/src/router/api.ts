import { LLMService } from '../core/llm';
import { PgVectorDatabase } from '../core/db';
import { StoringVectorService } from '../service/storing _vector';
import express from 'express';
export const createApp = (pgvector: PgVectorDatabase) => {
    const app = express();
    const llmService = new LLMService(pgvector);
    const storingVectorService = new StoringVectorService(pgvector, llmService);
    
    app.use(express.json());

    app.get('/generate-response', async (req, res) => {
        try {
            const { prompt } = req.body;
            const response = await llmService.generateResponse(prompt);
            res.json({ response });
        } catch (error) {
            res.status(500).json({ error: 'Failed to generate response' });
        }
    });

    app.get('/embeddings', (req, res) => {
        try {
            const embeddings = llmService.getEmbeddingInfor();
            res.json({ embeddings });
        } catch (error) {
            res.status(500).json({ error: 'Failed to retrieve embeddings' });
        }
    });

    app.get('/retrieve-vector', async (req, res) => {
        const { question } = req.body;
        const vector = await llmService.retrieveVector(question);
        res.json({ vector });
    });

    app.get('/retrieve-similarity', async (req, res) => {
        const { prompt } = req.body;
        const result = await llmService.retrieveSimilarity(prompt);
        res.json({ result });
    });

    app.post('/store-invoice-vector', async (req, res) => {
        const { invoiceId } = req.body;
        const result = await storingVectorService.storeInvoiceToVector(invoiceId);
        res.json({ result });
    });

    app.post('/store-all-invoice-vector', async (req, res) => {
        const result = await storingVectorService.storeInvoicesToVector();
        res.json({ result });
    });

    return app;
}