import { RedisClient } from '../../infrastructure/config/redis';

export class HelloRepository {
  private readonly CACHE_KEY = 'hello:message';

  constructor(private readonly redisClient: RedisClient) {}

  async getMessage(): Promise<string | null> {
    return this.redisClient.get(this.CACHE_KEY);
  }

  async saveMessage(message: string): Promise<void> {
    await this.redisClient.set(this.CACHE_KEY, message, { EX: 3600 }); // 1 hour cache
  }
}
