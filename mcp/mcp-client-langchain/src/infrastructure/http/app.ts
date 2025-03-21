import express from 'express';
import { helloRoutes, setupRoutes } from './routes';
import { logger } from '../config/logger';
export const createApp = () => {
  const app = express();

  app.use(express.json());
  
  // Logging middleware
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });

  helloRoutes(app);
  setupRoutes(app);
  return app;
}; 