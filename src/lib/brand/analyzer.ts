import dotenv from 'dotenv';
import type { ParsedPage } from '../firecrawl/parser.js';
import { Logger } from '../firecrawl/logger.js';

// Load environmental variables
dotenv.config({ path: '.env.local', override: true });

export interface BrandKnowledge {
  companyName: string;
  industry: string;
  businessModel: string;
  description: string;
  coreServices: string[];
  primaryAudience: string;
  secondaryAudience: string;
  customerPainPoints: string[];
  businessGoals: string[];
  tone: string;
  personality: string;
  communicationStyle: string;
  emotionalPositioning: string;
  importantKeywords: string[];
  visualIdentity: {
    designStyle: string;
    visualMood: string;
    imageryStyle: string;
    illustrationStyle: string;
    compositionPreferences: string;
    whitespaceUsage: string;
    photographyStyle: string;
  };
  productsAndServices: Array<{
    name: string;
    type: 'Product' | 'Service';
    description: string;
    keyFeatures: string[];
  }>;
  imageGenerationRecommendations: {
    recommendedVisualStyle: string;
    preferredLayouts: string[];
    lighting: string;
    composition: string;
    backgroundRecommendations: string;
    logoPlacementRecommendations: string;
    typographyRecommendations: string;
    negativePromptRecommendations: string;
  };
}

async function callGemini(prompt: string): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in .env.local');
  }

  const models = ['gemini-3.1-flash-lite', 'gemini-2.5-flash-lite', 'gemini-2.5-flash'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Model ${model} failed (${response.status} ${response.statusText}): ${errText}`);
      }

      const result = (await response.json()) as any;
      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error(`Model ${model} returned empty content`);
      }

      return JSON.parse(text);
    } catch (err: any) {
      console.warn(`Attempt with ${model} failed in brand analyzer:`, err.message || err);
      lastError = err;
    }
  }

  throw new Error(`All models failed in brand analyzer. Last error: ${lastError?.message || lastError}`);
}

export async function analyzeBrandKnowledge(pages: ParsedPage[], _metadata: any): Promise<BrandKnowledge> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    Logger.info(`Loaded GEMINI_API_KEY: ${apiKey.substring(0, 10)}... (Length: ${apiKey.length})`);
  } else {
    Logger.warn('Loaded GEMINI_API_KEY is undefined!');
  }
  
  Logger.info(`=== STARTING BRAND KNOWLEDGE ENGINE PIPELINE ===`);

  // Build content context from first 5-7 parsed markdown blocks (capping lengths)
  const contentContext = pages
    .map(p => `--- PAGE URL: ${p.url} ---\nTitle: ${p.title}\nDescription: ${p.metaDescription || 'No description'}\nContent:\n${p.markdownContent.substring(0, 3000)}`)
    .join('\n\n');

  // Single unified prompt to extract all Brand Knowledge fields in one model call
  Logger.info(`Extracting Brand Intelligence & Visual Identity (1 consolidated request to Gemini Flash Lite)...`);
  const unifiedPrompt = `
  You are an expert brand analyst. Review the crawled web content below:
  
  ${contentContext}
  
  Perform a complete brand and visual identity analysis on this company.
  Return a strictly structured JSON object containing all the fields of the BrandKnowledge interface matching the schema below:
  
  {
    "companyName": "String",
    "industry": "String",
    "businessModel": "B2B | B2C | SaaS | Marketplace | D2C | Hybrid",
    "description": "String (concise company description)",
    "coreServices": ["String", "String", ...],
    "primaryAudience": "String",
    "secondaryAudience": "String",
    "customerPainPoints": ["String", "String", ...],
    "businessGoals": ["String", "String", ...],
    "tone": "String (e.g. Professional, Casual, Inspiring, Technical, Appetizing, Celebratory)",
    "personality": "String (e.g. Creator, Outlaw, Jester, Sage, Innovator, Caregiver, Everyman)",
    "communicationStyle": "String (e.g. Direct, Explanatory, Narrative, Engaging)",
    "emotionalPositioning": "String (e.g. Trust, Empathetic, Empowering, Joy, Nostalgia)",
    "importantKeywords": ["String", "String", ...],
    "visualIdentity": {
      "designStyle": "String (e.g. Minimalist, Dark Editorial, Bright SaaS, Bold Corporate, Clean E-commerce)",
      "visualMood": "String (e.g. Serious, Playful, Premium, Clean, Appetizing)",
      "imageryStyle": "String (e.g. High-tech, Abstract Vectors, Realistic Studio)",
      "illustrationStyle": "Flat Vector | 3D Render | Minimal Line | None",
      "compositionPreferences": "String (e.g. Grid-aligned, Centered, Asymmetrical)",
      "whitespaceUsage": "Comfortable | Dense | Spacious",
      "photographyStyle": "String (e.g. Warm Editorial, Studio Product, Candid)"
    },
    "productsAndServices": [
      {
        "name": "String",
        "type": "Product | Service",
        "description": "String",
        "keyFeatures": ["String", "String", ...]
      }
    ],
    "imageGenerationRecommendations": {
      "recommendedVisualStyle": "String (e.g. Neomorphic, Flat Minimalist, Dark Editorial, 3D clay, Elevated Product Photography)",
      "preferredLayouts": ["String", "String", ...],
      "lighting": "String",
      "composition": "String",
      "backgroundRecommendations": "String",
      "logoPlacementRecommendations": "String",
      "typographyRecommendations": "String",
      "negativePromptRecommendations": "String"
    }
  }
  `;

  const output = await callGemini(unifiedPrompt) as BrandKnowledge;
  Logger.success(`Brand Intelligence parsed and validated in 1 request.`);

  Logger.success(`=== BRAND KNOWLEDGE PIPELINE SUCCESSFULLY COMPLETED ===`);
  return output;
}
