import * as cheerio from 'cheerio';
import { Logger } from './logger.js';

export interface ParsedPage {
  url: string;
  title: string;
  metaDescription: string;
  markdownContent: string;
  html: string;
  headings: Record<string, string[]>;
  images: string[];
  internalLinks: string[];
  externalLinks: string[];
  metadata: Record<string, any>;
}

export function parseHtmlPage(url: string, html: string, markdown: string, metadata: any): ParsedPage {
  Logger.info(`Parsing page markup: ${url}`);
  const $ = cheerio.load(html || '');
  
  // Title extraction
  const title = $('title').text().trim() || metadata.title || '';
  
  // Meta description extraction
  const metaDescription = 
    $('meta[name="description"]').attr('content')?.trim() || 
    $('meta[property="og:description"]').attr('content')?.trim() ||
    metadata.description || 
    '';
  
  // Headings
  const headings: Record<string, string[]> = {
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: []
  };
  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    const tagName = el.tagName.toLowerCase();
    const text = $(el).text().trim();
    if (text) {
      headings[tagName].push(text);
    }
  });

  // Images
  const images: string[] = [];
  $('img').each((_, el) => {
    const src = $(el).attr('src');
    if (src) {
      images.push(src);
    }
  });

  // Links
  const internalLinks: string[] = [];
  const externalLinks: string[] = [];
  
  let origin = '';
  try {
    origin = new URL(url).origin;
  } catch {
    // Ignore invalid url origin
  }

  $('a').each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;
    
    const trimmed = href.trim();
    if (trimmed.startsWith('#') || trimmed.startsWith('javascript:')) return;
    
    try {
      const resolvedUrl = new URL(trimmed, url);
      if (resolvedUrl.origin === origin) {
        if (!internalLinks.includes(resolvedUrl.href)) {
          internalLinks.push(resolvedUrl.href);
        }
      } else {
        if (!externalLinks.includes(resolvedUrl.href)) {
          externalLinks.push(resolvedUrl.href);
        }
      }
    } catch {
      // relative link or invalid syntax url
      if (trimmed.startsWith('/') || !trimmed.includes('://')) {
        const fullUrl = origin ? origin + (trimmed.startsWith('/') ? '' : '/') + trimmed : trimmed;
        if (!internalLinks.includes(fullUrl)) {
          internalLinks.push(fullUrl);
        }
      }
    }
  });

  const headingCount = Object.values(headings).reduce((acc, list) => acc + list.length, 0);
  Logger.success(
    `Parsed page: ${url} | Title: "${title}" | Headings: ${headingCount} | Images: ${images.length} | Links: ${internalLinks.length + externalLinks.length}`
  );

  return {
    url,
    title,
    metaDescription,
    markdownContent: markdown || '',
    html: html || '',
    headings,
    images,
    internalLinks,
    externalLinks,
    metadata: metadata || {}
  };
}

export interface EnrichedImage {
  src: string;
  alt: string;
  width: string;
  height: string;
  parentClasses: string;
  parentIds: string;
  isSvg?: boolean;
}

export function extractEnrichedImages(url: string, html: string): EnrichedImage[] {
  const $ = cheerio.load(html || '');
  const images: EnrichedImage[] = [];
  
  let origin = '';
  try {
    origin = new URL(url).origin;
  } catch {
    // Ignore
  }

  $('img').each((_, el) => {
    const src = $(el).attr('src');
    if (!src) return;

    let absoluteSrc = src;
    try {
      absoluteSrc = new URL(src, url).href;
    } catch {
      if (src.startsWith('/') || !src.includes('://')) {
        absoluteSrc = origin ? origin + (src.startsWith('/') ? '' : '/') + src : src;
      }
    }

    const alt = $(el).attr('alt') || '';
    const width = $(el).attr('width') || '';
    const height = $(el).attr('height') || '';
    const parentClasses = $(el).parents().map((_, parentEl) => $(parentEl).attr('class') || '').get().join(' ');
    const parentIds = $(el).parents().map((_, parentEl) => $(parentEl).attr('id') || '').get().join(' ');

    images.push({
      src: absoluteSrc,
      alt,
      width,
      height,
      parentClasses,
      parentIds
    });
  });

  // Extract inline SVGs if they contain logo-like identifiers
  $('svg').each((_, el) => {
    const parentClasses = $(el).parents().map((_, pEl) => $(pEl).attr('class') || '').get().join(' ');
    const parentIds = $(el).parents().map((_, pEl) => $(pEl).attr('id') || '').get().join(' ');
    const id = $(el).attr('id') || '';
    const className = $(el).attr('class') || '';

    const isLogo = 
      parentClasses.toLowerCase().includes('logo') || 
      parentIds.toLowerCase().includes('logo') ||
      id.toLowerCase().includes('logo') ||
      className.toLowerCase().includes('logo');

    if (isLogo) {
      const svgHtml = $.html(el);
      const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svgHtml)}`;
      
      images.push({
        src: dataUri,
        alt: 'SVG Logo',
        width: $(el).attr('width') || '',
        height: $(el).attr('height') || '',
        parentClasses,
        parentIds,
        isSvg: true
      });
    }
  });

  return images;
}
