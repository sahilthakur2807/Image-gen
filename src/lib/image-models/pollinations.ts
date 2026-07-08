import type { ImageModelProvider, GenerationOptions, GenerationResult } from './types.js';
import type { ImagePromptPackage } from '../image-prompt/types.js';

export class PollinationsImageProvider implements ImageModelProvider {
  async generateImage(prompt: ImagePromptPackage, options?: GenerationOptions): Promise<GenerationResult> {
    try {
      let width = 1024;
      let height = 1024;
      if (options?.aspectRatio === '16:9') {
        width = 1024;
        height = 576;
      } else if (options?.aspectRatio === '4:5') {
        width = 800;
        height = 1000;
      }

      // Sanitize and shorten prompt for GET URL request
      let promptText = prompt.visualPrompt || '';
      promptText = promptText.replace(/\s+/g, ' ').trim();
      if (promptText.length > 500) {
        promptText = promptText.substring(0, 500) + '...';
      }

      console.log(`[Pollinations Provider] Requesting image generation...`);
      console.log(`[Pollinations Provider] Prompt: "${promptText}"`);

      const urlEncodedPrompt = encodeURIComponent(promptText);
      const url = `https://image.pollinations.ai/prompt/${urlEncodedPrompt}?width=${width}&height=${height}&nologo=true&private=true&enhance=false`;

      console.log(`[Pollinations Provider] Request URL: ${url}`);

      const response = await fetch(url);
      console.log(`[Pollinations Provider] Response Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        throw new Error(`Pollinations API failed with status ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      console.log(`[Pollinations Provider] Content-Type: ${contentType}`);

      if (!contentType.includes('image')) {
        const bodyText = await response.text();
        throw new Error(`Expected image from Pollinations but received content-type "${contentType}". Response: ${bodyText.substring(0, 200)}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');

      console.log(`[Pollinations Provider] Image successfully downloaded. Base64 length: ${base64.length}`);

      return {
        success: true,
        imageUrl: `data:image/jpeg;base64,${base64}`,
        provider: 'mock'
      };
    } catch (err: any) {
      console.error(`[Pollinations Provider] Error during generation:`, err.message || err);
      return {
        success: false,
        imageUrl: '',
        provider: 'mock',
        error: err.message || String(err)
      };
    }
  }

  async editImage(_imageUrl: string, prompt: ImagePromptPackage, options?: GenerationOptions): Promise<GenerationResult> {
    return this.generateImage(prompt, options);
  }

  async generateCarousel(prompt: ImagePromptPackage, count: number, options?: GenerationOptions): Promise<GenerationResult[]> {
    const promises = Array.from({ length: count }).map(() => this.generateImage(prompt, options));
    return Promise.all(promises);
  }
}
