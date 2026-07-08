import { NextResponse } from 'next/server';
import { getWebsiteCrawlStatus } from '../../../../src/lib/firecrawl/crawler.js';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const companyName = searchParams.get('companyName') || 'Brand';
    const homepage = searchParams.get('homepage') || '';

    if (!id) {
      return NextResponse.json({ error: 'Job ID (id) parameter is required' }, { status: 400 });
    }

    const statusResult = await getWebsiteCrawlStatus(id, companyName, homepage);
    return NextResponse.json(statusResult);
  } catch (error: any) {
    console.error('API Error during status poll:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during polling' },
      { status: 500 }
    );
  }
}
