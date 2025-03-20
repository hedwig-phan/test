import { Express } from 'express';
import { HelloController } from '../../adapters/controllers/hello.controller';
import { HelloUseCase } from '../../application/use-cases/hello.use-case';
import { HelloRepository } from '../../adapters/repositories/hello.repository';
import { RedisClient } from '../config/redis';

export const setupRoutes = (app: Express) => {
  const helloRepository = new HelloRepository(RedisClient);
  const helloUseCase = new HelloUseCase(helloRepository);
  const helloController = new HelloController(helloUseCase);

  app.get('/hello', (req, res) => helloController.getHello(req, res));
}; 