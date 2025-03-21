import { createClient } from 'redis';
import { logger } from './logger';
import config from './config';
export type RedisClient = ReturnType<typeof createClient>;

const client = createClient({
  url: config.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      logger.info(`Retrying Redis connection in ${delay}ms...`);
      return delay;
    }
  }
});

client.on('error', (err) => logger.error('Redis Client Error', err));

export { client as RedisClient }; 