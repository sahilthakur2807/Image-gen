import type { BrandKnowledge } from '../brand/analyzer.js';
import type { CreativeBrief } from '../creative-brief/types.js';
import type { FilteredAssets } from '../firecrawl/asset-filter.js';

export function getImagePromptPackagePrompt(
  brandKnowledge: BrandKnowledge,
  creativeBrief: CreativeBrief,
  filteredAssets?: FilteredAssets,
  homepageScreenshot?: string,
  productMockups?: string[]
): string {
  // Prepare assets context
  const primaryLogoUrl = filteredAssets?.logo?.primary || '';
  const alternateLogoUrl = filteredAssets?.logo?.alternate || '';
  const heroImageUrl = filteredAssets?.homepageImages?.[0] || '';
  const dashboardImageUrl = filteredAssets?.homepageImages?.[1] || '';
  const fallbackProductUrls = filteredAssets?.homepageImages?.slice(2) || [];
  
  const allProductUrls = productMockups && productMockups.length > 0
    ? productMockups
    : fallbackProductUrls;

  return `
You are an expert AI Prompt Engineer and Creative Director. Your task is to convert the provided Brand Knowledge and Creative Brief into a highly structured, model-agnostic **Image Prompt Package** in JSON format.

=== INPUT DATA ===

1. BRAND KNOWLEDGE:
- Company Name: ${brandKnowledge.companyName}
- Industry: ${brandKnowledge.industry}
- Business Model: ${brandKnowledge.businessModel}
- Description: ${brandKnowledge.description}
- Brand Tone: ${brandKnowledge.tone}
- Brand Personality: ${brandKnowledge.personality}
- Communication Style: ${brandKnowledge.communicationStyle}
- Visual Identity Mood: ${brandKnowledge.visualIdentity?.visualMood || ''}
- Visual Style Guide: ${brandKnowledge.visualIdentity?.designStyle || ''}
- Whitespace Preferences: ${brandKnowledge.visualIdentity?.whitespaceUsage || ''}
- Photography Style: ${brandKnowledge.visualIdentity?.photographyStyle || ''}
- Image Recommendations: ${JSON.stringify(brandKnowledge.imageGenerationRecommendations || {})}

2. CREATIVE BRIEF:
- Campaign Objective: ${creativeBrief.campaign?.objective || ''}
- Platform: ${creativeBrief.campaign?.platform || ''}
- Content Type: ${creativeBrief.campaign?.contentType || ''}
- Audience (Primary): ${creativeBrief.audience?.primary || ''}
- Audience (Secondary): ${creativeBrief.audience?.secondary || ''}
- Core Message: ${creativeBrief.message?.coreMessage || ''}
- Headline Direction: ${creativeBrief.message?.headlineDirection || ''}
- CTA: ${creativeBrief.message?.cta || ''}
- Visual Style Request: ${creativeBrief.visual?.style || ''}
- Layout Request: ${creativeBrief.visual?.layout || ''}
- Composition Request: ${creativeBrief.visual?.composition || ''}
- Image Focus: ${creativeBrief.visual?.imageFocus || ''}
- Priority Assets Request: ${JSON.stringify(creativeBrief.visual?.priorityAssets || [])}
- Color Usage Guidelines: ${JSON.stringify(creativeBrief.visual?.colorUsage || {})}
- Typography Guidelines: ${JSON.stringify(creativeBrief.visual?.typography || {})}
- Generation Goal: ${creativeBrief.generationGoal || ''}

3. DETECTED BRAND ASSETS (URLs):
- Primary Logo: ${primaryLogoUrl || 'Not detected'}
- Alternate Logo: ${alternateLogoUrl || 'Not detected'}
- Homepage Hero Image: ${heroImageUrl || 'Not detected'}
- Dashboard Image: ${dashboardImageUrl || 'Not detected'}
- Homepage Screenshot: ${homepageScreenshot || 'Not detected'}
- Product Mockups: ${JSON.stringify(allProductUrls)}

=== DIRECTIONS FOR SYNTHESIZING EACH SECTION ===

1. **Visual Prompt**:
Create a detailed natural language description of the desired artwork. Ensure it is descriptive, modern, and captures the campaign's core message and visual style. Do NOT use model-specific syntax (e.g. Midjourney '--ar', weights, or prompt hacks). Keep it model-agnostic. Describe WHAT needs to be generated, NOT how.
Example: "A premium minimalist software company promoting AI consulting with a clean white composition, subtle gradients, modern dashboard imagery, soft shadows and generous whitespace."

2. **Scene Description**:
Provide clear, natural language instructions for:
- background
- subject
- camera angle
- perspective
- lighting
- composition
- depth
- negative space

3. **Visual Style**:
Specify style characteristics using descriptive terms (e.g. "Linear", "Modern Editorial", "Luxury Minimalist", "Flat Vector", "Corporate Clean", "High-tech Matte").
*CRITICAL*: Do NOT mention copyrighted brand names (like "Apple", "Stripe", "Linear", "Microsoft") directly in the prompt fields. Instead, describe their visual characteristics (e.g. for Apple: "ultra-clean premium layout, heavy whitespace, high-contrast crisp product renders, soft warm studio lighting, neomorphic shadows").

4. **Color Instructions**:
Provide specific instructions for:
- Primary
- Secondary
- Accent
- Background
- Contrast
*CRITICAL*: Do NOT invent new colors. Only utilize the colors extracted from the Brand Knowledge or Creative Brief color guidelines (e.g. from ${JSON.stringify(creativeBrief.visual?.colorUsage || {})} or other brand-identified hex codes).

5. **Composition**:
Instruct on:
- alignment
- grid
- balance
- focus
- spacing
- hierarchy
- visual flow

6. **Image References**:
Include reference objects for any visual assets detected above (Primary Logo, Alternate Logo, Homepage Screenshot, Hero Image, Dashboard, Product Mockups). Each reference must include:
- \`role\`: 'Primary Logo' | 'Alternate Logo' | 'Homepage Screenshot' | 'Hero Image' | 'Dashboard' | 'Product Mockup' | 'Other'
- \`url\`: The URL of the image.
- \`priority\`: A numeric rank out of 10 representing importance (where 10 is highest priority).

7. **Typography Instructions**:
Describe where typography overlays will be rendered. Describe:
- headline placement
- safe areas (e.g. margins, padding)
- text density
- alignment
*CRITICAL*: Do NOT include actual text or copy here. Simply describe the layout space reserved for future text. Text/Typography will be overlayed programmatically in a later stage.

8. **Logo Placement**:
Describe where the logo will be composited. Describe:
- location (e.g. top-left corner, bottom-right)
- size (e.g. 5% of container height)
- padding
- clear space
*CRITICAL*: Never ask the AI image generator to write or generate the logo mark. Write instructions stating that clear, empty space must be left in this location so that the logo can be layered/composited later.

9. **Negative Prompt**:
Formulate a structured list/description of elements to prevent. You must include preventions for:
- low quality, blurry, low resolution
- cartoon style (unless requested), 3D clay style (unless requested)
- oversaturated colors, neon color schemes (unless requested)
- random typography, text artifacts, gibberish letters
- incorrect logos, distorted brand marks
- cluttered layouts, crowded margins
- stock-photo appearance, staged generic corporate models
- watermarks, signatures, copyright marks
- distorted UI, broken interfaces, bad alignment
- extra random objects, irrelevant clutter

10. **Generation Parameters**:
Provide numeric and descriptive settings:
- aspect ratio (determine based on platform: e.g. '1:1' for Instagram, '16:9' or '1.91:1' for LinkedIn, '4:5' for mobile feeds, etc.)
- recommended resolution
- style strength (0.0 - 1.0)
- creativity level (0.0 - 1.0)
- detail level ('low' | 'medium' | 'high')
- background preference (e.g. 'solid', 'subtle gradient', 'textured')

11. **Reference Priority**:
Produce a ranked list of reference types with priorities (e.g., Homepage Screenshot: Priority 10, Primary Logo: Priority 10, Dashboard: Priority 9, Hero Image: Priority 8, Illustration: Priority 6).

=== OUTPUT SCHEMA FORMAT ===

You MUST return a JSON object conforming EXACTLY to the following structure:
{
  "visualPrompt": "string",
  "sceneDescription": {
    "background": "string",
    "subject": "string",
    "cameraAngle": "string",
    "perspective": "string",
    "lighting": "string",
    "composition": "string",
    "depth": "string",
    "negativeSpace": "string"
  },
  "visualStyle": {
    "styleType": "string",
    "description": "string",
    "characteristics": ["string"]
  },
  "colorInstructions": {
    "primary": "string (hex code or rgb)",
    "secondary": "string (hex code or rgb)",
    "accent": "string (hex code or rgb)",
    "background": "string (hex code or rgb)",
    "contrast": "string (high/medium/low)",
    "usageRules": "string"
  },
  "composition": {
    "alignment": "string",
    "grid": "string",
    "balance": "string",
    "focus": "string",
    "spacing": "string",
    "hierarchy": "string",
    "visualFlow": "string"
  },
  "imageReferences": [
    {
      "role": "Primary Logo | Alternate Logo | Homepage Screenshot | Hero Image | Dashboard | Product Mockup | Other",
      "url": "string",
      "priority": number
    }
  ],
  "typographyInstructions": {
    "headlinePlacement": "string",
    "safeAreas": "string",
    "textDensity": "string",
    "alignment": "string"
  },
  "logoPlacement": {
    "location": "string",
    "size": "string",
    "padding": "string",
    "clearSpace": "string"
  },
  "negativePrompt": {
    "structuredNegativePrompt": "string",
    "preventions": ["string"]
  },
  "generationParameters": {
    "aspectRatio": "string",
    "recommendedResolution": "string",
    "styleStrength": number,
    "creativityLevel": number,
    "detailLevel": "low | medium | high",
    "backgroundPreference": "string"
  },
  "referencePriority": [
    {
      "referenceName": "string",
      "priority": number
    }
  ]
}
  `;
}
