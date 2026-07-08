import { extractEnrichedImages } from './parser.js';
import type { EnrichedImage, ParsedPage } from './parser.js';
import { Logger } from './logger.js';

export interface FilteredAssets {
  logo: {
    primary: string;
    alternate: string;
  };
  homepageImages: string[];
  totalFilteredImages: number;
  discardedImages: number;
}

function getFilename(urlStr: string): string {
  try {
    const pathname = new URL(urlStr).pathname;
    return pathname.substring(pathname.lastIndexOf('/') + 1).toLowerCase();
  } catch {
    return '';
  }
}

export function filterAssets(pages: ParsedPage[], homepageUrl: string): FilteredAssets {
  Logger.info(`=== STARTING ASSET FILTERING STAGE ===`);

  let rawImages: EnrichedImage[] = [];
  let homepageImagesEnriched: EnrichedImage[] = [];

  // 1. Gather all images from crawled pages
  pages.forEach(page => {
    const pageImages = extractEnrichedImages(page.url, page.html);
    const isHome = page.url.trim().replace(/\/$/, '') === homepageUrl.trim().replace(/\/$/, '');
    
    if (isHome) {
      homepageImagesEnriched.push(...pageImages);
    }
    rawImages.push(...pageImages);
  });

  const totalRawCount = rawImages.length;
  Logger.info(`Found Raw Images across all pages: ${totalRawCount}`);

  // Helpers for classifications
  const iconKeywords = [
    'icon', 'avatar', 'partner', 'sponsor', 'client', 'badge', 'award', 'footer',
    'menu', 'arrow', 'chevron', 'button', 'loading', 'gif', 'pixel', 'banner_ad',
    'ad_', 'placeholder', 'texture', 'shape', 'emoji', 'pattern', 'facebook',
    'twitter', 'linkedin', 'instagram', 'youtube', 'github', 'social', 'widget'
  ];

  const smallImagePatterns = [
    '16x16', '24x24', '32x32', '48x48', '64x64', '128x128', '200x200'
  ];

  let removedIcons = 0;
  let removedSmall = 0;
  let removedDuplicates = 0;

  // Track unique image links
  const seenUrls = new Set<string>();
  const seenFilenames = new Set<string>();

  // Helper to determine if image should be classified as icon
  const isIcon = (img: EnrichedImage) => {
    const urlLower = img.src.toLowerCase();
    const altLower = img.alt.toLowerCase();
    const classLower = img.parentClasses.toLowerCase();
    const idLower = img.parentIds.toLowerCase();

    // Check SVG icons
    if (img.isSvg && !urlLower.includes('logo') && !altLower.includes('logo') && !classLower.includes('logo')) {
      return true;
    }

    return iconKeywords.some(keyword => 
      urlLower.includes(keyword) || 
      altLower.includes(keyword) || 
      classLower.includes(keyword) || 
      idLower.includes(keyword)
    );
  };

  // Helper to determine if image is small (<250x250)
  const isSmall = (img: EnrichedImage) => {
    const urlLower = img.src.toLowerCase();

    // Parse attributes
    const w = parseInt(img.width || '999');
    const h = parseInt(img.height || '999');
    if (w < 250 || h < 250) {
      return true;
    }

    return smallImagePatterns.some(pattern => urlLower.includes(pattern));
  };

  // Filter lists
  const filteredList: EnrichedImage[] = [];

  rawImages.forEach(img => {
    // 1. Filter out icons
    if (isIcon(img)) {
      removedIcons++;
      return;
    }

    // 2. Filter out small assets
    if (isSmall(img)) {
      removedSmall++;
      return;
    }

    // Normalize URL for duplicate checks
    let normUrl = img.src.split('?')[0].toLowerCase().trim().replace(/\/$/, '');
    const filename = getFilename(img.src);

    // 3. Filter duplicates
    if (seenUrls.has(normUrl) || (filename && seenFilenames.has(filename))) {
      removedDuplicates++;
      return;
    }

    seenUrls.add(normUrl);
    if (filename) seenFilenames.add(filename);

    filteredList.push(img);
  });

  // LOGO EXTRACTION
  const logoCandidates: { img: EnrichedImage; score: number }[] = [];

  rawImages.forEach(img => {
    const urlLower = img.src.toLowerCase();
    const altLower = img.alt.toLowerCase();
    const classLower = img.parentClasses.toLowerCase();
    const idLower = img.parentIds.toLowerCase();

    let score = 0;

    if (urlLower.includes('logo-dark') || urlLower.includes('dark-logo') || urlLower.includes('logo_dark')) {
      score += 15;
    } else if (urlLower.includes('logo-light') || urlLower.includes('light-logo') || urlLower.includes('logo_light')) {
      score += 12;
    } else if (urlLower.includes('logo') || altLower.includes('logo') || classLower.includes('logo') || idLower.includes('logo')) {
      score += 10;
    } else if (urlLower.includes('brand') || altLower.includes('brand')) {
      score += 8;
    } else if (urlLower.includes('favicon') || altLower.includes('favicon')) {
      score += 3;
    }

    if (img.isSvg) {
      score += 2;
    }

    if (score > 0) {
      logoCandidates.push({ img, score });
    }
  });

  // Sort logo candidates
  logoCandidates.sort((a, b) => b.score - a.score);

  // Select primary & alternate logos (up to 2)
  const uniqueLogoUrls: string[] = [];
  logoCandidates.forEach(cand => {
    const norm = cand.img.src.split('?')[0].toLowerCase().trim();
    if (uniqueLogoUrls.length < 2 && !uniqueLogoUrls.includes(norm)) {
      uniqueLogoUrls.push(cand.img.src);
    }
  });

  const logoPrimary = uniqueLogoUrls[0] || '';
  const logoAlternate = uniqueLogoUrls[1] || '';
  const detectedLogosCount = uniqueLogoUrls.length;

  // HOMEPAGE HERO / VISUAL IMAGES EXTRACTION
  // Prioritize homepage assets. If homepage has suitable images, ignore subpage images.
  const homeFiltered = filteredList.filter(img => 
    homepageImagesEnriched.some(homeImg => homeImg.src.split('?')[0] === img.src.split('?')[0])
  );

  const imagesSource = (homeFiltered.length >= 3) ? homeFiltered : filteredList;

  const scoredHomeImages: { img: EnrichedImage; score: number }[] = [];

  imagesSource.forEach(img => {
    // Skip if it is selected as a logo
    if (img.src === logoPrimary || img.src === logoAlternate) return;

    const urlLower = img.src.toLowerCase();
    const altLower = img.alt.toLowerCase();
    const classLower = img.parentClasses.toLowerCase();
    const idLower = img.parentIds.toLowerCase();

    let score = 0;

    // Prioritize sections
    if (urlLower.includes('hero') || altLower.includes('hero') || classLower.includes('hero') || idLower.includes('hero')) {
      score += 10;
    } else if (urlLower.includes('mockup') || urlLower.includes('device') || urlLower.includes('screen') || urlLower.includes('dashboard')) {
      score += 9;
    } else if (urlLower.includes('product') || urlLower.includes('feature')) {
      score += 8;
    } else if (urlLower.includes('illustration') || urlLower.includes('graphic') || urlLower.includes('visual')) {
      score += 7;
    } else if (urlLower.includes('banner') || altLower.includes('banner')) {
      score += 6;
    } else {
      score += 1; // standard subpage image
    }

    scoredHomeImages.push({ img, score });
  });

  scoredHomeImages.sort((a, b) => b.score - a.score);

  const selectedHomepageImages: string[] = [];
  scoredHomeImages.forEach(item => {
    if (selectedHomepageImages.length < 8) {
      selectedHomepageImages.push(item.img.src);
    }
  });

  const selectedHomepageImagesCount = selectedHomepageImages.length;
  const discardedCount = totalRawCount - selectedHomepageImagesCount - detectedLogosCount;

  // Print structured outputs exactly matching the required logger block format
  Logger.info(`Found Images: ${totalRawCount}`);
  Logger.info(`↓`);
  Logger.info(`Removed Icons: ${removedIcons}`);
  Logger.info(`↓`);
  Logger.info(`Removed Small Images: ${removedSmall}`);
  Logger.info(`↓`);
  Logger.info(`Removed Duplicates: ${removedDuplicates}`);
  Logger.info(`↓`);
  Logger.info(`Detected Logos: ${detectedLogosCount}`);
  Logger.info(`↓`);
  Logger.info(`Selected Homepage Hero Images: ${selectedHomepageImagesCount}`);
  Logger.info(`↓`);
  Logger.info(`Final Assets: ${detectedLogosCount + selectedHomepageImagesCount}`);

  return {
    logo: {
      primary: logoPrimary,
      alternate: logoAlternate
    },
    homepageImages: selectedHomepageImages,
    totalFilteredImages: selectedHomepageImagesCount,
    discardedImages: discardedCount
  };
}
