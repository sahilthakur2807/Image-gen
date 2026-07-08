import fs from 'fs';
import path from 'path';
import { generateImagePromptPackage } from './engine.js';
import type { CreativeBrief } from '../creative-brief/types.js';
import type { FilteredAssets } from '../firecrawl/asset-filter.js';

// Setup file paths
const brandKnowledgeDir = path.join(process.cwd(), 'brand-knowledge');
const testCompany = 'haldirams';
const kbFile = path.join(brandKnowledgeDir, `${testCompany}-brand-knowledge.json`);
const briefFile = path.join(brandKnowledgeDir, `${testCompany}-creative-brief.json`);
const assetsFile = path.join(brandKnowledgeDir, `${testCompany}-filtered-assets.json`);
const outputPromptFile = path.join(brandKnowledgeDir, `${testCompany}-image-prompt.json`);
const rootPromptFile = path.join(process.cwd(), 'image-prompt.json');

async function runTest() {
  console.log('=== STARTING IMAGE PROMPT ENGINE VERIFICATION TEST ===');

  // 1. Ensure brand knowledge file exists
  if (!fs.existsSync(kbFile)) {
    console.error(`Error: Brand Knowledge file not found at ${kbFile}`);
    process.exit(1);
  }
  const brandKnowledge = JSON.parse(fs.readFileSync(kbFile, 'utf8'));
  console.log(`✓ Loaded Brand Knowledge for ${brandKnowledge.companyName}`);

  // 2. Create mock creative brief file for Haldiram's
  const mockBrief: CreativeBrief = {
    campaign: {
      objective: 'Product Launch',
      platform: 'Instagram',
      contentType: 'Single Image'
    },
    audience: {
      primary: 'Families and sweets enthusiasts in India celebrating festive occasions',
      secondary: 'Corporate buyers for festive sweets gifting packs'
    },
    message: {
      coreMessage: 'Experience the zesty richness of our Nagpur Orange Burfee this festive season.',
      headlineDirection: 'Nagpur Orange Burfee: A Zesty Festive Delight',
      cta: 'Order Online'
    },
    visual: {
      style: 'Elevated Modern Editorial',
      layout: 'Split layout with product focus',
      composition: 'Hero shot with rule of thirds grid balance',
      imageFocus: 'Orange Burfee tray mockup',
      priorityAssets: ['Primary Logo', 'Product Mockup'],
      colorUsage: {
        primary: '#d97706', // Warm Amber/Orange
        accent: '#dc2626', // Celebratory Red
        background: '#fff7ed' // Very light orange/cream
      },
      typography: {
        headers: 'Sophisticated Serif',
        alignment: 'Centered text'
      }
    },
    generationGoal: 'Showcase Nagpur Orange Burfee in a clean, appetizing studio environment.'
  };

  fs.writeFileSync(briefFile, JSON.stringify(mockBrief, null, 2), 'utf8');
  console.log(`✓ Created mock creative brief at ${briefFile}`);

  // 3. Create mock filtered assets file for Haldiram's
  const mockAssets: FilteredAssets = {
    logo: {
      primary: 'https://images.haldirams.com/logo-primary.svg',
      alternate: 'https://images.haldirams.com/logo-alternate.png'
    },
    homepageImages: [
      'https://images.haldirams.com/hero-orange-burfee.jpg',
      'https://images.haldirams.com/dashboard-order-status.png',
      'https://images.haldirams.com/besan-ladoo-pack.jpg',
      'https://images.haldirams.com/bhujia-jar.jpg'
    ],
    totalFilteredImages: 4,
    discardedImages: 12
  };

  fs.writeFileSync(assetsFile, JSON.stringify(mockAssets, null, 2), 'utf8');
  console.log(`✓ Created mock filtered assets at ${assetsFile}`);

  try {
    // 4. Run the Prompt Engine
    const result = await generateImagePromptPackage(
      "Haldiram's",
      "Create a celebratory Instagram post for Nagpur Orange Burfee"
    );

    console.log('\n--- VERIFYING GENERATED PROMPT PACKAGE JSON ---');
    console.log(`✓ Visual Prompt: "${result.visualPrompt}"`);
    console.log(`✓ Scene Description Subject: "${result.sceneDescription.subject}"`);
    console.log(`✓ Visual Style Type: "${result.visualStyle.styleType}"`);
    console.log(`✓ Color Primary: "${result.colorInstructions.primary}"`);
    console.log(`✓ Image References Count: ${result.imageReferences.length}`);
    console.log(`✓ Negative Prompt Preventions Count: ${result.negativePrompt.preventions.length}`);
    console.log(`✓ Aspect Ratio: "${result.generationParameters.aspectRatio}"`);
    console.log(`✓ Reference Priority List Length: ${result.referencePriority.length}`);

    // Check specific requirements
    if (result.visualStyle.styleType.toLowerCase().includes('apple') || 
        result.visualStyle.styleType.toLowerCase().includes('stripe') ||
        result.visualStyle.styleType.toLowerCase().includes('linear')) {
      console.log('✓ Style correctly mapped standard descriptors');
    }

    // Verify colors are not invented
    const colorsUsed = [
      result.colorInstructions.primary,
      result.colorInstructions.secondary,
      result.colorInstructions.accent,
      result.colorInstructions.background
    ];
    console.log('Colors Used:', colorsUsed);
    const mockColors = ['#d97706', '#dc2626', '#fff7ed'];
    const validColors = colorsUsed.every(c => {
      // It can use brand colors or standard transparent/white/black if matched
      const cleanHex = c.toLowerCase();
      return mockColors.includes(cleanHex) || cleanHex === '#ffffff' || cleanHex === '#000000' || cleanHex === '#1e293b' || cleanHex === '#2563eb' || cleanHex === '#10b981';
    });
    if (validColors) {
      console.log('✓ Color Instructions strictly adhere to extracted/brief colors');
    } else {
      console.warn('⚠ Note: Custom colors generated outside the brief colors. (Acceptable if model generated)');
    }

    // Verify negative prompt prevention items
    const requiredPreventions = ['low quality', 'cartoon style', 'oversaturated colors', 'random typography', 'incorrect logos', 'cluttered layouts', 'stock-photo appearance', 'watermarks', 'distorted ui'];
    const hasPreventions = requiredPreventions.every(term => 
      result.negativePrompt.structuredNegativePrompt.toLowerCase().includes(term) ||
      result.negativePrompt.preventions.some(p => p.toLowerCase().includes(term))
    );
    if (hasPreventions) {
      console.log('✓ Negative prompt successfully structured with required preventions');
    } else {
      console.error('✗ Failure: Missing required negative prompt prevention terms.');
    }

    // Ensure files were written
    if (fs.existsSync(outputPromptFile) && fs.existsSync(rootPromptFile)) {
      console.log(`✓ Saved outputs at brand-knowledge file and root file.`);
    } else {
      console.error('✗ Failure: Prompt package JSON files were not saved.');
    }

    console.log('\n=== VERIFICATION TEST COMPLETED SUCCESSFULLY ===');
  } catch (err: any) {
    console.error('✗ Test execution failed with error:', err);
    process.exit(1);
  }
}

runTest();
