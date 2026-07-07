import { useState, useEffect, useRef } from 'react';

// ============================================================================
// 🔌 Future-Proofing: n8n Backend Webhook Endpoints
// Swap these constant URLs with live n8n workflow webhook URLs when ready.
// ============================================================================
export const N8N_ONBOARDING_WEBHOOK_URL = 'https://n8n.your-instance.com/webhook/brand-onboarding';
export const N8N_REFINE_WEBHOOK_URL = 'https://n8n.your-instance.com/webhook/post-refine';
export const N8N_PUBLISH_WEBHOOK_URL = 'https://n8n.your-instance.com/webhook/post-publish';

// ============================================================================
// 🏢 Explicit TypeScript Interfaces
// ============================================================================
export interface BrandKit {
  domain: string;
  colors: string[];
  logoUrl: string; // Used for text or graphic branding overlay
  fontConfig: string;
}

export interface PostItem {
  id: string;
  title: string;
  targetPlatforms: ('LinkedIn' | 'Instagram' | 'X')[];
  currentImageLayerUrl: string;
  captionText: string;
  status: 'Drafting' | 'Ready' | 'Scheduled';
}

export type ExtractionStatus = 'idle' | 'processing' | 'completed';

export interface ApiKeys {
  firecrawlKey: string;
  geminiKey: string;
  openaiKey: string;
  ayrshareKey: string;
  autoSave: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'system';
  text: string;
  timestamp: string;
}

// Default loading checklist messages for Onboarding State
export const LOADING_STEPS = [
  'Initiating Firecrawl crawler...',
  'Crawling DOM structure...',
  'Analyzing design tokens & style variables...',
  'Extracting primary brand palette...',
  'Detecting typography classifications...',
  'Synthesizing Brand Kit tokens via Gemini...',
  'Generating social media canvas layers...',
  'Finalizing mock active display...'
];

// Preloaded mock data for review
const MOCK_DATASETS: Record<string, { brandKit: BrandKit; posts: PostItem[] }> = {
  'elevenlabs.io': {
    brandKit: {
      domain: 'elevenlabs.io',
      colors: ['#000000', '#f4f4f5', '#a1a1aa', '#27272a'],
      logoUrl: 'ElevenLabs',
      fontConfig: 'Geist Sans (Sans-Serif)'
    },
    posts: [
      {
        id: 'post-1',
        title: 'Voice Design Pipeline',
        targetPlatforms: ['LinkedIn', 'X'],
        currentImageLayerUrl: '/brand_asset_1.png',
        captionText: "Introducing the next generation of voice design. Control pitch, inflection, and emotional tone with razor-thin precision. Read the technical breakdown of our new zero-shot text-to-speech model: elevenlabs.io/blog/voice-design-v2",
        status: 'Ready'
      },
      {
        id: 'post-2',
        title: 'Multilingual Expansion',
        targetPlatforms: ['Instagram'],
        currentImageLayerUrl: '/brand_asset_2.png',
        captionText: "Speak any language in your own voice. Our unified model now supports 29 languages with native-level accentuation and natural flow. Try the updated studio workspace: elevenlabs.io/app",
        status: 'Drafting'
      },
      {
        id: 'post-3',
        title: 'Developer API Access',
        targetPlatforms: ['LinkedIn', 'Instagram', 'X'],
        currentImageLayerUrl: '/brand_asset_3.png',
        status: 'Scheduled',
        captionText: "Build human-like audio interfaces in minutes. The ElevenLabs API delivers sub-100ms latency, enterprise-grade scalability, and full styling adjustments. Get your free developer credentials today."
      }
    ]
  },
  'linear.app': {
    brandKit: {
      domain: 'linear.app',
      colors: ['#5e6ad2', '#09090b', '#222326', '#fafafa'],
      logoUrl: 'Linear',
      fontConfig: 'Inter (Grotesque Sans)'
    },
    posts: [
      {
        id: 'post-4',
        title: 'Linear Workflows',
        targetPlatforms: ['LinkedIn', 'X'],
        currentImageLayerUrl: '/brand_asset_2.png',
        captionText: "Streamline engineering alignment with Linear. Our redesigned roadmaps bring visual clarity to multi-team dependencies. No clutter, just velocity. #projectmanagement #developertools",
        status: 'Ready'
      },
      {
        id: 'post-5',
        title: 'Issue Tracker Speed',
        targetPlatforms: ['Instagram'],
        currentImageLayerUrl: '/brand_asset_3.png',
        captionText: "Speed is a feature. Keyboard shortcuts, instant offline sync, and automated git workflows built directly into your tracker. Try the desktop client today.",
        status: 'Drafting'
      },
      {
        id: 'post-6',
        title: 'API Integrations Engine',
        targetPlatforms: ['LinkedIn', 'Instagram', 'X'],
        currentImageLayerUrl: '/brand_asset_1.png',
        captionText: "Connect your entire toolchain. Sync github commits, trigger custom Slack workflows, or spin up automated build cycles. Explore the API: linear.app/docs",
        status: 'Scheduled'
      }
    ]
  },
  'v0.dev': {
    brandKit: {
      domain: 'v0.dev',
      colors: ['#18181b', '#09090b', '#3f3f46', '#ffffff'],
      logoUrl: 'v0',
      fontConfig: 'Geist Mono (Monospaced)'
    },
    posts: [
      {
        id: 'post-7',
        title: 'Generative UI Canvas',
        targetPlatforms: ['LinkedIn', 'X'],
        currentImageLayerUrl: '/brand_asset_3.png',
        captionText: "Create stunning React components from simple prompts. Visual editing meets code-generation. Zero friction, instant copy-paste layouts. Try v0 today.",
        status: 'Ready'
      },
      {
        id: 'post-8',
        title: 'Component Library Sync',
        targetPlatforms: ['Instagram'],
        currentImageLayerUrl: '/brand_asset_1.png',
        captionText: "Directly sync with shadcn/ui. Get clean, customizable CSS output styled for dark modes and high-fidelity devices. v0 simplifies frontend engineering workflows.",
        status: 'Drafting'
      },
      {
        id: 'post-9',
        title: 'Interactive Previewer',
        targetPlatforms: ['LinkedIn', 'Instagram', 'X'],
        currentImageLayerUrl: '/brand_asset_2.png',
        captionText: "Test responsive breakouts and dark mode variants inside the unified simulator. Perfect spacing, optimized assets. Build faster at v0.dev.",
        status: 'Scheduled'
      }
    ]
  }
};

