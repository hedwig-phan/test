import dotenv from 'dotenv';
import { z } from 'zod';

// Load .env file
dotenv.config();

// Define config schema
const configSchema = z.object({
    // Server
    PORT: z.string().default('3000'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    // Database
    DATABASE_URL: z.string(),
    
    // Redis
    REDIS_URL: z.string(),

    // Ollama
    OLLAMA_URL: z.string().default('http://localhost:11434'),
    OLLAMA_MODEL: z.string().default('qwen2.5-coder:0.5b'),
});

// Parse and validate config
const config = configSchema.parse({
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    OLLAMA_URL: process.env.OLLAMA_URL,
    OLLAMA_MODEL: process.env.OLLAMA_MODEL,
});

// Export typed config
export default config; 