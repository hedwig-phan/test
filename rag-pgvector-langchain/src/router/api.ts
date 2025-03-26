import { LLMService } from '../core/llm';
import express from 'express';
export const createApp = () => {
    const app = express();
    const llmService = new LLMService();

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
            const embeddings = llmService.getEmbeddings();
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

    return app;
}