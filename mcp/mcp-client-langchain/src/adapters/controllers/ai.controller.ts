import {AiUseCase} from "../../application/use-cases/ai.use-case";
import { Request, Response } from 'express';

export class AiController {
    constructor(private aiUseCase: AiUseCase) {}

    async getAi(req: Request, res: Response) {
        try {
            if (!req.body.prompt) {
                return res.status(400).json({ error: 'Prompt is required' });
            }

            const response = await this.aiUseCase.generateText(req.body.prompt);
            return res.json({response: response});
        } catch (error) {
            console.error('AI Generation Error:', error);
            return res.status(500).json({ 
                error: 'Failed to generate AI response',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}