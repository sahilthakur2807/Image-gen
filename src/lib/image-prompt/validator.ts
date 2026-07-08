import type { ImagePromptPackage, ImageReference } from './types.js';
import type { BrandKnowledge } from '../brand/analyzer.js';
import type { CreativeBrief } from '../creative-brief/types.js';
import type { FilteredAssets } from '../firecrawl/asset-filter.js';

export function validateImagePromptPackage(raw: any): ImagePromptPackage {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Raw prompt package is not an object.');
  }

  // 1. Visual Prompt
  const visualPrompt = typeof raw.visualPrompt === 'string' ? raw.visualPrompt : 'A professional corporate design graphic.';

  // 2. Scene Description
  const rawScene = raw.sceneDescription || {};
  const sceneDescription = {
    background: typeof rawScene.background === 'string' ? rawScene.background : 'Clean, soft-colored background.',
    subject: typeof rawScene.subject === 'string' ? rawScene.subject : 'Core visual components and brand logo placeholder.',
    cameraAngle: typeof rawScene.cameraAngle === 'string' ? rawScene.cameraAngle : 'Straight-on eye-level view.',
    perspective: typeof rawScene.perspective === 'string' ? rawScene.perspective : 'Orthographic flat perspective.',
    lighting: typeof rawScene.lighting === 'string' ? rawScene.lighting : 'Bright diffused studio lighting.',
    composition: typeof rawScene.composition === 'string' ? rawScene.composition : 'Rule of thirds focal points.',
    depth: typeof rawScene.depth === 'string' ? rawScene.depth : 'Shallow depth of field with soft focal dropoff.',
    negativeSpace: typeof rawScene.negativeSpace === 'string' ? rawScene.negativeSpace : 'Generous margin spacing.'
  };

  // 3. Visual Style
  const rawStyle = raw.visualStyle || {};
  const visualStyle = {
    styleType: typeof rawStyle.styleType === 'string' ? rawStyle.styleType : 'Modern Minimalist',
    description: typeof rawStyle.description === 'string' ? rawStyle.description : 'High-end design aesthetics with soft gradients and clean borders.',
    characteristics: Array.isArray(rawStyle.characteristics)
      ? rawStyle.characteristics.map((c: any) => String(c))
      : ['Clean grid layout', 'Subtle shadows', 'Spacious padding']
  };

  // 4. Color Instructions
  const rawColors = raw.colorInstructions || {};
  const colorInstructions = {
    primary: typeof rawColors.primary === 'string' ? rawColors.primary : '#2563eb',
    secondary: typeof rawColors.secondary === 'string' ? rawColors.secondary : '#1e293b',
    accent: typeof rawColors.accent === 'string' ? rawColors.accent : '#10b981',
    background: typeof rawColors.background === 'string' ? rawColors.background : '#ffffff',
    contrast: typeof rawColors.contrast === 'string' ? rawColors.contrast : 'high',
    usageRules: typeof rawColors.usageRules === 'string' ? rawColors.usageRules : 'Apply primary as the major tone, accent on focal highlights.'
  };

  // 5. Composition
  const rawComp = raw.composition || {};
  const composition = {
    alignment: typeof rawComp.alignment === 'string' ? rawComp.alignment : 'Centered alignment.',
    grid: typeof rawComp.grid === 'string' ? rawComp.grid : 'Symmetrical grid system.',
    balance: typeof rawComp.balance === 'string' ? rawComp.balance : 'Harmonious focal weight.',
    focus: typeof rawComp.focus === 'string' ? rawComp.focus : 'Primary product assets at center.',
    spacing: typeof rawComp.spacing === 'string' ? rawComp.spacing : 'Generous padding and open margins.',
    hierarchy: typeof rawComp.hierarchy === 'string' ? rawComp.hierarchy : 'Bold hero element transitioning down.',
    visualFlow: typeof rawComp.visualFlow === 'string' ? rawComp.visualFlow : 'Left-to-right eye path.'
  };

  // 6. Image References
  const imageReferences: ImageReference[] = [];
  if (Array.isArray(raw.imageReferences)) {
    raw.imageReferences.forEach((ref: any) => {
      if (ref && typeof ref === 'object') {
        imageReferences.push({
          role: typeof ref.role === 'string' ? ref.role : 'Other',
          url: typeof ref.url === 'string' ? ref.url : '',
          priority: typeof ref.priority === 'number' ? ref.priority : 5
        });
      }
    });
  }

  // 7. Typography Instructions
  const rawTypo = raw.typographyInstructions || {};
  const typographyInstructions = {
    headlinePlacement: typeof rawTypo.headlinePlacement === 'string' ? rawTypo.headlinePlacement : 'Centered high position.',
    safeAreas: typeof rawTypo.safeAreas === 'string' ? rawTypo.safeAreas : 'Comfortable text-safe container margins.',
    textDensity: typeof rawTypo.textDensity === 'string' ? rawTypo.textDensity : 'Low density, high breathing room.',
    alignment: typeof rawTypo.alignment === 'string' ? rawTypo.alignment : 'Center text layout alignment.'
  };

  // 8. Logo Placement
  const rawLogo = raw.logoPlacement || {};
  const logoPlacement = {
    location: typeof rawLogo.location === 'string' ? rawLogo.location : 'Top-left or top-center.',
    size: typeof rawLogo.size === 'string' ? rawLogo.size : 'Moderate brand mark size.',
    padding: typeof rawLogo.padding === 'string' ? rawLogo.padding : 'Spacious clearing boundary.',
    clearSpace: typeof rawLogo.clearSpace === 'string' ? rawLogo.clearSpace : 'Strict empty zone around logo.'
  };

  // 9. Negative Prompt
  const rawNeg = raw.negativePrompt || {};
  const negativePrompt = {
    structuredNegativePrompt: typeof rawNeg.structuredNegativePrompt === 'string'
      ? rawNeg.structuredNegativePrompt
      : 'low quality, cartoon, stock photo, blurry, bad text, watermark, incorrect logo, clutter, distorted UI',
    preventions: Array.isArray(rawNeg.preventions)
      ? rawNeg.preventions.map((p: any) => String(p))
      : ['low quality', 'blurry', 'stock photos', 'random text', 'distorted brand logo']
  };

  // 10. Generation Parameters
  const rawParams = raw.generationParameters || {};
  const generationParameters = {
    aspectRatio: typeof rawParams.aspectRatio === 'string' ? rawParams.aspectRatio : '1:1',
    recommendedResolution: typeof rawParams.recommendedResolution === 'string' ? rawParams.recommendedResolution : '1080x1080',
    styleStrength: typeof rawParams.styleStrength === 'number' ? rawParams.styleStrength : 0.8,
    creativityLevel: typeof rawParams.creativityLevel === 'number' ? rawParams.creativityLevel : 0.6,
    detailLevel: (rawParams.detailLevel === 'low' || rawParams.detailLevel === 'medium' || rawParams.detailLevel === 'high')
      ? rawParams.detailLevel
      : 'high',
    backgroundPreference: typeof rawParams.backgroundPreference === 'string' ? rawParams.backgroundPreference : 'solid'
  };

  // 11. Reference Priority
  const referencePriority: any[] = [];
  if (Array.isArray(raw.referencePriority)) {
    raw.referencePriority.forEach((p: any) => {
      if (p && typeof p === 'object') {
        referencePriority.push({
          referenceName: typeof p.referenceName === 'string' ? p.referenceName : 'Asset Reference',
          priority: typeof p.priority === 'number' ? p.priority : 5
        });
      }
    });
  } else {
    // Populate from imageReferences if missing
    imageReferences.forEach(ref => {
      referencePriority.push({
        referenceName: ref.role,
        priority: ref.priority
      });
    });
  }

  return {
    visualPrompt,
    sceneDescription,
    visualStyle,
    colorInstructions,
    composition,
    imageReferences,
    typographyInstructions,
    logoPlacement,
    negativePrompt,
    generationParameters,
    referencePriority
  };
}

