import { callBriefGemini } from '../creative-brief/client.js';
import { getImagePromptPackagePrompt } from './prompt.js';
import { validateImagePromptPackage, generateMockImagePromptPackage } from './validator.js';
import type { ImagePromptPackage } from './types.js';
import type { BrandKnowledge } from '../brand/analyzer.js';
import type { CreativeBrief } from '../creative-brief/types.js';
import type { FilteredAssets } from '../firecrawl/asset-filter.js';
import { Logger } from '../firecrawl/logger.js';

export async function buildImagePromptPackage(
  brandKnowledge: BrandKnowledge,
  creativeBrief: CreativeBrief,
  filteredAssets?: FilteredAssets,
  homepageScreenshot?: string,
  productMockups?: string[]
): Promise<ImagePromptPackage> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.includes('YOUR_API_KEY')) {
    Logger.warn('GEMINI_API_KEY not defined or placeholder. Building mock fallback Image Prompt Package.');
    return generateMockImagePromptPackage(brandKnowledge, creativeBrief, filteredAssets);
  }

  try {
    Logger.info('Calling Gemini to synthesize Image Prompt Package JSON...');
    const prompt = getImagePromptPackagePrompt(
      brandKnowledge,
      creativeBrief,
      filteredAssets,
      homepageScreenshot,
      productMockups
    );
    const rawResult = await callBriefGemini(prompt);
    
    Logger.success('Gemini successfully generated Image Prompt Package content.');
    const validated = validateImagePromptPackage(rawResult);
    return validated;
  } catch (err: any) {
    Logger.error('Failed to generate Image Prompt Package using Gemini, falling back to rule-based mock.', err);
    return generateMockImagePromptPackage(brandKnowledge, creativeBrief, filteredAssets);
  }
}
