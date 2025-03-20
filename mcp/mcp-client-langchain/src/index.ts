import { createApp } from './infrastructure/http/app';
import { RedisClient } from './infrastructure/config/redis';
import { logger } from './infrastructure/config/logger';

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    await RedisClient.connect();
    
    const app = createApp();
    
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap(); 