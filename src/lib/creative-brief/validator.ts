import type { CreativeBrief } from './types.js';

export function validateCreativeBrief(data: any): CreativeBrief {
  if (!data || typeof data !== 'object') {
    throw new Error('Creative Brief data is not an object');
  }

  const campaign = data.campaign || {};
  const audience = data.audience || {};
  const message = data.message || {};
  const visual = data.visual || {};

  return {
    campaign: {
      objective: String(campaign.objective || 'Brand Awareness'),
      platform: String(campaign.platform || 'LinkedIn'),
      contentType: String(campaign.contentType || 'Single Image')
    },
    audience: {
      primary: String(audience.primary || 'General Audience'),
      secondary: String(audience.secondary || '')
    },
    message: {
      coreMessage: String(message.coreMessage || 'Empowering innovation and quality solutions.'),
      headlineDirection: String(message.headlineDirection || 'Highlight corporate strengths'),
      cta: String(message.cta || 'Learn More')
    },
    visual: {
      style: String(visual.style || 'Minimal Premium'),
      layout: String(visual.layout || 'Centered Card'),
      composition: String(visual.composition || 'Symmetrical with generous whitespace padding'),
      imageFocus: String(visual.imageFocus || 'Logo or Core Symbolism'),
      priorityAssets: Array.isArray(visual.priorityAssets) ? visual.priorityAssets.map(String) : ['Primary Logo'],
      colorUsage: typeof visual.colorUsage === 'object' && visual.colorUsage ? visual.colorUsage : {},
      typography: typeof visual.typography === 'object' && visual.typography ? visual.typography : {}
    },
    generationGoal: String(data.generationGoal || 'Communicate brand value with sleek premium layout styling.'),
    imagePrompt: String(data.imagePrompt || '')
  };
}
