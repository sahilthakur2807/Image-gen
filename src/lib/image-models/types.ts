import type { ImagePromptPackage } from '../image-prompt/types.js';

export interface GenerationOptions {
  quality: 'standard' | 'high' | 'ultra';
  aspectRatio: '1:1' | '4:5' | '16:9';
  referenceStrength: 'low' | 'medium' | 'high';
  slides?: number;
  apiKey?: string; // Custom API key override provided by the user
}

export interface GenerationResult {
  success: boolean;
  imageUrl: string;
  provider: 'gemini' | 'openai' | 'mock';
  error?: string;
}

export interface ImageModelProvider {
  generateImage(prompt: ImagePromptPackage, options?: GenerationOptions): Promise<GenerationResult>;
  editImage(imageUrl: string, prompt: ImagePromptPackage, options?: GenerationOptions): Promise<GenerationResult>;
  generateCarousel(prompt: ImagePromptPackage, count: number, options?: GenerationOptions): Promise<GenerationResult[]>;
}
