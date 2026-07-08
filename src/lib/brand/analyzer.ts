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

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

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
    throw new Error(`Gemini API request failed: ${response.statusText} - ${errText}`);
  }

  const result = (await response.json()) as any;
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('No content returned from Gemini API');
  }

  return JSON.parse(text);
}

export async function analyzeBrandKnowledge(pages: ParsedPage[], _metadata: any): Promise<BrandKnowledge> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    Logger.info(`Loaded GEMINI_API_KEY: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 10)} (Length: ${apiKey.length})`);
  } else {
    Logger.warn('Loaded GEMINI_API_KEY is undefined!');
  }
  
  Logger.info(`=== STARTING BRAND KNOWLEDGE ENGINE PIPELINE ===`);

  // Build content context from first 5-7 parsed markdown blocks (capping lengths)
  const contentContext = pages
    .map(p => `--- PAGE URL: ${p.url} ---\nTitle: ${p.title}\nDescription: ${p.metaDescription || 'No description'}\nContent:\n${p.markdownContent.substring(0, 3000)}`)
    .join('\n\n');

  // Step 1: Analyze Company Info
  Logger.info(`Step 1: Extracting Company Profiles & Core Details...`);
  const step1Prompt = `
  You are an expert brand analyst. Review the crawled web content below:
  
  ${contentContext}
  
  Analyze the company information and return a strictly structured JSON object with the following fields:
  {
    "companyName": "String",
    "industry": "String",
    "businessModel": "B2B | B2C | SaaS | Marketplace | D2C | Hybrid",
    "description": "String (concise company description)",
    "coreServices": ["String", "String", ...]
  }
  `;
  const companyInfo = await callGemini(step1Prompt);
  Logger.success(`Step 1: Core Company details retrieved.`);

  // Step 2: Analyze Target Audience
  Logger.info(`Step 2: Identifying Target Audiences & Pain Points...`);
  const step2Prompt = `
  Based on the crawled web content below:
  
  ${contentContext}
  
  Identify the target audience and return a strictly structured JSON object with the following fields:
  {
    "primaryAudience": "String",
    "secondaryAudience": "String",
    "customerPainPoints": ["String", "String", ...],
    "businessGoals": ["String", "String", ...]
  }
  `;
  const audience = await callGemini(step2Prompt);
  Logger.success(`Step 2: Target Audience profiles generated.`);

  // Step 3: Analyze Brand Communication
  Logger.info(`Step 3: Compiling Brand Communication Persona...`);
  const step3Prompt = `
  Based on the crawled web content below:
  
  ${contentContext}
  
  Analyze the brand voice, tone, and positioning. Return a strictly structured JSON object with the following fields:
  {
    "tone": "String (e.g. Professional, Casual, Inspiring, Technical)",
    "personality": "String (e.g. Creator, Outlaw, Jester, Sage, Innovator)",
    "communicationStyle": "String (e.g. Direct, Explanatory, Narrative)",
    "emotionalPositioning": "String (e.g. Trust, Empathetic, Empowering)",
    "importantKeywords": ["String", "String", ...]
  }
  `;
  const communication = await callGemini(step3Prompt);
  Logger.success(`Step 3: Brand Tone & Voice vectors created.`);

  // Step 4: Analyze Visual Identity
  Logger.info(`Step 4: Mapping Design Visual Identities...`);
  const step4Prompt = `
  Based on the crawled web content below:
  
  ${contentContext}
  
  Analyze the visual design style, mood, and compositional layouts described or inferred from the text. Return a strictly structured JSON object with the following fields:
  {
    "designStyle": "String (e.g. Minimalist, Dark Editorial, Bright SaaS, Bold Corporate)",
    "visualMood": "String (e.g. Serious, Playful, Premium, Clean)",
    "imageryStyle": "String (e.g. High-tech, Abstract Vectors, Realistic Studio)",
    "illustrationStyle": "Flat Vector | 3D Render | Minimal Line | None",
    "compositionPreferences": "String (e.g. Grid-aligned, Centered, Asymmetrical)",
    "whitespaceUsage": "Comfortable | Dense | Spacious",
    "photographyStyle": "String (e.g. Warm Editorial, Studio Product, Candid)"
  }
  `;
  const visual = await callGemini(step4Prompt);
  Logger.success(`Step 4: Visual identity styling configurations parsed.`);

  // Step 5: Analyze Products and Services
  Logger.info(`Step 5: Cataloging Products & Key Features...`);
  const step5Prompt = `
  Based on the crawled web content below:
  
  ${contentContext}
  
  Extract a structured catalog list of all products and services offered. Return a strictly structured JSON object with the following fields:
  {
    "productsAndServices": [
      {
        "name": "String",
        "type": "Product | Service",
        "description": "String",
        "keyFeatures": ["String", "String", ...]
      }
    ]
  }
  `;
  const products = await callGemini(step5Prompt);
  Logger.success(`Step 5: Product lists compiled.`);

  // Step 6: Generate image-generation recommendations
  Logger.info(`Step 6: Synthesizing Image Generation Recommendations...`);
  const step6Prompt = `
  You are a creative director. Based on the company information: ${companyInfo.description}, visual style: ${visual.designStyle}, and tone: ${communication.tone}, generate image-generation prompts styling guide recommendations.
  
  Return a strictly structured JSON object with the following fields:
  {
    "recommendedVisualStyle": "String (e.g. Neomorphic, Flat Minimalist, Dark Editorial, 3D clay)",
    "preferredLayouts": ["String", "String", ...],
    "lighting": "String",
    "composition": "String",
    "backgroundRecommendations": "String",
    "logoPlacementRecommendations": "String",
    "typographyRecommendations": "String",
    "negativePromptRecommendations": "String"
  }
  `;
  const imageRecs = await callGemini(step6Prompt);
  Logger.success(`Step 6: Prompt engine guidelines generated.`);

  const output: BrandKnowledge = {
    companyName: companyInfo.companyName,
    industry: companyInfo.industry,
    businessModel: companyInfo.businessModel,
    description: companyInfo.description,
    coreServices: companyInfo.coreServices || [],
    primaryAudience: audience.primaryAudience,
    secondaryAudience: audience.secondaryAudience,
    customerPainPoints: audience.customerPainPoints || [],
    businessGoals: audience.businessGoals || [],
    tone: communication.tone,
    personality: communication.personality,
    communicationStyle: communication.communicationStyle,
    emotionalPositioning: communication.emotionalPositioning,
    importantKeywords: communication.importantKeywords || [],
    visualIdentity: {
      designStyle: visual.designStyle,
      visualMood: visual.visualMood,
      imageryStyle: visual.imageryStyle,
      illustrationStyle: visual.illustrationStyle,
      compositionPreferences: visual.compositionPreferences,
      whitespaceUsage: visual.whitespaceUsage,
      photographyStyle: visual.photographyStyle
    },
    productsAndServices: products.productsAndServices || [],
    imageGenerationRecommendations: {
      recommendedVisualStyle: imageRecs.recommendedVisualStyle,
      preferredLayouts: imageRecs.preferredLayouts || [],
      lighting: imageRecs.lighting,
      composition: imageRecs.composition,
      backgroundRecommendations: imageRecs.backgroundRecommendations,
      logoPlacementRecommendations: imageRecs.logoPlacementRecommendations,
      typographyRecommendations: imageRecs.typographyRecommendations,
      negativePromptRecommendations: imageRecs.negativePromptRecommendations
    }
  };

  Logger.success(`=== BRAND KNOWLEDGE PIPELINE SUCCESSFULLY COMPLETED ===`);
  return output;
}