// Default initial state uses ElevenLabs dataset
const DEFAULT_DOMAIN = 'elevenlabs.io';

export function useBackend() {
  // --- STATE DECLARATIONS ---
  const [extractionStatus, setExtractionStatus] = useState<ExtractionStatus>('completed');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('saas_dashboard_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'dark';
  });

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('saas_dashboard_theme', next);
      return next;
    });
  };

  const [currentLoadingStep, setCurrentLoadingStep] = useState(0);
  const [brandKit, setBrandKit] = useState<BrandKit | null>(MOCK_DATASETS[DEFAULT_DOMAIN].brandKit);
  const [posts, setPosts] = useState<PostItem[]>(MOCK_DATASETS[DEFAULT_DOMAIN].posts);
  const [activePost, setActivePost] = useState<PostItem | null>(MOCK_DATASETS[DEFAULT_DOMAIN].posts[0]);
  const [selectedPlatform, setSelectedPlatform] = useState<'LinkedIn' | 'Instagram' | 'X'>('LinkedIn');
  const [isRefining, setIsRefining] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'system',
      text: 'Brand Kit extracted successfully. Social graphics generated based on brand colors and typography. Ask me to refine captions, adjust imagery, or change overlay styling.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // API Keys state with LocalStorage auto-save integration
  const [apiKeys, setApiKeys] = useState<ApiKeys>(() => {
    const saved = localStorage.getItem('saas_dashboard_keys');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {
      firecrawlKey: '',
      geminiKey: '',
      openaiKey: '',
      ayrshareKey: '',
      autoSave: true
    };
  });

  // Track domain crawling queue
  const loadingIntervalRef = useRef<number | null>(null);

  // --- ACTIONS ---

  // Save keys helper
  const updateApiKeys = (updatedKeys: Partial<ApiKeys>) => {
    setApiKeys(prev => {
      const next = { ...prev, ...updatedKeys };
      if (next.autoSave) {
        localStorage.setItem('saas_dashboard_keys', JSON.stringify(next));
      } else {
        localStorage.removeItem('saas_dashboard_keys');
      }
      return next;
    });
  };

  // Select a post from the Today's Content Queue
  const selectPost = (postId: string) => {
    const found = posts.find(p => p.id === postId);
    if (found) {
      setActivePost(found);
    }
  };

  // Publish / Schedule trigger
  const publishPost = async (postId: string) => {
    // Scaffold for API Header inspection
    const payloadHeaders = {
      'Authorization': `Bearer ${apiKeys.ayrshareKey || 'mock-ayrshare-token'}`,
      'X-Gemini-Key': apiKeys.geminiKey || 'mock-gemini-token',
      'X-Firecrawl-Key': apiKeys.firecrawlKey || 'mock-firecrawl-token',
      'X-OpenAI-Key': apiKeys.openaiKey || 'mock-openai-token',
      'Content-Type': 'application/json'
    };

    console.log('[n8n Publish Webhook Payload]', {
      url: N8N_PUBLISH_WEBHOOK_URL,
      headers: payloadHeaders,
      postId: postId
    });

    setPosts(prev =>
      prev.map(p => (p.id === postId ? { ...p, status: 'Scheduled' } : p))
    );
    if (activePost && activePost.id === postId) {
      setActivePost(prev => prev ? { ...prev, status: 'Scheduled' } : null);
    }

    // Append confirmation to chat
    setChatHistory(prev => [
      ...prev,
      {
        id: `msg-pub-${Date.now()}`,
        sender: 'system',
        text: `Post scheduled for publication via Ayrshare API. n8n payload dispatched to ${N8N_PUBLISH_WEBHOOK_URL}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Convert conversational input to post refinement
  const refinePost = (prompt: string) => {
    if (!prompt.trim() || !activePost) return;

    // 1. Add user message
    const userMsgId = `msg-user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMsg]);
    setIsRefining(true);

    // Prepare simulated payload to mock n8n integration
    const payloadHeaders = {
      'Authorization': `Bearer ${apiKeys.openaiKey || apiKeys.geminiKey || 'mock-fallback-token'}`,
      'Content-Type': 'application/json'
    };

    console.log('[n8n Refine Webhook Payload]', {
      url: N8N_REFINE_WEBHOOK_URL,
      headers: payloadHeaders,
      prompt,
      activePostId: activePost.id
    });

    // 2. Wait 2 seconds to simulate backend image / text refinement
    setTimeout(() => {
      // Modify active post based on prompt content
      setActivePost(prev => {
        if (!prev) return null;
        let updatedCaption = prev.captionText;
        let updatedImage = prev.currentImageLayerUrl;

        const lowerPrompt = prompt.toLowerCase();
        
        // Caption edits
        if (lowerPrompt.includes('shorten') || lowerPrompt.includes('concise')) {
          updatedCaption = prev.captionText.split('. ')[0] + '. #ai #branding';
        } else if (lowerPrompt.includes('professional') || lowerPrompt.includes('formal')) {
          updatedCaption = "Enterprise-grade pipeline performance. " + prev.captionText;
        } else if (lowerPrompt.includes('emoji')) {
          updatedCaption = "⚡ " + prev.captionText + " 🔥 🌐";
        }

        // Image cycle simulation
        if (lowerPrompt.includes('image') || lowerPrompt.includes('photo') || lowerPrompt.includes('art') || lowerPrompt.includes('style')) {
          // cycle images
          if (prev.currentImageLayerUrl === '/brand_asset_1.png') {
            updatedImage = '/brand_asset_2.png';
          } else if (prev.currentImageLayerUrl === '/brand_asset_2.png') {
            updatedImage = '/brand_asset_3.png';
          } else {
            updatedImage = '/brand_asset_1.png';
          }
        }

        const nextPost = {
          ...prev,
          captionText: updatedCaption,
          currentImageLayerUrl: updatedImage
        };

        // Also update in list
        setPosts(list => list.map(item => item.id === prev.id ? nextPost : item));
        return nextPost;
      });

      // Add system confirmation
      const systemMsg: ChatMessage = {
        id: `msg-sys-${Date.now()}`,
        sender: 'system',
        text: 'Post layout refined. Brand canvas image layer updated. Text styles optimized via Gemini response payload.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, systemMsg]);
      setIsRefining(false);
    }, 2000);
  };

  // Domain Scraping / Onboarding flow
  const onboardDomain = (rawUrl: string) => {
    if (!rawUrl.trim()) return;

    // Clean URL
    let url = rawUrl.trim().toLowerCase();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    // Extract domain string (e.g. apple.com or linear.app)
    let domainStr = 'custom-brand.com';
    try {
      const hostname = new URL(url).hostname;
      domainStr = hostname.replace('www.', '');
    } catch (e) {
      domainStr = rawUrl;
    }

    // Stop current intervals if active
    if (loadingIntervalRef.current) {
      clearInterval(loadingIntervalRef.current);
    }

    setExtractionStatus('processing');
    setCurrentLoadingStep(0);

    const payloadHeaders = {
      'X-Firecrawl-Key': apiKeys.firecrawlKey || 'mock-firecrawl-token',
      'X-Gemini-Key': apiKeys.geminiKey || 'mock-gemini-token',
      'Content-Type': 'application/json'
    };

    console.log('[n8n Onboarding Webhook Payload]', {
      url: N8N_ONBOARDING_WEBHOOK_URL,
      headers: payloadHeaders,
      targetDomain: domainStr
    });

    let currentStepIndex = 0;

    // ⚡ Active Polling Engine Scaffold: updates progress state cleanly over 4 seconds
    loadingIntervalRef.current = window.setInterval(() => {
      currentStepIndex += 1;
      
      if (currentStepIndex >= LOADING_STEPS.length) {
        // Finished polling mock extraction
        clearInterval(loadingIntervalRef.current!);
        loadingIntervalRef.current = null;

        // Select mock dataset based on entered domain or fallback to v0/linear
        let selectedDataset = MOCK_DATASETS[domainStr];
        if (!selectedDataset) {
          // Choose one dynamically based on string
          if (domainStr.includes('linear')) {
            selectedDataset = MOCK_DATASETS['linear.app'];
          } else if (domainStr.includes('v0')) {
            selectedDataset = MOCK_DATASETS['v0.dev'];
          } else {
            // Generate a dynamic one
            selectedDataset = {
              brandKit: {
                domain: domainStr,
                colors: ['#09090b', '#ffffff', '#a1a1aa', '#3f3f46'],
                logoUrl: domainStr.split('.')[0].toUpperCase(),
                fontConfig: 'Geist Sans (Sans-Serif)'
              },
              posts: [
                {
                  id: `post-dyn-1`,
                  title: `${domainStr.split('.')[0]} Campaign`,
                  targetPlatforms: ['LinkedIn', 'X'],
                  currentImageLayerUrl: '/brand_asset_1.png',
                  captionText: `Custom content generation stream initialized for ${domainStr}. Scraping of assets, styles, and branding structures complete. Synthesizing assets via Gemini Vision pipeline.`,
                  status: 'Drafting'
                },
                {
                  id: `post-dyn-2`,
                  title: 'Brand Activation',
                  targetPlatforms: ['Instagram'],
                  currentImageLayerUrl: '/brand_asset_3.png',
                  captionText: `Unlocking creative potential with automated social systems. Built on n8n workflows, indexing components, and deploying layout variations.`,
                  status: 'Ready'
                }
              ]
            };
          }
        }

        setBrandKit(selectedDataset.brandKit);
        setPosts(selectedDataset.posts);
        setActivePost(selectedDataset.posts[0]);
        setExtractionStatus('completed');
        
        setChatHistory([
          {
            id: `msg-onboard-sys-${Date.now()}`,
            sender: 'system',
            text: `Brand Kit for ${domainStr} successfully compiled. Color palette extracted and brand typography mapped. Mock pipelines fully active.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        setCurrentLoadingStep(currentStepIndex);
      }
    }, 500); // 8 steps * 500ms = 4 seconds total crawling/synthesis process
  };

  useEffect(() => {
    return () => {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
      }
    };
  }, []);

  return {
    extractionStatus,
    currentLoadingStep,
    brandKit,
    posts,
    activePost,
    selectedPlatform,
    isRefining,
    chatHistory,
    apiKeys,
    theme,
    setSelectedPlatform,
    updateApiKeys,
    selectPost,
    publishPost,
    refinePost,
    onboardDomain,
    toggleTheme
  };
}
