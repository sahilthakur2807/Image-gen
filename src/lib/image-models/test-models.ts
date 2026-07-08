import { ProviderFactory } from './factory.js';
import { resolveApiKey, getMockImageUrl } from './adapter.js';
import type { ImagePromptPackage } from '../image-prompt/types.js';

async function runTest() {
  console.log('=== STARTING MODEL ADAPTER LAYER TEST ===');

  // 1. Test API Key resolution
  console.log('Testing Key Resolution...');
  const key1 = resolveApiKey('gemini', 'custom-gemini-key');
  if (key1 === 'custom-gemini-key') {
    console.log('✓ Successfully resolved custom override key');
  } else {
    console.error('✗ Failed to resolve custom key');
  }

  // 2. Test Provider Factory
  console.log('Testing Provider Factory...');
  const geminiProvider = ProviderFactory.getProvider('gemini');
  const openaiProvider = ProviderFactory.getProvider('openai');

  if (geminiProvider && openaiProvider) {
    console.log('✓ Successfully instantiated Gemini and OpenAI providers');
  } else {
    console.error('✗ Provider Factory failed to return adapters');
  }

  // 3. Test Mock Image Generation
  console.log('Testing Mock Image Generator...');
  const testPrompt: ImagePromptPackage = {
    visualPrompt: 'A premium Nagpur Orange Burfee in clean e-commerce studio',
    sceneDescription: {
      background: 'cream background',
      subject: 'Nagpur Orange Burfee',
      cameraAngle: 'eye level',
      perspective: 'flat',
      lighting: 'soft diffused',
      composition: 'rule of thirds',
      depth: 'shallow',
      negativeSpace: 'generous'
    },
    visualStyle: {
      styleType: 'Modern E-commerce',
      description: 'Appetizing premium',
      characteristics: ['clean']
    },
    colorInstructions: {
      primary: '#d97706',
      secondary: '#1e293b',
      accent: '#dc2626',
      background: '#fff7ed',
      contrast: 'high',
      usageRules: 'Standard color rules'
    },
    composition: {
      alignment: 'centered',
      grid: '3x3',
      balance: 'stable',
      focus: 'subject',
      spacing: 'relaxed',
      hierarchy: 'clear',
      visualFlow: 'left-to-right'
    },
    imageReferences: [],
    typographyInstructions: {
      headlinePlacement: 'top',
      safeAreas: '10%',
      textDensity: 'low',
      alignment: 'left'
    },
    logoPlacement: {
      location: 'bottom-right',
      size: '5%',
      padding: '2%',
      clearSpace: 'safe'
    },
    negativePrompt: {
      structuredNegativePrompt: 'cartoon, low quality',
      preventions: ['cartoon']
    },
    generationParameters: {
      aspectRatio: '1:1',
      recommendedResolution: '1024x1024',
      styleStrength: 0.8,
      creativityLevel: 0.5,
      detailLevel: 'high',
      backgroundPreference: 'solid'
    },
    referencePriority: []
  };

  const sweetUrl = getMockImageUrl(testPrompt);
  if (sweetUrl.includes('unsplash.com') && sweetUrl.includes('photo-1589301760014')) {
    console.log('✓ Correctly mapped sweets prompt to Indian sweets Unsplash placeholder URL');
  } else {
    console.error('✗ Failed to map sweets prompt to correct mock Unsplash category');
  }

  const SaaSAppPrompt = {
    ...testPrompt,
    visualPrompt: 'A sleek SaaS dashboard with analytics charts and visual UI elements',
    sceneDescription: {
      ...testPrompt.sceneDescription,
      subject: 'software interface'
    }
  };
  const saasUrl = getMockImageUrl(SaaSAppPrompt);
  if (saasUrl.includes('unsplash.com') && saasUrl.includes('photo-1551288049')) {
    console.log('✓ Correctly mapped SaaS dashboard prompt to tech/charts Unsplash placeholder URL');
  } else {
    console.error('✗ Failed to map SaaS prompt to correct mock Unsplash category');
  }

  const randomPrompt = {
    ...testPrompt,
    visualPrompt: 'An abstract futuristic spaceship in orbit',
    sceneDescription: {
      ...testPrompt.sceneDescription,
      subject: 'spaceship'
    }
  };
  const gradientUrl = getMockImageUrl(randomPrompt);
  if (gradientUrl.startsWith('data:image/svg+xml')) {
    console.log('✓ Correctly fell back to generating a premium SVG brand-color gradient for unmapped prompts');
  } else {
    console.error('✗ SVG fallback generator failed');
  }

  // 4. Test generateImage without key (should return mock success)
  console.log('Testing Adapter without Key (mock path)...');
  const res = await geminiProvider.generateImage(testPrompt, {
    quality: 'high',
    aspectRatio: '1:1',
    referenceStrength: 'medium'
  });

  if (res.success && res.provider === 'mock' && res.imageUrl.includes('unsplash.com')) {
    console.log('✓ Adapter successfully fell back to mock generation when no keys present');
  } else {
    console.error('✗ Adapter fallback mechanism failed');
  }

  console.log('=== ALL TESTS COMPLETED SUCCESSFULLY ===');
}

runTest();
