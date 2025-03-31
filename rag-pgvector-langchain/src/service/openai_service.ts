import axios from 'axios';
import dotenv from 'dotenv';
import { DefaultAzureCredential, getBearerTokenProvider } from '@azure/identity';

dotenv.config();

const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || '';
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || '';
const AZURE_OPENAI_API_VERSION = process.env.AZURE_OPENAI_API_VERSION || '2023-05-15';
// Use mock embeddings for testing if environment variable is set
const USE_MOCK_EMBEDDINGS = process.env.USE_MOCK_EMBEDDINGS === 'true' || !AZURE_OPENAI_ENDPOINT;

export class OpenAIService {
  private credential: DefaultAzureCredential;
  private endpoint: string;
  private deployment: string;
  private apiVersion: string;

  constructor() {
    this.credential = new DefaultAzureCredential();
    this.endpoint = AZURE_OPENAI_ENDPOINT;
    this.deployment = AZURE_OPENAI_DEPLOYMENT;
    this.apiVersion = AZURE_OPENAI_API_VERSION;

    if (USE_MOCK_EMBEDDINGS) {
      console.warn('Using mock embeddings for testing - no real embeddings will be generated');
    } else if (!this.endpoint || !this.deployment) {
      console.warn('Azure OpenAI configuration is missing. Vector search will not be available.');
    }
  }

  /**
   * Generate embeddings for a given text using Azure OpenAI with Azure AD authentication
   * @param text The text to generate embeddings for
   * @returns Array of embedding values
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      // If mock embeddings are enabled, generate deterministic embeddings based on text
      if (USE_MOCK_EMBEDDINGS) {
        return this.generateMockEmbedding(text);
      }

      const url = `${this.endpoint}/openai/deployments/${this.deployment}/embeddings?api-version=${this.apiVersion}`;
      
      // Get Azure AD token
      const token = await this.getAzureADToken();
      
      const response = await axios.post(
        url,
        {
          input: text,
          model: this.deployment
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data.data[0].embedding;
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw new Error('Failed to generate embeddings');
    }
  }

  /**
   * Generate embeddings for multiple texts in batch
   * @param texts Array of texts to generate embeddings for
   * @returns Array of embedding arrays
   */
  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      // If mock embeddings are enabled, generate deterministic embeddings
      if (USE_MOCK_EMBEDDINGS) {
        return texts.map(text => this.generateMockEmbedding(text));
      }
      
      const embeddings: number[][] = [];
      
      // Process in batches of 20 to avoid rate limits
      const batchSize = 20;
      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        const promises = batch.map(text => this.generateEmbedding(text));
        const batchResults = await Promise.all(promises);
        embeddings.push(...batchResults);
      }
      
      return embeddings;
    } catch (error) {
      console.error('Error generating batch embeddings:', error);
      throw new Error('Failed to generate batch embeddings');
    }
  }

  /**
   * Generate a mock embedding for testing purposes
   * This creates a deterministic embedding vector based on the input text
   * @param text The text to generate a mock embedding for
   * @returns A mock embedding vector (1536 dimensions)
   */
  private generateMockEmbedding(text: string): number[] {
    // Create a deterministic hash of the text
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    
    // Generate 1536 values based on the hash
    const embedding: number[] = [];
    const seedValue = hash;
    
    for (let i = 0; i < 1536; i++) {
      // Generate a pseudo-random value between -1 and 1 based on the hash and position
      const value = Math.sin(seedValue * i) / 2 + 0.5;
      embedding.push(value);
    }
    
    // Normalize the embedding to have a unit length
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
  }

  /**
   * Get Azure AD token for Azure OpenAI API access
   * Uses DefaultAzureCredential which supports multiple authentication methods
   * including Azure CLI, Visual Studio Code, Azure PowerShell, and Managed Identity
   */
  private async getAzureADToken(): Promise<string> {
    try {
      // Get token for Azure OpenAI
      const scope = `${this.endpoint}/.default`;
      const tokenResponse = await this.credential.getToken(scope);
      return tokenResponse.token;
    } catch (error) {
      console.error('Error getting Azure AD token:', error);
      throw new Error('Failed to get Azure AD token');
    }
  }
}

export default new OpenAIService(); 