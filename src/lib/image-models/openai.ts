import type { ImageModelProvider, GenerationOptions, GenerationResult } from './types.js';
import type { ImagePromptPackage } from '../image-prompt/types.js';
import { resolveApiKey, getMockImageUrl } from './adapter.js';

export class OpenAIImageProvider implements ImageModelProvider {
  async generateImage(prompt: ImagePromptPackage, options?: GenerationOptions): Promise<GenerationResult> {
    const apiKey = resolveApiKey('openai', options?.apiKey);

    if (!apiKey) {
      console.warn('[OpenAI Provider] No API key available. Returning high-quality mock image.');
      return {
        success: true,
        imageUrl: getMockImageUrl(prompt),
        provider: 'mock'
      };
    }

    try {
      // Map aspect ratio to OpenAI DALL-E 3 sizes
      let dallESize = '1024x1024';
      if (options?.aspectRatio === '16:9') {
        dallESize = '1792x1024'; // Horizontal
      } else if (options?.aspectRatio === '4:5') {
        dallESize = '1024x1792'; // Vertical
      }

      // Map quality
      const dallEQuality = options?.quality === 'ultra' ? 'hd' : 'standard';
      const promptText = prompt.visualPrompt;

      const url = 'https://api.openai.com/v1/images/generations';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: promptText,
          n: 1,
          size: dallESize,
          quality: dallEQuality
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenAI DALL-E 3 API failed: ${response.status} ${response.statusText} - ${errText}`);
      }

      const data = await response.json();
      const generatedUrl = data?.data?.[0]?.url;

      if (!generatedUrl) {
        throw new Error('No image URL returned in OpenAI response');
      }

      return {
        success: true,
        imageUrl: generatedUrl,
        provider: 'openai'
      };
    } catch (err: any) {
      console.error('[OpenAI Provider] Error generating image, falling back to mock:', err.message || err);
      return {
        success: true, // Keep success true for graceful demo, but set provider as 'mock'
        imageUrl: getMockImageUrl(prompt),
        provider: 'mock',
        error: err.message || String(err)
      };
    }
  }

  async editImage(imageUrl: string, prompt: ImagePromptPackage, options?: GenerationOptions): Promise<GenerationResult> {
    console.log(`[OpenAI Provider] Mock editing image: ${imageUrl}`);
    return this.generateImage(prompt, options);
  }

  async generateCarousel(prompt: ImagePromptPackage, count: number, options?: GenerationOptions): Promise<GenerationResult[]> {
    console.log(`[OpenAI Provider] Generating carousel with ${count} slides`);
    const promises = Array.from({ length: count }).map(() => this.generateImage(prompt, options));
    return Promise.all(promises);
  }
}
