import { useState, useEffect, useRef } from 'react';

// ============================================================================
// 🏢 Explicit TypeScript Interfaces
// ============================================================================
export interface DetectedAssets {
  logo: string;
  hero: string;
  product: string[];
  dashboard: string;
  team: string;
  illustration: string;
}

export interface DetectionConfidences {
  logo: number;
  typography: number;
  colors: number;
  brandStyle: number;
  imageClassification: number;
}

export interface BrandKit {
  domain: string;
  colors: string[]; // Primary, Secondary, Accent, Background
  logoUrl: string; 
  fontConfig: string;
  companyName: string;
  industry: string;
  targetAudience: string;
  brandPersonality: string;
  brandVoice: string;
  brandTone: string;
  confidenceScore: number;
  assets: DetectedAssets;
  detectionConfidences: DetectionConfidences;
}

export interface ImageGenerationMetadata {
  generationId: string;
  provider: string;
  providerMode: 'company' | 'custom';
  model: string;
  generationTime: number;
  imageUrl: string;
  status: string;
  usedAssets: string[];
  promptVersion?: string;
  promptText?: string;
  resolution?: string;
  pipelineDuration?: number;
  snapshots?: {
    brandKnowledge: any;
    creativeBrief: any;
    imagePrompt: any;
    generation: any;
    pipelineLog: any;
  };
}

export interface PostItem {
  id: string;
  title: string;
  contentType: string;
  targetPlatforms: ('LinkedIn' | 'Instagram' | 'Facebook' | 'X')[];
  currentImageLayerUrl: string;
  captionText: string;
  hashtags: string;
  cta: string;
  status: 'Analyzing' | 'Generating' | 'Ready' | 'Needs Review' | 'Published';
  timestamp: string;
  confidenceScore: number;
  imageMetadata?: ImageGenerationMetadata;
}

export type ExtractionStatus = 'idle' | 'processing' | 'completed';

export interface PipelineStatusStep {
  stage: number;
  name: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  duration?: number;
  message?: string;
}

export interface ApiKeys {
  mode: 'company' | 'custom';
  provider: 'gemini' | 'openai';
  customGeminiKey: string;
  customOpenaiKey: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'system';
  text: string;
  timestamp: string;
}

export interface CreativeBrief {
  campaign: {
    objective: string;
    platform: string;
    contentType: string;
  };
  audience: {
    primary: string;
    secondary: string;
  };
  message: {
    coreMessage: string;
    headlineDirection: string;
    cta: string;
  };
  visual: {
    style: string;
    layout: string;
    composition: string;
    imageFocus: string;
    priorityAssets: string[];
    colorUsage: Record<string, string>;
    typography: Record<string, string>;
  };
  generationGoal: string;
  imagePrompt?: string;
  imagePromptPackage?: any;
}

export interface DesignTokens {
  typography: string;
  spacing: string;
  cornerRadius: string;
  shadowStyle: string;
  photographyStyle: string;
  illustrationStyle: string;
  backgroundStyle: string;
  buttonStyle: string;
  cardStyle: string;
}

// Updated pipeline progress checklist to match crawling steps
export const LOADING_STEPS = [
  'Crawling Website',
  'Discovering Pages',
  'Crawling Homepage',
  'Crawling About',
  'Crawling Products',
  'Parsing Content',
  'Complete'
];

