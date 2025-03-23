import { Express, Router } from 'express';
import { HelloController } from '../../adapters/controllers/hello.controller';
import { HelloUseCase } from '../../application/use-cases/hello.use-case';
import { HelloRepository } from '../../adapters/repositories/hello.repository';
import { AiController } from '../../adapters/controllers/ai.controller';
import { AiUseCase } from '../../application/use-cases/ai.use-case';
import { RedisClient } from '../config/redis';
import config from '../config/config';
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

export const helloRoutes = (app: Express) => {
  const helloRepository = new HelloRepository(RedisClient);
  const helloUseCase = new HelloUseCase(helloRepository);
  const helloController = new HelloController(helloUseCase);

  app.get('/hello', (req, res) => helloController.getHello(req, res));
}; 

export const setupRoutes = (app: Express) => {
    const v1Router = Router();
    
    // AI routes
    const aiUseCase = new AiUseCase(config.OLLAMA_URL, config.OLLAMA_MODEL);
    const aiController = new AiController(aiUseCase);
    v1Router.post('/ai/chat', (req, res) => aiController.getAi(req, res));

    // MCP routes
    // let transport: SSEServerTransport | null = null;
    // v1Router.get("/mcp/sse", (req, res) => {
    //     transport = new SSEServerTransport("/v1/mcp/messages", res);
    //     server.connect(transport);  
    // });

    // v1Router.post("/mcp/messages", (req, res) => {
    //     if (transport) {
    //         transport.handlePostMessage(req, res);
    //     } else {
    //         res.status(400).json({ error: 'Transport not initialized' });
    //     }
    // });

    // Mount all v1 routes
    app.use('/v1', v1Router);
};