import type { BrandKnowledge } from '../brand/analyzer.js';
import type { CreativeBrief } from './types.js';

export function getCreativeBriefPrompt(brandKnowledge: BrandKnowledge, userRequest: string): string {
  return `
  You are an expert Creative Director. You must transform the following Brand Knowledge and a User Campaign Request into a structured Creative Brief JSON.
  You must also perform prompt engineering to synthesize a highly descriptive, professional text prompt that an AI image generator can use to generate the visual layer for this social graphic.
  
  === BRAND KNOWLEDGE ===
  Company: ${brandKnowledge.companyName}
  Industry: ${brandKnowledge.industry}
  Business Model: ${brandKnowledge.businessModel}
  Description: ${brandKnowledge.description}
  Tone: ${brandKnowledge.tone}
  Personality: ${brandKnowledge.personality}
  Communication Style: ${brandKnowledge.communicationStyle}
  Visual Identity Mood: ${brandKnowledge.visualIdentity?.visualMood}
  Visual Style Guide: ${brandKnowledge.visualIdentity?.designStyle}
  Whitespace Preferences: ${brandKnowledge.visualIdentity?.whitespaceUsage}
  Key Products: ${JSON.stringify(brandKnowledge.productsAndServices)}
  Image Generation Recommendations from Brand: ${JSON.stringify(brandKnowledge.imageGenerationRecommendations)}
  
  === USER CAMPAIGN REQUEST ===
  "${userRequest}"
  
  === BRIEF RESPONSIBILITIES ===
  1. campaign.objective: Campaign type (Product Launch, Hiring, Educational, Awareness, Thought Leadership, Service Promotion, Announcement, Event, Offer, Case Study).
  2. campaign.platform: Target social platform (LinkedIn, X, Instagram, Facebook).
  3. campaign.contentType: Form factor style (Single Image, Carousel, Quote Card, Infographic, Comparison, Announcement).
  4. audience.primary: Primary target audience segment based on brand profile.
  5. audience.secondary: Secondary target audience segment.
  6. message.coreMessage: One concise sentence describing the core message for the graphic.
  7. message.headlineDirection: Prompt/direction for the post header (e.g. "Highlight AI expertise"). NOT final copy.
  8. message.cta: Call to action (Book Demo, Visit Website, Learn More, Contact Sales, Read More, Apply Now).
  9. visual.style: Core visual aesthetic (Minimal, Premium, Corporate, Modern, Editorial, Luxury, Bold, Technical).
  10. visual.layout: Layout recommendation (Centered, Split Layout, Hero Layout, Large Visual, Minimal Text, Diagonal Composition).
  11. visual.composition: Placement, whitespace, alignment, and hierarchy rules.
  12. visual.imageFocus: Center focal asset (Logo, Product, Dashboard, People, Illustration, Technology, Website, Hero Image).
  13. visual.priorityAssets: Array of extracted brand assets that should be used (e.g. ["Primary Logo", "Dashboard Screenshot"]).
  14. visual.colorUsage: Swatch layout recommendations matching brand colors.
  15. visual.typography: Headline font weights, alignment, text density hierarchy rules.
  16. generationGoal: Describe what the image should communicate to the audience.
  17. imagePrompt: A highly descriptive, professional text prompt that an AI image generator (like Imagen 3, Midjourney, or DALL-E) can use to generate the visual layer for this social graphic. Avoid referencing UI components or specific text labels directly.

  === RULES ===
  - Do NOT include any prompt engineering, AI model directives, negative prompts, or keywords like "Gemini", "OpenAI", "Midjourney", or "AI".
  - Write purely from a human creative director's perspective.
  
  Return a strictly structured JSON object matching:
  {
    "campaign": {
      "objective": "",
      "platform": "",
      "contentType": ""
    },
    "audience": {
      "primary": "",
      "secondary": ""
    },
    "message": {
      "coreMessage": "",
      "headlineDirection": "",
      "cta": ""
    },
    "visual": {
      "style": "",
      "layout": "",
      "composition": "",
      "imageFocus": "",
      "priorityAssets": [],
      "colorUsage": {},
      "typography": {}
    },
    "generationGoal": "",
    "imagePrompt": ""
  }
  `;
}

// Deprecated: Kept for legacy module imports
export function getImagePromptSynthesisPrompt(_brief: CreativeBrief, _brandKnowledge: BrandKnowledge): string {
  return '';
}
