import type { BrandKnowledge } from '../brand/analyzer.js';
import type { CreativeBrief } from '../creative-brief/types.js';
import type { FilteredAssets } from '../firecrawl/asset-filter.js';

export interface SceneDescription {
  background: string;
  subject: string;
  cameraAngle: string;
  perspective: string;
  lighting: string;
  composition: string;
  depth: string;
  negativeSpace: string;
}

export interface VisualStyleInstructions {
  styleType: string; // e.g., "Modern Editorial", "Luxury Minimal", "Bright SaaS"
  description: string;
  characteristics: string[];
}

export interface ColorInstructions {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  contrast: string;
  usageRules: string;
}

export interface CompositionInstructions {
  alignment: string;
  grid: string;
  balance: string;
  focus: string;
  spacing: string;
  hierarchy: string;
  visualFlow: string;
}

export interface ImageReference {
  role: 'Primary Logo' | 'Alternate Logo' | 'Homepage Screenshot' | 'Hero Image' | 'Dashboard' | 'Product Mockup' | 'Other';
  url: string;
  priority: number;
}

export interface TypographyInstructions {
  headlinePlacement: string;
  safeAreas: string;
  textDensity: string;
  alignment: string;
}

export interface LogoPlacementInstructions {
  location: string;
  size: string;
  padding: string;
  clearSpace: string;
}

export interface NegativePrompt {
  structuredNegativePrompt: string;
  preventions: string[];
}

export interface GenerationParameters {
  aspectRatio: string;
  recommendedResolution: string;
  styleStrength: number; // Scale of 0.0 - 1.0
  creativityLevel: number; // Scale of 0.0 - 1.0
  detailLevel: 'low' | 'medium' | 'high';
  backgroundPreference: string;
}

export interface ReferencePriorityItem {
  referenceName: string;
  priority: number;
}

export interface ImagePromptPackage {
  visualPrompt: string;
  sceneDescription: SceneDescription;
  visualStyle: VisualStyleInstructions;
  colorInstructions: ColorInstructions;
  composition: CompositionInstructions;
  imageReferences: ImageReference[];
  typographyInstructions: TypographyInstructions;
  logoPlacement: LogoPlacementInstructions;
  negativePrompt: NegativePrompt;
  generationParameters: GenerationParameters;
  referencePriority: ReferencePriorityItem[];
}

export interface ImagePromptEngineInput {
  brandKnowledge: BrandKnowledge;
  creativeBrief: CreativeBrief;
  filteredAssets?: FilteredAssets;
  homepageScreenshot?: string;
  productMockups?: string[];
}
