import { Firecrawl } from 'firecrawl';
import dotenv from 'dotenv';

// Load .env.local keys
dotenv.config({ path: '.env.local' });

const apiKey = process.env.FIRECRAWL_API_KEY;

if (!apiKey) {
  console.warn('Warning: FIRECRAWL_API_KEY is not defined in .env.local');
}

export const firecrawlClient = new Firecrawl({ apiKey: apiKey || '' });
