import { Express, Router } from 'express';
import { HelloController } from '../../adapters/controllers/hello.controller';
import { HelloUseCase } from '../../application/use-cases/hello.use-case';
import { HelloRepository } from '../../adapters/repositories/hello.repository';
import { AiController } from '../../adapters/controllers/ai.controller';
import { AiUseCase } from '../../application/use-cases/ai.use-case';
import { RedisClient } from '../config/redis';

export const helloRoutes = (app: Express) => {
  const helloRepository = new HelloRepository(RedisClient);
  const helloUseCase = new HelloUseCase(helloRepository);
  const helloController = new HelloController(helloUseCase);

  app.get('/hello', (req, res) => helloController.getHello(req, res));
}; 

export const aiRoutes = (app: Express) => {
    const v1Router = Router();
    
    // AI routes
    const aiUseCase = new AiUseCase("http://localhost:11434", "qwen2.5-coder:0.5b");
    const aiController = new AiController(aiUseCase);
    v1Router.get('/ai/chat', (req, res) => aiController.getAi(req, res));

    // Mount all v1 routes
    app.use('/v1', v1Router);
};
