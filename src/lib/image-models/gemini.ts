import type { ImageModelProvider, GenerationOptions, GenerationResult } from './types.js';
import type { ImagePromptPackage } from '../image-prompt/types.js';
import { resolveApiKey, getMockImageUrl } from './adapter.js';

export class GeminiImageProvider implements ImageModelProvider {
  async generateImage(prompt: ImagePromptPackage, options?: GenerationOptions): Promise<GenerationResult> {
    const apiKey = resolveApiKey('gemini', options?.apiKey);

    if (!apiKey) {
      console.warn('[Gemini Provider] No API key available. Returning high-quality mock image.');
      return {
        success: true,
        imageUrl: getMockImageUrl(prompt),
        provider: 'mock'
      };
    }

    try {
      // Map aspect ratio to Gemini-supported values: "1:1", "3:4", "4:3", "9:16", "16:9"
      let geminiAspectRatio = '1:1';
      if (options?.aspectRatio === '16:9') {
        geminiAspectRatio = '16:9';
      } else if (options?.aspectRatio === '4:5') {
        // Gemini supports 3:4 or 9:16, let's map 4:5 to 3:4
        geminiAspectRatio = '3:4';
      }

      const promptText = prompt.visualPrompt;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:generateImages?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          numberOfImages: 1,
          prompt: promptText,
          aspectRatio: geminiAspectRatio,
          outputMimeType: 'image/jpeg',
          safetySettings: [
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_LOW_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_LOW_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_LOW_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_LOW_AND_ABOVE'
            }
          ]
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini Imagen API failed: ${response.status} ${response.statusText} - ${errText}`);
      }

      const data = await response.json();
      const imageBytes = data?.generatedImages?.[0]?.image?.imageBytes;

      if (!imageBytes) {
        throw new Error('No image bytes returned in Gemini response');
      }

      return {
        success: true,
        imageUrl: `data:image/jpeg;base64,${imageBytes}`,
        provider: 'gemini'
      };
    } catch (err: any) {
      console.error('[Gemini Provider] Error generating image, falling back to mock:', err.message || err);
      return {
        success: true, // Keep success true for graceful demo, but set provider as 'mock'
        imageUrl: getMockImageUrl(prompt),
        provider: 'mock',
        error: err.message || String(err)
      };
    }
  }

  async editImage(imageUrl: string, prompt: ImagePromptPackage, options?: GenerationOptions): Promise<GenerationResult> {
    console.log(`[Gemini Provider] Mock editing image: ${imageUrl}`);
    return this.generateImage(prompt, options);
  }

  async generateCarousel(prompt: ImagePromptPackage, count: number, options?: GenerationOptions): Promise<GenerationResult[]> {
    console.log(`[Gemini Provider] Generating carousel with ${count} slides`);
    const promises = Array.from({ length: count }).map(() => this.generateImage(prompt, options));
    return Promise.all(promises);
  }
}
