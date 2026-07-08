import { GeminiImageProvider } from './gemini.js';
import { OpenAIImageProvider } from './openai.js';
import { PollinationsImageProvider } from './pollinations.js';
import type { ImageModelProvider } from './types.js';

export class ProviderFactory {
  static getProvider(providerName: 'gemini' | 'openai' | 'pollinations'): ImageModelProvider {
    switch (providerName) {
      case 'gemini':
        return new GeminiImageProvider();
      case 'openai':
        return new OpenAIImageProvider();
      case 'pollinations':
        return new PollinationsImageProvider();
      default:
        throw new Error(`Unsupported provider: ${providerName}`);
    }
  }
}