export function generateMockImagePromptPackage(
  brandKnowledge: BrandKnowledge,
  creativeBrief: CreativeBrief,
  filteredAssets?: FilteredAssets
): ImagePromptPackage {
  // Extract primary colors safely
  const colors = creativeBrief.visual?.colorUsage || {};
  const primaryHex = colors.primary || '#2563eb';
  const secondaryHex = colors.secondary || '#1e293b';
  const accentHex = colors.accent || '#10b981';
  const bgHex = colors.background || '#ffffff';

  // Map references
  const imageReferences: ImageReference[] = [];
  if (filteredAssets) {
    if (filteredAssets.logo?.primary) {
      imageReferences.push({ role: 'Primary Logo', url: filteredAssets.logo.primary, priority: 10 });
    }
    if (filteredAssets.logo?.alternate) {
      imageReferences.push({ role: 'Alternate Logo', url: filteredAssets.logo.alternate, priority: 9 });
    }
    if (filteredAssets.homepageImages?.[0]) {
      imageReferences.push({ role: 'Hero Image', url: filteredAssets.homepageImages[0], priority: 8 });
    }
    if (filteredAssets.homepageImages?.[1]) {
      imageReferences.push({ role: 'Dashboard', url: filteredAssets.homepageImages[1], priority: 9 });
    }
    filteredAssets.homepageImages?.slice(2, 5).forEach((img, idx) => {
      imageReferences.push({ role: 'Product Mockup', url: img, priority: 7 - idx });
    });
  } else {
    // Placeholder assets
    imageReferences.push({ role: 'Primary Logo', url: '/favicon.svg', priority: 10 });
    imageReferences.push({ role: 'Hero Image', url: '/brand_asset_1.png', priority: 8 });
    imageReferences.push({ role: 'Dashboard', url: '/brand_asset_1.png', priority: 9 });
  }

  const referencePriority = imageReferences.map(ref => ({
    referenceName: ref.role,
    priority: ref.priority
  }));

  // Build a platform-dependent aspect ratio
  const platform = (creativeBrief.campaign?.platform || 'LinkedIn').toLowerCase();
  let aspectRatio = '1:1';
  let recommendedResolution = '1080x1080';
  if (platform.includes('linkedin')) {
    aspectRatio = '1.91:1';
    recommendedResolution = '1200x627';
  } else if (platform.includes('instagram')) {
    aspectRatio = '1:1';
    recommendedResolution = '1080x1080';
  } else if (platform.includes('twitter') || platform.includes('x')) {
    aspectRatio = '16:9';
    recommendedResolution = '1200x675';
  }

  // Construct descriptive style without brand names
  const designStyle = creativeBrief.visual?.style || brandKnowledge.visualIdentity?.designStyle || 'Minimalist Modern';
  let characteristics = ['Clean grid alignment', 'Subtle linear structures', 'Soft lighting', 'Ample whitespace'];
  let styleType = designStyle;
  
  if (designStyle.toLowerCase().includes('apple')) {
    styleType = 'High-End Consumer Electronics Editorial';
    characteristics = ['Ultra-clean spatial layout', 'Heavy comfortable whitespace', 'High-contrast studio product renders', 'Soft neomorphic shadows', 'Natural daylighting'];
  } else if (designStyle.toLowerCase().includes('linear')) {
    styleType = 'Technical Dark Software Aesthetic';
    characteristics = ['Sleek dark neomorphism', 'Subtle glowing vector borders', 'Chiaroscuro key lighting', 'Perfect pixel grids', 'Deep workspace perspective'];
  } else if (designStyle.toLowerCase().includes('stripe')) {
    styleType = 'Modern Fintech Vibrant SaaS';
    characteristics = ['Diagonal layout lines', 'Vibrant colorful gradients', 'Soft clay 3D geometric shapes', 'Highly isometric perspective', 'Bright clean daylighting'];
  }

  const company = brandKnowledge.companyName;

  return {
    visualPrompt: `A premium, ${styleType.toLowerCase()} social campaign graphic for ${company}. Features a clean, spacious composition with subtle background gradients in ${primaryHex} and ${bgHex}, emphasizing ${creativeBrief.visual?.imageFocus || 'the product'}. Soft studio lighting, realistic depth of field, and perfect grid-based balance.`,
    sceneDescription: {
      background: `A sophisticated background utilizing soft, diffused gradients blending ${bgHex} and ${primaryHex}. Minimal textures, feeling premium and uncluttered.`,
      subject: `Focal representation representing ${creativeBrief.visual?.imageFocus || 'the company product'}. High quality, crisp lines.`,
      cameraAngle: 'Eye-level, front-facing view.',
      perspective: 'Orthographic flat perspective to keep elements crisp and layout-aligned.',
      lighting: brandKnowledge.imageGenerationRecommendations?.lighting || 'Soft diffused daylight coming from top-left, casting gentle shadows.',
      composition: brandKnowledge.imageGenerationRecommendations?.composition || 'Centered focal points, aligned using a balanced grid system.',
      depth: 'Shallow depth of field, subtle soft blur on background elements to bring the focal subject forward.',
      negativeSpace: 'Generous and spacious breathing room around all elements. Comfortable layout padding.'
    },
    visualStyle: {
      styleType,
      description: `A modern, clean aesthetic tailored to the brand voice and design goals.`,
      characteristics
    },
    colorInstructions: {
      primary: primaryHex,
      secondary: secondaryHex,
      accent: accentHex,
      background: bgHex,
      contrast: 'high',
      usageRules: `Use ${bgHex} for background layer. Apply ${primaryHex} as dominant accent colors. Keep ${accentHex} strictly for highlighted action lines.`
    },
    composition: {
      alignment: creativeBrief.visual?.layout || 'Grid-aligned centered card composition.',
      grid: 'Symmetrical structured layout grid.',
      balance: 'Symmetrical, balanced visual weight.',
      focus: `Clear focus on ${creativeBrief.visual?.imageFocus || 'the main brand elements'}.`,
      spacing: 'Spacious padding, strict margin limits.',
      hierarchy: 'Main hero focal point transitions to clean structured spaces.',
      visualFlow: 'Left-to-right eye scanning path, descending towards the call-to-action area.'
    },
    imageReferences,
    typographyInstructions: {
      headlinePlacement: 'Upper third of the container, aligned left or center.',
      safeAreas: 'Strict margins at 10% of container size. Text must not overlap any detailed graphics or the logo.',
      textDensity: 'Low text density. Designed for high visibility headers and concise subtext.',
      alignment: creativeBrief.visual?.typography?.alignment || 'Left-aligned text blocks.'
    },
    logoPlacement: {
      location: brandKnowledge.imageGenerationRecommendations?.logoPlacementRecommendations || 'Upper right or lower left corner.',
      size: 'Between 5% and 8% of total width.',
      padding: 'Comfortable spacing matching the main margins.',
      clearSpace: 'No intersecting graphics or text. Keep a 50px blank margin around the logo.'
    },
    negativePrompt: {
      structuredNegativePrompt: 'low quality, blurry, cartoon, stock photos, generic staging, random text, watermark, incorrect logo, messy layout, high saturation, extra items, out of frame',
      preventions: [
        'low quality',
        'cartoon style (unless specified)',
        'oversaturated colors',
        'random text or gibberish',
        'incorrect logos',
        'cluttered layouts',
        'stock-photo appearance',
        'watermarks',
        'distorted UI elements',
        'extra objects'
      ]
    },
    generationParameters: {
      aspectRatio,
      recommendedResolution,
      styleStrength: 0.85,
      creativityLevel: 0.5,
      detailLevel: 'high',
      backgroundPreference: 'gradient'
    },
    referencePriority
  };
}
