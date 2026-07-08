import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { startWebsiteCrawl, getWebsiteCrawlStatus } from './src/lib/firecrawl/crawler.js';
import { Logger } from './src/lib/firecrawl/logger.js';

function getRequestBody(req: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: any) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
    req.on('error', (err: any) => {
      reject(err);
    });
  });
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'api-analyze-middleware',
      configureServer(server) {
        server.middlewares.use('/api/analyze', async (req, res) => {
          const urlObj = new URL(req.url || '', `http://${req.headers.host}`);
          const pathname = urlObj.pathname;

          // 1. GET /api/analyze/status?id=...&companyName=...&homepage=...
          if (pathname === '/status' || pathname.endsWith('/status')) {
            if (req.method !== 'GET') {
              res.statusCode = 405;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Method Not Allowed' }));
              return;
            }

            const id = urlObj.searchParams.get('id');
            const companyName = urlObj.searchParams.get('companyName') || 'Brand';
            const homepage = urlObj.searchParams.get('homepage') || '';

            if (!id) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Job ID (id) parameter is required' }));
              return;
            }

            try {
              const statusResult = await getWebsiteCrawlStatus(id, companyName, homepage);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(statusResult));
            } catch (error: any) {
              Logger.error(`[API GET /api/analyze/status] Poll failed for job ID: ${id}`, error);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: error.message || 'Polling failed' }));
            }
            return;
          }

          // 2. POST /api/analyze (Initiates crawl)
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Method Not Allowed' }));
            return;
          }

          let urlToCrawl = '';
          try {
            const body = await getRequestBody(req);
            const { url } = body;
            urlToCrawl = url || '';

            if (!url) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'URL parameter is required' }));
              return;
            }

            Logger.info(`[API POST /api/analyze] Received request for URL: ${url}`);
            const result = await startWebsiteCrawl(url);
            Logger.success(`[API POST /api/analyze] Started crawl job successfully for URL: ${url}`);

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result));
          } catch (error: any) {
            Logger.error(`[API POST /api/analyze] Crawl launch failed for URL: ${urlToCrawl}`, error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message || 'An error occurred during crawling' }));
          }
        });
      }
    }
  ],
});
