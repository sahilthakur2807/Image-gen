import { firecrawlClient } from './client.js';
import { parseHtmlPage } from './parser.js';
import { Logger } from './logger.js';
import { filterAssets } from './asset-filter.js';
import type { ParsedPage } from './parser.js';

export interface CrawlSummary {
  companyName: string;
  homepage: string;
  totalPagesCrawled: number;
  totalImages: number;
  totalInternalLinks: number;
  totalExternalLinks: number;
  pages: ParsedPage[];
  logo: {
    primary: string;
    alternate: string;
  };
  homepageImages: string[];
  totalFilteredImages: number;
  discardedImages: number;
}

function getPageScore(urlStr: string): number {
  try {
    const url = new URL(urlStr);
    const path = url.pathname.toLowerCase();
    
    // Prioritize key corporate directories/pages
    if (path === '/' || path === '') return 10;
    if (path.includes('about')) return 9;
    if (path.includes('pricing')) return 8;
    if (path.includes('features') || path.includes('feature')) return 8;
    if (path.includes('products') || path.includes('product')) return 8;
    if (path.includes('services') || path.includes('service')) return 8;
    if (path.includes('solutions') || path.includes('solution')) return 8;
    if (path.includes('case-studies') || path.includes('case-study')) return 7;
    if (path.includes('blog')) return 6;
    if (path.includes('contact')) return 5;
    
    return 1;
  } catch {
    return 0;
  }
}

function isIgnoredPath(urlStr: string): boolean {
  try {
    const path = new URL(urlStr).pathname.toLowerCase();
    const ignoreKeywords = [
      'privacy', 'terms', 'login', 'signin', 'signup', 'register',
      'careers', 'jobs', 'api', 'docs', 'changelog', 'support', 'help'
    ];
    return ignoreKeywords.some(keyword => path.includes(keyword));
  } catch {
    return true;
  }
}

// 1. Starts async crawl job and returns Job ID
export async function startWebsiteCrawl(targetUrl: string) {
  Logger.clear();
  Logger.info(`=== INITIATING ASYNC CRAWL PROCESS ===`);
  Logger.info(`Target URL: ${targetUrl}`);

  let cleanUrl = targetUrl.trim();
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = 'https://' + cleanUrl;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(cleanUrl);
  } catch (error: any) {
    Logger.error(`Invalid URL provided: ${cleanUrl}`, error);
    throw new Error('Invalid URL format provided.');
  }

  const homepage = parsedUrl.origin;
  const domainParts = parsedUrl.hostname.replace('www.', '').split('.');
  const rawCompanyName = domainParts[0];
  const companyName = rawCompanyName.charAt(0).toUpperCase() + rawCompanyName.slice(1);

  Logger.info(`Parsed Company Name: ${companyName}`);
  Logger.info(`Homepage Origin: ${homepage}`);

  // Exclude glob patterns for crawling (starting with literal slashes to avoid regex conversion syntax errors)
  const excludePaths = [
    '/privacy*', '/terms*', '/login*', '/signup*',
    '/careers*', '/jobs*', '/api*', '/docs*',
    '/changelog*', '/support*', '/help*'
  ];

  Logger.info(`Configured exclude paths: ${excludePaths.join(', ')}`);
  Logger.info(`Sending start crawl job request to Firecrawl SDK...`);

  const crawlResponse = await firecrawlClient.startCrawl(homepage, {
    limit: 8, // limit to 8 pages for fast real-time synchronization
    excludePaths,
    scrapeOptions: {
      formats: ['markdown', 'html']
    }
  });

  if (!crawlResponse.id) {
    Logger.error('Failed to start crawl job. Job ID was not returned.');
    throw new Error('Failed to start crawl: Job ID was not returned.');
  }

  Logger.success(`Crawl job successfully created. Job ID: ${crawlResponse.id}`);
  return {
    jobId: crawlResponse.id,
    companyName,
    homepage
  };
}

// 2. Polls current crawl job status and parses when complete
export async function getWebsiteCrawlStatus(
  jobId: string,
  companyName: string,
  homepage: string
) {
  Logger.info(`Polling crawl status for job: ${jobId}`);
  const crawlJob = await firecrawlClient.getCrawlStatus(jobId);

  Logger.info(`Job status: ${crawlJob.status} | Completed: ${crawlJob.completed}/${crawlJob.total}`);

  // If completed, parse results
  if (crawlJob.status === 'completed') {
    Logger.success(`Crawl job completed. Parsing documents...`);
    const crawlData = crawlJob.data || [];

    // Parse crawled pages
    Logger.info(`Filtering ignored paths and parsing crawled page structures...`);
    const parsedPages: ParsedPage[] = crawlData
      .filter((page: any) => {
        const pageUrl = page.url || page.metadata?.url || page.metadata?.sourceURL;
        return pageUrl && !isIgnoredPath(pageUrl);
      })
      .map((page: any) => {
        const pageUrl = page.url || page.metadata?.url || page.metadata?.sourceURL || '';
        return parseHtmlPage(pageUrl, page.html || '', page.markdown || '', page.metadata || {});
      });

    // Score pages
    const sortedPages = parsedPages.sort((a, b) => getPageScore(b.url) - getPageScore(a.url));
    const selectedPages = sortedPages.slice(0, 7);

    // Compute stats
    let totalImages = 0;
    const uniqueInternalLinks = new Set<string>();
    const uniqueExternalLinks = new Set<string>();

    selectedPages.forEach((page: ParsedPage) => {
      totalImages += page.images.length;
      page.internalLinks.forEach((link: string) => uniqueInternalLinks.add(link));
      page.externalLinks.forEach((link: string) => uniqueExternalLinks.add(link));
    });

    const filtered = filterAssets(selectedPages, homepage);

    const results: CrawlSummary = {
      companyName,
      homepage,
      totalPagesCrawled: selectedPages.length,
      totalImages,
      totalInternalLinks: uniqueInternalLinks.size,
      totalExternalLinks: uniqueExternalLinks.size,
      pages: selectedPages,
      logo: filtered.logo,
      homepageImages: filtered.homepageImages,
      totalFilteredImages: filtered.totalFilteredImages,
      discardedImages: filtered.discardedImages
    };

    Logger.success(`=== CRAWL SUCCESSFUL ===`);
    Logger.success(`Total Subpages Scraped: ${selectedPages.length}`);
    Logger.success(`Total Unique Images Found: ${totalImages}`);
    Logger.success(`Total Internal Links Discovered: ${uniqueInternalLinks.size}`);
    Logger.success(`Total External Links Discovered: ${uniqueExternalLinks.size}`);

    return {
      status: crawlJob.status,
      completed: crawlJob.completed,
      total: crawlJob.total,
      data: crawlJob.data,
      results
    };
  }

  if (crawlJob.status === 'failed') {
    Logger.error(`Firecrawl job failed on backend.`);
  }

  return {
    status: crawlJob.status,
    completed: crawlJob.completed,
    total: crawlJob.total,
    data: crawlJob.data
  };
}

// Keep legacy synchronous crawl function for backward compatibility
export async function crawlWebsite(targetUrl: string): Promise<CrawlSummary> {
  const init = await startWebsiteCrawl(targetUrl);
  let status = await getWebsiteCrawlStatus(init.jobId, init.companyName, init.homepage);
  
  while (status.status === 'scraping') {
    await new Promise(resolve => setTimeout(resolve, 2000));
    status = await getWebsiteCrawlStatus(init.jobId, init.companyName, init.homepage);
  }

  if (status.status !== 'completed' || !status.results) {
    throw new Error(`Crawl failed with status: ${status.status}`);
  }

  return status.results;
}
