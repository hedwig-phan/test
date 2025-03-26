import dotenv from 'dotenv';
import { createApp } from './router/api';
import { Client } from 'pg';

dotenv.config();

const PORT = process.env.PORT || 3000;

async function run() {
  try {

    const client = new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: 5432,
    });

    client.connect();
    
    const app = createApp();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log('Failed to start server:', error);
    process.exit(1);
  }
}

run(); 