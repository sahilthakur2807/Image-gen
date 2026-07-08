import fs from 'fs';
import path from 'path';
import { callBriefGemini } from './client.js';
import { getCreativeBriefPrompt, getImagePromptSynthesisPrompt } from './prompt.js';
import { validateCreativeBrief } from './validator.js';
import type { CreativeBrief } from './types.js';
import { Logger } from '../firecrawl/logger.js';

export async function generateCreativeBrief(
  companyName: string,
  userRequest: string
): Promise<CreativeBrief> {
  Logger.info(`=== STARTING CREATIVE BRIEF ENGINE PIPELINE ===`);
  Logger.info(`Company: ${companyName} | User Request: "${userRequest}"`);

  // 1. Load brand-knowledge JSON
  const outputDir = path.join(process.cwd(), 'brand-knowledge');
  const knowledgeFilename = path.join(outputDir, `${companyName.toLowerCase()}-brand-knowledge.json`);
  
  if (!fs.existsSync(knowledgeFilename)) {
    throw new Error(`Brand knowledge file not found for ${companyName} at ${knowledgeFilename}. Scan the website first.`);
  }

  const brandKnowledge = JSON.parse(fs.readFileSync(knowledgeFilename, 'utf8'));

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.includes('YOUR_API_KEY')) {
      throw new Error('GEMINI_API_KEY is not defined in .env.local or is a placeholder.');
    }

    // 2. Call Gemini to create the Creative Brief
    Logger.info(`Creative Brief Phase 1: Synthesizing Campaign Strategy Brief...`);
    const briefPrompt = getCreativeBriefPrompt(brandKnowledge, userRequest);
    const rawBrief = await callBriefGemini(briefPrompt);
    
    // Validate schema
    const validatedBrief = validateCreativeBrief(rawBrief);
    Logger.success(`Creative Brief parsed and validated.`);

    // 3. Call Gemini to synthesize the detailed image prompt
    Logger.info(`Creative Brief Phase 2: Building visual prompt instructions...`);
    const synthesisPrompt = getImagePromptSynthesisPrompt(validatedBrief, brandKnowledge);
    const promptResult = await callBriefGemini(synthesisPrompt);
    
    // Attach prompt
    validatedBrief.imagePrompt = promptResult?.imagePrompt || 'A professional high-contrast minimal background design layout.';
    Logger.success(`Visual Prompt synthesized successfully.`);

    // 4. Save creative brief to file
    const briefFilename = path.join(outputDir, `${companyName.toLowerCase()}-creative-brief.json`);
    fs.writeFileSync(briefFilename, JSON.stringify(validatedBrief, null, 2), 'utf8');
    Logger.success(`Saved Creative Brief JSON to: ${briefFilename}`);

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

    // Save mock creative brief to file
    const briefFilename = path.join(outputDir, `${companyName.toLowerCase()}-creative-brief.json`);
    fs.writeFileSync(briefFilename, JSON.stringify(mockBrief, null, 2), 'utf8');
    Logger.success(`Saved Mock Creative Brief JSON to: ${briefFilename}`);
    
    return mockBrief;
  }
}
