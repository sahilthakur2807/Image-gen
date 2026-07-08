import { NextResponse } from 'next/server';
import { generateCreativeBrief } from '../../../src/lib/creative-brief/engine.js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { domain, userRequest } = body;

    if (!domain || !userRequest) {
      return NextResponse.json(
        { error: 'domain and userRequest parameters are required' },
        { status: 400 }
      );
    }

    const cleanDomain = domain.replace('www.', '').split(':')[0].toLowerCase();
    const brief = await generateCreativeBrief(cleanDomain, userRequest);
    return NextResponse.json(brief);
  } catch (error: any) {
    console.error('API Error in /api/creative-brief:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate creative brief' },
      { status: 500 }
    );
  }
}