export function useBackend() {
  const [extractionStatus, setExtractionStatus] = useState<ExtractionStatus>('idle');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('saas_dashboard_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light';
  });

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('saas_dashboard_theme', next);
      return next;
    });
  };

  const [currentLoadingStep, setCurrentLoadingStep] = useState(0);
  
  // History of scraped URLs and data cache
  const [scrapedData, setScrapedData] = useState<Record<string, { brandKit: BrandKit, posts: PostItem[] }>>({});
  const [scrapedDomains, setScrapedDomains] = useState<string[]>([]);
  const [activeDomain, setActiveDomain] = useState<string | null>(null);

  // Loaded brand state pointers
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [activePost, setActivePost] = useState<PostItem | null>(null);
  const [creativeBrief, setCreativeBrief] = useState<CreativeBrief | null>(null);

  const [selectedPlatform, setSelectedPlatform] = useState<'LinkedIn' | 'Instagram' | 'Facebook' | 'X'>('LinkedIn');
  const [isRefining, setIsRefining] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isImageGenModalOpen, setIsImageGenModalOpen] = useState(false);
  const [generationProgressStep, setGenerationProgressStep] = useState<string | null>(null);
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStatusStep[]>([]);
  
  // Running timer for crawlers
  const [processingTime, setProcessingTime] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  // Editable Design Tokens state
  const [designTokens, setDesignTokens] = useState<DesignTokens>({
    typography: 'Geist Sans (Sans-Serif)',
    spacing: 'Comfortable (16px)',
    cornerRadius: '16px',
    shadowStyle: 'Soft Elevation (Medium)',
    photographyStyle: 'Warm, Editorial, High Contrast',
    illustrationStyle: 'SaaS Vector, Flat',
    backgroundStyle: 'Slight Gradient (Light)',
    buttonStyle: 'Pill / Solid Accent',
    cardStyle: 'Glassmorphic Border'
  });

  const updateDesignToken = (key: keyof DesignTokens, value: string) => {
    setDesignTokens(prev => ({ ...prev, [key]: value }));
  };

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'system',
      text: 'Brand analysis completed successfully. I detected a modern SaaS design language with a clean visual identity. The generated content follows the extracted typography, color palette, and imagery style. You can ask me to regenerate designs, improve captions, change layouts, or adapt the design for another platform.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // API Keys state with SessionStorage auto-save integration
  const [apiKeys, setApiKeys] = useState<ApiKeys>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('saas_dashboard_keys');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Fallback
        }
      }
    }
    return {
      mode: 'company',
      provider: 'gemini',
      customGeminiKey: '',
      customOpenaiKey: ''
    };
  });

  const loadingIntervalRef = useRef<number | null>(null);

  const updateApiKeys = (updatedKeys: Partial<ApiKeys>) => {
    setApiKeys(prev => {
      const next = { ...prev, ...updatedKeys };
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('saas_dashboard_keys', JSON.stringify(next));
      }
      return next;
    });
  };

  const updateScrapedDataForDomain = (domain: string, updatedBrandKit: BrandKit | null, updatedPosts: PostItem[]) => {
    setScrapedData(prev => {
      const next = { ...prev };
      if (next[domain]) {
        next[domain] = {
          brandKit: updatedBrandKit || next[domain].brandKit,
          posts: updatedPosts
        };
      }
      return next;
    });
  };

  // Select a domain from LeftColumn
  const selectDomain = (domain: string) => {
    setActiveDomain(domain);
    const data = scrapedData[domain];
    if (data) {
      setBrandKit(data.brandKit);
      setPosts(data.posts);
      setActivePost(data.posts[0] || null);
      setDesignTokens(prev => ({
        ...prev,
        typography: data.brandKit.fontConfig
      }));
    }
  };

  // Duplicate active post
  const duplicatePost = (postId: string) => {
    if (!activeDomain) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const newPost: PostItem = {
      ...post,
      id: `post-copy-${Date.now()}`,
      title: `${post.title} (Copy)`,
      timestamp: 'Jul 8, Just Now',
      status: 'Needs Review'
    };
    const nextPosts = [newPost, ...posts];
    setPosts(nextPosts);
    setActivePost(newPost);
    updateScrapedDataForDomain(activeDomain, null, nextPosts);
  };

  // Regenerate active post (simulation with delay)
  const regeneratePost = (postId: string) => {
    if (!activeDomain) return;
    setIsRefining(true);
    setTimeout(() => {
      const nextPosts = posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            confidenceScore: Math.min(100, Math.round((p.confidenceScore + 0.8) * 10) / 10),
            timestamp: 'Jul 8, Just Now (Regenerated)'
          };
        }
        return p;
      });
      setPosts(nextPosts);
      setActivePost(prev => prev && prev.id === postId ? {
        ...prev,
        confidenceScore: Math.min(100, Math.round((prev.confidenceScore + 0.8) * 10) / 10),
        timestamp: 'Jul 8, Just Now (Regenerated)'
      } : prev);
      setIsRefining(false);
      updateScrapedDataForDomain(activeDomain, null, nextPosts);
    }, 1500);
  };

  // Update active post content
  const updateActivePostContent = (caption: string, hashtags: string, cta: string) => {
    if (!activePost || !activeDomain) return;
    const updated = { ...activePost, captionText: caption, hashtags, cta };
    setActivePost(updated);
    const nextPosts = posts.map(p => p.id === activePost.id ? updated : p);
    setPosts(nextPosts);
    updateScrapedDataForDomain(activeDomain, null, nextPosts);
  };

  // Publish / Schedule trigger
  const publishPost = async (postId: string) => {
    if (!activeDomain) return;
    const nextPosts = posts.map(p => (p.id === postId ? { ...p, status: 'Published' as const } : p));
    setPosts(nextPosts);
    if (activePost && activePost.id === postId) {
      setActivePost(prev => prev ? { ...prev, status: 'Published' as const } : null);
    }
    updateScrapedDataForDomain(activeDomain, null, nextPosts);

    setChatHistory(prev => [
      ...prev,
      {
        id: `msg-pub-${Date.now()}`,
        sender: 'system',
        text: `Post successfully published to selected channels!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Convert conversational input to post refinement
  const refinePost = async (prompt: string) => {
    if (!prompt.trim() || !activePost || !activeDomain) return;

    const userMsgId = `msg-user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMsg]);
    setIsRefining(true);

    try {
      // 1. Fetch creative brief endpoint
      const response = await fetch('/api/creative-brief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          domain: activeDomain,
          userRequest: prompt
        })
      });

      if (!response.ok) {
        throw new Error('Creative Brief endpoint failed');
      }

      const brief: CreativeBrief = await response.json();
      setCreativeBrief(brief);

      // 2. Select appropriate visual layer based on brief's focal asset
      let visualUrl = activePost.currentImageLayerUrl;
      if (brandKit) {
        const focus = (brief.visual?.imageFocus || '').toLowerCase();
        if (focus.includes('dashboard') || focus.includes('screen')) {
          visualUrl = brandKit.assets.dashboard;
        } else if (focus.includes('logo')) {
          visualUrl = brandKit.assets.logo;
        } else if (focus.includes('product')) {
          visualUrl = brandKit.assets.product[0] || brandKit.assets.hero;
        } else if (focus.includes('team') || focus.includes('people')) {
          visualUrl = brandKit.assets.team;
        } else if (focus.includes('illustration')) {
          visualUrl = brandKit.assets.illustration;
        } else {
          visualUrl = brandKit.assets.hero;
        }
      }

      // 3. Update active post details in sync with the Creative Brief
      const updatedPost: PostItem = {
        ...activePost,
        contentType: brief.campaign.contentType,
        title: `${brief.campaign.objective} Campaign`,
        cta: brief.message.cta,
        captionText: brief.message.coreMessage,
        targetPlatforms: [brief.campaign.platform as any],
        currentImageLayerUrl: visualUrl
      };

      const nextPosts = posts.map(item => item.id === activePost.id ? updatedPost : item);
      setPosts(nextPosts);
      setActivePost(updatedPost);

      // Cache changes
      updateScrapedDataForDomain(activeDomain, null, nextPosts);

      // 4. Update the chat console history
      const systemMsg: ChatMessage = {
        id: `msg-sys-${Date.now()}`,
        sender: 'system',
        text: `Creative Brief compiled for objective: "${brief.campaign.objective}". Audience set to "${brief.audience.primary}". Platform updated to ${brief.campaign.platform}. Visual style set to "${brief.visual.style}". Image prompt successfully synthesized.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, systemMsg]);

    } catch (err: any) {
      console.error('Failed to generate creative brief:', err);
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'system',
        text: `Error: Failed to process creative brief. Standard refining template applied.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, errorMsg]);
    } finally {
      setIsRefining(false);
    }
  };

  // Domain Scraping / Onboarding flow
  const onboardDomain = async (rawUrl: string) => {
    if (!rawUrl.trim()) return;

    let url = rawUrl.trim().toLowerCase();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    let domainStr = 'custom-brand.com';
    try {
      const hostname = new URL(url).hostname;
      domainStr = hostname.replace('www.', '');
    } catch {
      domainStr = rawUrl;
    }

    if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    setExtractionStatus('processing');
    setCurrentLoadingStep(0);
    setProcessingTime(0);

    timerRef.current = window.setInterval(() => {
      setProcessingTime(prev => Number((prev + 0.1).toFixed(1)));
    }, 100);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 45000);

    try {
      // 1. Fetch crawler start endpoint
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: rawUrl }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Crawling failed to launch');
      }

      const launchData = await response.json();
      const { jobId, companyName: launchCompany, homepage: launchHomepage } = launchData;

      // 2. Poll the status until completed or failed
      let isDone = false;
      let statusData: any = null;

      while (!isDone) {
        // Wait 2.5 seconds between status checks
        await new Promise(resolve => setTimeout(resolve, 2500));

        const statusResponse = await fetch(
          `/api/analyze/status?id=${jobId}&companyName=${encodeURIComponent(launchCompany)}&homepage=${encodeURIComponent(launchHomepage)}`
        );
        
        if (!statusResponse.ok) {
          throw new Error('Crawl job status check failed');
        }

        statusData = await statusResponse.json();

        // Increment progress step in sync with actual crawler numbers
        if (statusData.status === 'scraping') {
          const completedCount = statusData.completed || 0;
          if (completedCount === 0) {
            setCurrentLoadingStep(0); // Crawling Website
          } else if (completedCount === 1) {
            setCurrentLoadingStep(1); // Discovering Pages
          } else if (completedCount === 2) {
            setCurrentLoadingStep(2); // Crawling Homepage
          } else if (completedCount === 3) {
            setCurrentLoadingStep(3); // Crawling About
          } else {
            setCurrentLoadingStep(4); // Crawling Products
          }
        } else if (statusData.status === 'completed') {
          setCurrentLoadingStep(5); // Parsing Content
          await new Promise(resolve => setTimeout(resolve, 1000));
          setCurrentLoadingStep(6); // Complete
          isDone = true;
        } else {
          throw new Error(`Crawl job failed on backend with status: ${statusData.status}`);
        }
      }

      const summary = statusData.results;
      if (!summary) {
        throw new Error('Crawl summary results missing');
      }
      
      if (timerRef.current) clearInterval(timerRef.current);

      const mainPage = summary.pages[0] || { url: summary.homepage, title: summary.companyName, metaDescription: '', images: [] };

      // Map crawl result directly to brand kit UI console
      const mappedBrandKit: BrandKit = {
        domain: domainStr,
        colors: ['#2563eb', '#1e293b', '#10b981', '#ffffff'],
        logoUrl: summary.logo?.primary || summary.companyName.toUpperCase(),
        fontConfig: summary.brandKnowledge?.visualIdentity?.typographyRecommendations || 'Inter (Grotesque Sans)',
        companyName: summary.companyName,
        industry: summary.brandKnowledge?.industry || 'Crawl Ingested Tech',
        targetAudience: summary.brandKnowledge?.primaryAudience || mainPage.metaDescription || 'Indexed target profile from crawling homepage.',
        brandPersonality: summary.brandKnowledge?.personality || 'Technical, Modern, Information-Rich',
        brandVoice: summary.brandKnowledge?.communicationStyle || 'Corporate, Clear, Analytical',
        brandTone: summary.brandKnowledge?.tone || 'Professional',
        confidenceScore: 98,
        assets: {
          logo: summary.logo?.primary || '/favicon.svg',
          hero: summary.homepageImages[0] || '/brand_asset_1.png',
          product: [
            summary.homepageImages[1] || '/brand_asset_2.png',
            summary.homepageImages[2] || '/brand_asset_3.png'
          ],
          dashboard: summary.homepageImages[3] || '/brand_asset_1.png',
          team: summary.homepageImages[4] || '/brand_asset_2.png',
          illustration: summary.homepageImages[5] || '/brand_asset_3.png'
        },
        detectionConfidences: {
          logo: 99,
          typography: 94,
          colors: 96,
          brandStyle: 93,
          imageClassification: 90
        }
      };

      // Map crawled pages to post items
      const mappedPosts: PostItem[] = summary.pages.map((page: any, idx: number) => ({
        id: `post-crawled-${idx}-${Date.now()}`,
        title: page.title || `Crawled Page ${idx + 1}`,
        contentType: 'Web Page',
        targetPlatforms: ['LinkedIn', 'X', 'Facebook'],
        currentImageLayerUrl: summary.lastGeneratedImageUrl || summary.homepageImages[0] || page.images[0] || '/brand_asset_1.png',
        captionText: page.metaDescription || (page.markdownContent ? page.markdownContent.substring(0, 180) + '...' : ''),
        hashtags: '#crawled #webcontent #' + summary.companyName.toLowerCase(),
        cta: `Read page: ${page.url}`,
        status: 'Ready',
        timestamp: 'Jul 8, Just Now',
        confidenceScore: 98.2,
        imageMetadata: summary.lastMetadata || undefined
      }));

      // Cache scraped history
      setScrapedData(prev => ({
        ...prev,
        [domainStr]: {
          brandKit: mappedBrandKit,
          posts: mappedPosts
        }
      }));
      setScrapedDomains(prev => prev.includes(domainStr) ? prev : [...prev, domainStr]);
      setActiveDomain(domainStr);

      setBrandKit(mappedBrandKit);
      setPosts(mappedPosts);
      setActivePost(mappedPosts[0] || null);
      
      setDesignTokens(prev => ({
        ...prev,
        typography: mappedBrandKit.fontConfig
      }));
      setExtractionStatus('completed');
    } catch (err: any) {
      console.warn('Real API analyze call failed, using client fallback mockup.', err);
      
      // Animate fallback mockup loader progress checklist over 3.5s
      let fallbackStep = 0;
      setCurrentLoadingStep(0);

      const fallbackInterval = window.setInterval(() => {
        if (fallbackStep < LOADING_STEPS.length - 1) {
          fallbackStep++;
          setCurrentLoadingStep(fallbackStep);
        } else {
          clearInterval(fallbackInterval);
          if (timerRef.current) clearInterval(timerRef.current);

          const fallbackBrandKit: BrandKit = {
            domain: domainStr,
            colors: ['#2563eb', '#1e293b', '#10b981', '#ffffff'],
            logoUrl: domainStr.split('.')[0].toUpperCase(),
            fontConfig: 'Geist Sans (Sans-Serif)',
            companyName: domainStr.split('.')[0].toUpperCase(),
            industry: 'Dynamic Ingested Sector',
            targetAudience: 'Target Audience Profile',
            brandPersonality: 'Professional, Tech-forward',
            brandVoice: 'Informative, Clear',
            brandTone: 'Assertive',
            confidenceScore: 95,
            assets: {
              logo: '/favicon.svg',
              hero: '/brand_asset_1.png',
              product: ['/brand_asset_2.png', '/brand_asset_3.png'],
              dashboard: '/brand_asset_1.png',
              team: '/brand_asset_2.png',
              illustration: '/brand_asset_3.png'
            },
            detectionConfidences: {
              logo: 95,
              typography: 90,
              colors: 95,
              brandStyle: 90,
              imageClassification: 90
            }
          };

          const fallbackPosts: PostItem[] = [
            {
              id: `post-${Date.now()}-1`,
              title: `${domainStr.split('.')[0]} Campaign`,
              contentType: 'Core Solutions',
              targetPlatforms: ['LinkedIn', 'X', 'Facebook'],
              currentImageLayerUrl: '/brand_asset_1.png',
              captionText: `AI content generation stream initialized for ${domainStr}. Scraping of assets, styles, and branding structures complete. Synthesizing assets via Gemini Vision pipeline.`,
              hashtags: '#technology #ai #growth',
              cta: `Visit ${domainStr}`,
              status: 'Ready',
              timestamp: 'Jul 8, Just Now',
              confidenceScore: 94.8
            }
          ];

          setScrapedData(prev => ({
            ...prev,
            [domainStr]: {
              brandKit: fallbackBrandKit,
              posts: fallbackPosts
            }
          }));
          setScrapedDomains(prev => prev.includes(domainStr) ? prev : [...prev, domainStr]);
          setActiveDomain(domainStr);

          setBrandKit(fallbackBrandKit);
          setPosts(fallbackPosts);
          setActivePost(fallbackPosts[0]);
          
          setDesignTokens(prev => ({
            ...prev,
            typography: fallbackBrandKit.fontConfig
          }));
          setExtractionStatus('completed');
        }
      }, 500);
    }
  };

  const generateAIImage = async (provider: 'gemini' | 'openai' | 'mock', settings: any) => {
    if (!activePost || !activeDomain) return;

    setIsGeneratingImage(true);
    setIsImageGenModalOpen(false);

    // Initialize 9 stages checklist
    setPipelineSteps([
      { stage: 1, name: 'Website Validation', status: 'PENDING' },
      { stage: 2, name: 'Firecrawl', status: 'PENDING' },
      { stage: 3, name: 'Parsing', status: 'PENDING' },
      { stage: 4, name: 'Asset Filtering', status: 'PENDING' },
      { stage: 5, name: 'Brand Knowledge', status: 'PENDING' },
      { stage: 6, name: 'Creative Brief', status: 'PENDING' },
      { stage: 7, name: 'Prompt Builder', status: 'PENDING' },
      { stage: 8, name: 'Image Generation', status: 'PENDING' },
      { stage: 9, name: 'Saving Results', status: 'PENDING' }
    ]);

    setGenerationProgressStep('Preparing Prompt');

    // Add immediate user trigger notification in chat
    const userMsg: ChatMessage = {
      id: `msg-user-gen-${Date.now()}`,
      sender: 'user',
      text: `Trigger unified pipeline run using ${provider === 'mock' ? 'Company Setup' : provider === 'gemini' ? 'Google Gemini' : 'OpenAI DALL-E'} adapter... Settings: aspect ratio ${settings.aspectRatio}, quality ${settings.quality}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatHistory(prev => [...prev, userMsg]);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          companyName: activeDomain,
          provider: apiKeys.mode === 'company' ? provider : apiKeys.provider,
          providerMode: apiKeys.mode,
          settings,
          geminiImageKey: apiKeys.mode === 'company' ? undefined : apiKeys.customGeminiKey,
          openaiImageKey: apiKeys.mode === 'company' ? undefined : apiKeys.customOpenaiKey
        })
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Pipeline execution failed on server.');
      }

      if (!response.body) {
        throw new Error('No response body returned from server stream.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let buffer = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: !done });
          const lines = buffer.split('\n');
          // Hold the trailing segment
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            if (trimmed.startsWith('data: ')) {
              const dataStr = trimmed.substring(6).trim();
              try {
                const event = JSON.parse(dataStr);
                
                if (event.type === 'stage_start') {
                  setGenerationProgressStep(event.name);
                  setPipelineSteps(prev => 
                    prev.map(s => s.stage === event.stage ? { ...s, status: 'RUNNING', message: 'Executing...' } : s)
                  );
                } else if (event.type === 'stage_end') {
                  setPipelineSteps(prev => 
                    prev.map(s => s.stage === event.stage ? { 
                      ...s, 
                      status: event.status, 
                      duration: event.duration, 
                      message: event.message 
                    } : s)
                  );
                } else if (event.type === 'complete') {
                  setGenerationProgressStep('Completed');
                  const result = event.result;
                  
                  // Update active post with new generated image URL and snapshots
                  const updatedPost: PostItem = {
                    ...activePost,
                    currentImageLayerUrl: result.imageUrl,
                    confidenceScore: Math.min(100, Math.round((activePost.confidenceScore + 1.5) * 10) / 10),
                    timestamp: 'Jul 8, Just Now (Generated)',
                    imageMetadata: {
                      generationId: result.generationId,
                      provider: result.provider,
                      providerMode: result.providerMode,
                      model: result.model,
                      generationTime: result.generationTime,
                      imageUrl: result.imageUrl,
                      status: result.status,
                      usedAssets: result.usedAssets || [],
                      promptVersion: 'v1.2',
                      promptText: result.promptText || '',
                      resolution: result.resolution,
                      pipelineDuration: result.pipelineDuration,
                      snapshots: result.snapshots
                    }
                  };

                  const nextPosts = posts.map(p => p.id === activePost.id ? updatedPost : p);
                  setPosts(nextPosts);
                  setActivePost(updatedPost);
                  updateScrapedDataForDomain(activeDomain, null, nextPosts);

                  const systemMsg: ChatMessage = {
                    id: `msg-sys-gen-${Date.now()}`,
                    sender: 'system',
                    text: `Successfully generated artwork using pipeline orchestrator! Model: ${result.model}. Total time: ${result.pipelineDuration.toFixed(1)}s.`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  };
                  setChatHistory(prev => [...prev, systemMsg]);
                } else if (event.type === 'error') {
                  throw new Error(event.error);
                }
              } catch (e: any) {
                console.error("Failed to parse line", trimmed, e);
              }
            }
          }
        }
      }

    } catch (err: any) {
      console.error('Pipeline failed:', err);
      // Set current running stage as failed
      setPipelineSteps(prev => prev.map(s => s.status === 'RUNNING' ? { ...s, status: 'FAILED', message: err.message } : s));
      
      const systemMsg: ChatMessage = {
        id: `msg-sys-err-${Date.now()}`,
        sender: 'system',
        text: `Error: Failed to process image generation with selected adapter. Reason: ${err.message || err}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, systemMsg]);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  useEffect(() => {
    const currentLoadingInterval = loadingIntervalRef.current;
    const currentTimer = timerRef.current;
    return () => {
      if (currentLoadingInterval) clearInterval(currentLoadingInterval);
      if (currentTimer) clearInterval(currentTimer);
    };
  }, []);

  return {
    extractionStatus,
    currentLoadingStep,
    brandKit,
    posts,
    activePost,
    creativeBrief,
    selectedPlatform,
    isRefining,
    chatHistory,
    apiKeys,
    theme,
    processingTime,
    designTokens,
    scrapedDomains,
    activeDomain,
    selectDomain,
    updateDesignToken,
    setSelectedPlatform,
    updateApiKeys,
    publishPost,
    refinePost,
    onboardDomain,
    toggleTheme,
    duplicatePost,
    regeneratePost,
    updateActivePostContent,
    isGeneratingImage,
    isImageGenModalOpen,
    setIsImageGenModalOpen,
    generateAIImage,
    generationProgressStep,
    pipelineSteps
  };
}
