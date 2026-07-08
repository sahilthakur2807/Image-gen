import fs from 'fs';
import path from 'path';
import { callBriefGemini } from './client.js';
import { getCreativeBriefPrompt } from './prompt.js';
import { validateCreativeBrief } from './validator.js';
import type { CreativeBrief } from './types.js';
import { Logger } from '../firecrawl/logger.js';
import { generateImagePromptPackage } from '../image-prompt/engine.js';
import { generateMockImagePromptPackage } from '../image-prompt/validator.js';
import type { FilteredAssets } from '../firecrawl/asset-filter.js';

export async function generateCreativeBrief(
  companyName: string,
  userRequest: string
): Promise<CreativeBrief> {
  Logger.info(`=== STARTING CREATIVE BRIEF ENGINE PIPELINE ===`);
  Logger.info(`Company: ${companyName} | User Request: "${userRequest}"`);

  // 1. Load brand-knowledge JSON
  const outputDir = path.join(process.cwd(), 'brand-knowledge');
  const normalizedCompanyName = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const knowledgeFilename = path.join(outputDir, `${normalizedCompanyName}-brand-knowledge.json`);
  
  if (!fs.existsSync(knowledgeFilename)) {
    throw new Error(`Brand knowledge file not found for ${companyName} at ${knowledgeFilename}. Scan the website first.`);
  }

  const brandKnowledge = JSON.parse(fs.readFileSync(knowledgeFilename, 'utf8'));

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.includes('YOUR_API_KEY')) {
      throw new Error('GEMINI_API_KEY is not defined in .env.local or is a placeholder.');
    }

    // 2. Call Gemini to create the Creative Brief and Image Prompt in one consolidated request
    Logger.info(`Synthesizing Campaign Strategy Brief & Visual Prompt (1 consolidated request to Gemini Flash Lite)...`);
    const briefPrompt = getCreativeBriefPrompt(brandKnowledge, userRequest);
    const rawBrief = await callBriefGemini(briefPrompt);
    
    // Validate schema (validatedBrief automatically extracts imagePrompt if present)
    const validatedBrief = validateCreativeBrief(rawBrief);
    Logger.success(`Creative Brief and Visual Prompt parsed in 1 request.`);

    // Save creative brief to file first so it can be loaded by Phase 4 if needed
    const briefFilename = path.join(outputDir, `${normalizedCompanyName}-creative-brief.json`);
    fs.writeFileSync(briefFilename, JSON.stringify(validatedBrief, null, 2), 'utf8');
    Logger.success(`Saved Creative Brief JSON to: ${briefFilename}`);

    // 4. Call Phase 4: Image Prompt Engine
    try {
      const promptPackage = await generateImagePromptPackage(companyName, userRequest, {
        brandKnowledge,
        creativeBrief: validatedBrief
      });
      validatedBrief.imagePromptPackage = promptPackage;
      
      // Update saved file with the attached imagePromptPackage
      fs.writeFileSync(briefFilename, JSON.stringify(validatedBrief, null, 2), 'utf8');
    } catch (packageErr: any) {
      Logger.warn(`Image Prompt Package generation failed: ${packageErr.message || packageErr}`);
    }

    Logger.success(`=== CREATIVE BRIEF PIPELINE SUCCESSFULLY COMPLETED ===`);
    return validatedBrief;
  } catch (err: any) {
    Logger.warn(`Creative Brief live generation skipped/failed, returning mock fallback brief. Reason: ${err.message || err}`);

    const isHiring = userRequest.toLowerCase().includes('hiring') || userRequest.toLowerCase().includes('job');
    const isLaunch = userRequest.toLowerCase().includes('launch') || userRequest.toLowerCase().includes('post');

    const mockBrief: CreativeBrief = {
      campaign: {
        objective: isHiring ? 'Hiring' : isLaunch ? 'Product Launch' : 'Brand Awareness',
        platform: userRequest.toLowerCase().includes('instagram') ? 'Instagram' : 'LinkedIn',
        contentType: isHiring ? 'Announcement' : 'Single Image'
      },
      audience: {
        primary: brandKnowledge.primaryAudience || 'Developers and tech-leads',
        secondary: brandKnowledge.secondaryAudience || 'Decision makers'
      },
      message: {
        coreMessage: `Promoting campaign directives for ${companyName} in sync with user request "${userRequest}".`,
        headlineDirection: isHiring ? 'Focus on hiring and career growth' : 'Highlight innovation and core product values',
        cta: isHiring ? 'Apply Now' : 'Learn More'
      },
      visual: {
        style: brandKnowledge.visualIdentity?.designStyle || 'Minimal Modern',
        layout: 'Centered card layout grid',
        composition: 'Symmetrical with generous whitespace padding',
        imageFocus: 'Product Mockup',
        priorityAssets: ['Primary Logo', 'Homepage Hero'],
        colorUsage: {
          primary: brandKnowledge.colors?.[0] || '#2563eb',
          accent: brandKnowledge.colors?.[2] || '#10b981',
          background: '#ffffff'
        },
        typography: {
          headers: brandKnowledge.visualIdentity?.typographyStyle || 'Sans-serif Header',
          alignment: 'Left text layout'
        }
      },
      generationGoal: `Communicate sleek interface styling to represent the brand values of ${companyName}.`,
      imagePrompt: `A professional, studio-lighted social graphic for ${companyName} promoting "${userRequest}". Features clean typography, a spacious layout with whitespace, soft gradients, and prominent placement for the logo mark.`
    };

    // Load filtered assets if available
    let filteredAssets: FilteredAssets | undefined = undefined;
    const assetsFilename = path.join(outputDir, `${normalizedCompanyName}-filtered-assets.json`);
    if (fs.existsSync(assetsFilename)) {
      try {
        filteredAssets = JSON.parse(fs.readFileSync(assetsFilename, 'utf8'));
      } catch {}
    }

    // Generate and attach mock Image Prompt Package
    const mockPromptPackage = generateMockImagePromptPackage(brandKnowledge, mockBrief, filteredAssets);
    mockBrief.imagePromptPackage = mockPromptPackage;

    // Save mock creative brief to file
    const briefFilename = path.join(outputDir, `${normalizedCompanyName}-creative-brief.json`);
    fs.writeFileSync(briefFilename, JSON.stringify(mockBrief, null, 2), 'utf8');
    Logger.success(`Saved Mock Creative Brief JSON to: ${briefFilename}`);

    // Also write mock prompt package to image-prompt.json
    const promptPackageFilename = path.join(outputDir, `${normalizedCompanyName}-image-prompt.json`);
    fs.writeFileSync(promptPackageFilename, JSON.stringify(mockPromptPackage, null, 2), 'utf8');
    fs.writeFileSync(path.join(process.cwd(), 'image-prompt.json'), JSON.stringify(mockPromptPackage, null, 2), 'utf8');
    
    return mockBrief;
  }
}
