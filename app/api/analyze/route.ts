import { NextResponse } from 'next/server';
import { crawlWebsite } from '../../../src/lib/firecrawl/crawler';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const summary = await crawlWebsite(url);
    return NextResponse.json(summary);
  } catch (error: any) {
    console.error('API Error during website crawl:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during crawling' },
      { status: 500 }
    );
  }
}
