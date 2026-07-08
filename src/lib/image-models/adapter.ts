import type { ImagePromptPackage } from '../image-prompt/types.js';

export function resolveApiKey(provider: 'gemini' | 'openai', customKey?: string): string {
  if (customKey && customKey.trim().length > 0) {
    return customKey.trim();
  }

  const envKey = provider === 'gemini' 
    ? process.env.GEMINI_API_KEY 
    : process.env.OPENAI_API_KEY;

  if (!envKey || envKey.includes('YOUR_API_KEY')) {
    return '';
  }

  return envKey;
}

export function getMockImageUrl(prompt: ImagePromptPackage): string {
  const vp = (prompt.visualPrompt || '').toLowerCase();
  const brand = (prompt.sceneDescription?.subject || '').toLowerCase();

  // 1. Nagpur Orange Burfee / Sweets / Haldiram's
  if (vp.includes('burfee') || vp.includes('sweet') || vp.includes('haldiram') || brand.includes('burfee')) {
    return 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=1080&auto=format&fit=crop&q=80';
  }

  // 2. Burger / Burger King / Fast Food
  if (vp.includes('burger') || vp.includes('king') || vp.includes('fast food') || brand.includes('burger')) {
    return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1080&auto=format&fit=crop&q=80';
  }

  // 3. SaaS / Tech Dashboard / Analytics / Charts
  if (vp.includes('dashboard') || vp.includes('analytics') || vp.includes('chart') || vp.includes('saas') || vp.includes('software')) {
    return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1080&auto=format&fit=crop&q=80';
  }

  // 4. General Premium Workspace / Tech Device / Keyboard
  if (vp.includes('workspace') || vp.includes('device') || vp.includes('office') || vp.includes('minimal')) {
    return 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1080&auto=format&fit=crop&q=80';
  }

  // 5. Dynamic brand color SVG gradient
  const primary = prompt.colorInstructions?.primary || '#2563eb';
  const secondary = prompt.colorInstructions?.secondary || '#1e293b';
  const accent = prompt.colorInstructions?.accent || '#10b981';
  const bg = prompt.colorInstructions?.background || '#ffffff';

  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bg}" />
          <stop offset="50%" stop-color="${primary}" stop-opacity="0.1" />
          <stop offset="100%" stop-color="${secondary}" stop-opacity="0.2" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.3" />
          <stop offset="100%" stop-color="${primary}" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="1080" height="1080" fill="url(#bgGrad)" />
      
      <!-- Abstract shapes -->
      <circle cx="540" cy="540" r="300" fill="url(#glow)" filter="blur(40px)" />
      <rect x="290" y="290" width="500" height="500" rx="40" fill="none" stroke="${primary}" stroke-width="8" stroke-opacity="0.4" transform="rotate(45, 540, 540)" />
      <rect x="340" y="340" width="400" height="400" rx="30" fill="none" stroke="${accent}" stroke-width="4" stroke-opacity="0.3" transform="rotate(15, 540, 540)" />
      
      <!-- Safe margins grid indicators -->
      <rect x="54" y="54" width="972" height="972" fill="none" stroke="${primary}" stroke-width="2" stroke-opacity="0.1" stroke-dasharray="10 10" />
      
      <!-- Central placeholder card representing subject -->
      <rect x="390" y="440" width="300" height="200" rx="20" fill="#ffffff" fill-opacity="0.9" stroke="${primary}" stroke-width="2" />
      <text x="540" y="520" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" fill="${secondary}" text-anchor="middle">AI Visual Canvas</text>
      <text x="540" y="550" font-family="system-ui, sans-serif" font-size="14" fill="${primary}" text-anchor="middle">Subject: ${prompt.visualStyle?.styleType || 'Abstract Style'}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;
}
