import fs from 'fs';
import path from 'path';
import { buildImagePromptPackage } from './builder.js';
import type { ImagePromptPackage } from './types.js';
import type { BrandKnowledge } from '../brand/analyzer.js';
import type { CreativeBrief } from '../creative-brief/types.js';
import type { FilteredAssets } from '../firecrawl/asset-filter.js';
import { Logger } from '../firecrawl/logger.js';

export async function generateImagePromptPackage(
  companyName: string,
  userRequest: string,
  options?: {
    brandKnowledge?: BrandKnowledge;
    creativeBrief?: CreativeBrief;
    filteredAssets?: FilteredAssets;
  }
): Promise<ImagePromptPackage> {
  Logger.info(`=== STARTING IMAGE PROMPT ENGINE PIPELINE ===`);
  Logger.info(`Company: ${companyName} | User Request: "${userRequest}"`);

  const outputDir = path.join(process.cwd(), 'brand-knowledge');
  const normalizedCompanyName = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');

  // 1. Load Brand Knowledge
  let brandKnowledge = options?.brandKnowledge;
  if (!brandKnowledge) {
    const knowledgeFilename = path.join(outputDir, `${normalizedCompanyName}-brand-knowledge.json`);
    if (!fs.existsSync(knowledgeFilename)) {
      throw new Error(`Brand knowledge file not found for ${companyName} at ${knowledgeFilename}. Scan the website first.`);
    }
    brandKnowledge = JSON.parse(fs.readFileSync(knowledgeFilename, 'utf8')) as BrandKnowledge;
    Logger.info(`Loaded Brand Knowledge from: ${knowledgeFilename}`);
  }

  // 2. Load Creative Brief
  let creativeBrief = options?.creativeBrief;
  if (!creativeBrief) {
    const briefFilename = path.join(outputDir, `${normalizedCompanyName}-creative-brief.json`);
    if (!fs.existsSync(briefFilename)) {
      throw new Error(`Creative brief file not found for ${companyName} at ${briefFilename}. Generate the creative brief first.`);
    }
    creativeBrief = JSON.parse(fs.readFileSync(briefFilename, 'utf8')) as CreativeBrief;
    Logger.info(`Loaded Creative Brief from: ${briefFilename}`);
  }

  // 3. Load Filtered Assets
  let filteredAssets = options?.filteredAssets;
  if (!filteredAssets) {
    const assetsFilename = path.join(outputDir, `${normalizedCompanyName}-filtered-assets.json`);
    if (fs.existsSync(assetsFilename)) {
      filteredAssets = JSON.parse(fs.readFileSync(assetsFilename, 'utf8')) as FilteredAssets;
      Logger.info(`Loaded Filtered Assets from: ${assetsFilename}`);
    } else {
      Logger.warn(`Filtered Assets file not found at ${assetsFilename}. Using default empty/mock asset collection.`);
      filteredAssets = {
        logo: {
          primary: '',
          alternate: ''
        },
        homepageImages: [],
        totalFilteredImages: 0,
        discardedImages: 0
      };
    }
  }

  // 4. Generate the Image Prompt Package
  const promptPackage = await buildImagePromptPackage(
    brandKnowledge,
    creativeBrief,
    filteredAssets
  );

  // 5. Save the output
  const promptPackageFilename = path.join(outputDir, `${normalizedCompanyName}-image-prompt.json`);
  fs.writeFileSync(promptPackageFilename, JSON.stringify(promptPackage, null, 2), 'utf8');
  Logger.success(`Saved brand-specific Image Prompt Package to: ${promptPackageFilename}`);

  // Also save to root image-prompt.json as requested
  const rootFilename = path.join(process.cwd(), 'image-prompt.json');
  fs.writeFileSync(rootFilename, JSON.stringify(promptPackage, null, 2), 'utf8');
  Logger.success(`Saved root Image Prompt Package copy to: ${rootFilename}`);

  Logger.success(`=== IMAGE PROMPT PIPELINE SUCCESSFULLY COMPLETED ===`);
  return promptPackage;
}
