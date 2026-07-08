import { useState, useRef, useEffect } from 'react';
import type { BrandKit, ChatMessage, DesignTokens, CreativeBrief } from '../hooks/useBackend';

interface RightColumnProps {
  brandKit: BrandKit | null;
  chatHistory: ChatMessage[];
  isRefining: boolean;
  onRefinePost: (prompt: string) => void;
  designTokens: DesignTokens;
  onUpdateToken: (key: keyof DesignTokens, value: string) => void;
  creativeBrief: CreativeBrief | null;
}

export default function RightColumn({ 
  brandKit, 
  chatHistory, 
  isRefining, 
  onRefinePost, 
  designTokens, 
  onUpdateToken,
  creativeBrief
}: RightColumnProps) {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Accordion toggle states
  const [collapsed, setCollapsed] = useState({
    intelligence: false,
    brandKit: false,
    assets: false,
    tokens: false,
    confidence: false,
    creativeBrief: false
  });

  const toggleSection = (section: keyof typeof collapsed) => {
    setCollapsed(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isRefining) return;
    onRefinePost(inputText);
    setInputText('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (isRefining) return;
    onRefinePost(suggestion);
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isRefining]);

  return (
    <div className="w-[340px] h-full bg-white dark:bg-[#09090b] border-l border-zinc-200 dark:border-zinc-800/50 flex flex-col justify-between overflow-hidden transition-colors duration-250 shrink-0">
      
      {/* Top Half: Collapsible Inspector Accordion */}
      <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar transition-colors duration-250">
        
        {/* Header Title */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800/50 flex items-center justify-between transition-colors duration-250 bg-white dark:bg-[#09090b] sticky top-0 z-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">AI Inspector Console</span>
          <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 px-1.5 py-0.5 rounded">
            {brandKit?.domain || 'awaiting URL'}
          </span>
        </div>

        {brandKit ? (
          <div className="flex flex-col">
            
            {/* SECTION 1: Brand Intelligence */}
            <div className="border-b border-zinc-150 dark:border-zinc-900">
              <button 
                onClick={() => toggleSection('intelligence')}
                className="w-full flex items-center justify-between p-3.5 text-left font-semibold text-[10px] uppercase tracking-widest text-zinc-450 dark:text-zinc-500 bg-zinc-50/20 dark:bg-zinc-950/10 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition cursor-pointer"
              >
                <span>1. Brand Intelligence</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-3 w-3 text-zinc-400 transition-transform duration-200 ${collapsed.intelligence ? '-rotate-90' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {!collapsed.intelligence && (
                <div className="p-4 space-y-3.5 animate-fade-in text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[8px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wide">Company Name</p>
                      <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">{brandKit.companyName}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wide">Industry</p>
                      <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5 truncate" title={brandKit.industry}>{brandKit.industry}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[8px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wide">Target Audience</p>
                      <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5 leading-normal">{brandKit.targetAudience}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wide">Personality</p>
                      <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">{brandKit.brandPersonality}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wide">Voice</p>
                      <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">{brandKit.brandVoice}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[8px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wide">Tone</p>
                      <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">{brandKit.brandTone}</p>
                    </div>
                  </div>
                  <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-900 flex justify-between items-center text-[10px]">
                    <span className="text-[8.5px] font-bold text-zinc-400 dark:text-zinc-550 uppercase">Analysis Confidence</span>
                    <span className="text-green-600 dark:text-green-500 font-mono font-bold">{brandKit.confidenceScore}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2: Brand Kit */}
            <div className="border-b border-zinc-150 dark:border-zinc-900">
              <button 
                onClick={() => toggleSection('brandKit')}
                className="w-full flex items-center justify-between p-3.5 text-left font-semibold text-[10px] uppercase tracking-widest text-zinc-450 dark:text-zinc-500 bg-zinc-50/20 dark:bg-zinc-950/10 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition cursor-pointer"
              >
                <span>2. Brand Kit Swatches</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-3 w-3 text-zinc-400 transition-transform duration-200 ${collapsed.brandKit ? '-rotate-90' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {!collapsed.brandKit && (
                <div className="p-4 space-y-4 animate-fade-in text-xs">
                  <div>
                    <p className="text-[8px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wide pb-2">Color Palettes</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'PrimaryColor', hex: brandKit.colors[0] },
                        { label: 'SecondaryColor', hex: brandKit.colors[1] },
                        { label: 'AccentColor', hex: brandKit.colors[2] },
                        { label: 'BackgroundColor', hex: brandKit.colors[3] }
                      ].map(swatch => (
                        <div key={swatch.label} className="flex items-center gap-2.5 p-2 border border-zinc-200 dark:border-zinc-850 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 shadow-sm">
                          <div 
                            className="h-6 w-6 rounded border border-black/10 dark:border-white/10 shrink-0" 
                            style={{ backgroundColor: swatch.hex }}
                          />
                          <div className="min-w-0">
                            <p className="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">{swatch.label}</p>
                            <p className="font-mono font-bold text-[10px] text-zinc-800 dark:text-white uppercase select-all">{swatch.hex}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3.5 border-t border-zinc-100 dark:border-zinc-900">
                    <p className="text-[8px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wide pb-1.5">Font Preview</p>
                    <div className="p-3 border border-zinc-250 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-[#0d0d11]">
                      <p className="font-bold text-zinc-850 dark:text-zinc-200 font-mono text-[11px]">{brandKit.fontConfig}</p>
                      <p className="text-[9.5px] text-zinc-450 italic mt-1.5 font-serif leading-relaxed">
                        "The quick brown fox jumps over the lazy developer's terminal dashboard."
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 3: Detected Assets */}
            <div className="border-b border-zinc-150 dark:border-zinc-900">
              <button 
                onClick={() => toggleSection('assets')}
                className="w-full flex items-center justify-between p-3.5 text-left font-semibold text-[10px] uppercase tracking-widest text-zinc-450 dark:text-zinc-500 bg-zinc-50/20 dark:bg-zinc-950/10 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition cursor-pointer"
              >
                <span>3. Detected Assets Source</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-3 w-3 text-zinc-400 transition-transform duration-200 ${collapsed.assets ? '-rotate-90' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {!collapsed.assets && (
                <div className="p-4 animate-fade-in">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Logo Mark', src: brandKit.assets.logo, tag: 'Logo' },
                      { label: 'Hero Image', src: brandKit.assets.hero, tag: 'Hero Banner' },
                      { label: 'Product Photo', src: brandKit.assets.product[0], tag: 'Product' },
                      { label: 'Dashboard screenshot', src: brandKit.assets.dashboard, tag: 'Screenshot' },
                      { label: 'Team Photo', src: brandKit.assets.team, tag: 'Team Photos' },
                      { label: 'Illustration', src: brandKit.assets.illustration, tag: 'Illustration' }
                    ].map((asset, idx) => (
                      <div key={idx} className="flex flex-col gap-1 p-1 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-850 rounded-lg shadow-sm">
                        <div className="aspect-square bg-zinc-100 dark:bg-zinc-950 rounded overflow-hidden flex items-center justify-center border">
                          <img src={asset.src} alt="" className="h-full w-full object-cover" />
                        </div>
                        <p className="text-[8px] text-zinc-700 dark:text-zinc-300 truncate text-center font-bold mt-0.5">{asset.label}</p>
                        <span className="text-[7px] text-green-600 dark:text-green-500 text-center font-mono font-bold uppercase tracking-wider block">
                          [AI Label]
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 4: Design Tokens */}
            <div className="border-b border-zinc-150 dark:border-zinc-900">
              <button 
                onClick={() => toggleSection('tokens')}
                className="w-full flex items-center justify-between p-3.5 text-left font-semibold text-[10px] uppercase tracking-widest text-zinc-455 dark:text-zinc-500 bg-zinc-50/20 dark:bg-zinc-950/10 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition cursor-pointer"
              >
                <span>4. Design Tokens</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-3 w-3 text-zinc-400 transition-transform duration-200 ${collapsed.tokens ? '-rotate-90' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {!collapsed.tokens && (
                <div className="p-4 space-y-3.5 animate-fade-in text-[10px]">
                  {[
                    { label: 'Typography', key: 'typography' as keyof DesignTokens },
                    { label: 'Spacing', key: 'spacing' as keyof DesignTokens },
                    { label: 'Corner Radius', key: 'cornerRadius' as keyof DesignTokens },
                    { label: 'Shadow Style', key: 'shadowStyle' as keyof DesignTokens },
                    { label: 'Photography Style', key: 'photographyStyle' as keyof DesignTokens },
                    { label: 'Illustration Style', key: 'illustrationStyle' as keyof DesignTokens },
                    { label: 'Background Style', key: 'backgroundStyle' as keyof DesignTokens },
                    { label: 'Button Style', key: 'buttonStyle' as keyof DesignTokens },
                    { label: 'Card Style', key: 'cardStyle' as keyof DesignTokens }
                  ].map(token => (
                    <div key={token.key} className="flex flex-col gap-1">
                      <label className="text-[8.5px] font-bold text-zinc-450 dark:text-zinc-550 uppercase tracking-wide">{token.label}</label>
                      <input 
                        type="text" 
                        value={designTokens[token.key]}
                        onChange={(e) => onUpdateToken(token.key, e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-250 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition shadow-sm font-medium"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 5: AI Confidence */}
            <div className="border-b border-zinc-150 dark:border-zinc-900">
              <button 
                onClick={() => toggleSection('confidence')}
                className="w-full flex items-center justify-between p-3.5 text-left font-semibold text-[10px] uppercase tracking-widest text-zinc-450 dark:text-zinc-500 bg-zinc-50/20 dark:bg-zinc-950/10 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition cursor-pointer"
              >
                <span>5. AI Confidence Levels</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-3 w-3 text-zinc-400 transition-transform duration-200 ${collapsed.confidence ? '-rotate-90' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {!collapsed.confidence && (
                <div className="p-4 space-y-3.5 animate-fade-in text-[10px]">
                  {[
                    { label: 'Logo Detection', val: brandKit.detectionConfidences.logo },
                    { label: 'Typography Detection', val: brandKit.detectionConfidences.typography },
                    { label: 'Color Extraction', val: brandKit.detectionConfidences.colors },
                    { label: 'Brand Style Ingestion', val: brandKit.detectionConfidences.brandStyle },
                    { label: 'Image Classification', val: brandKit.detectionConfidences.imageClassification }
                  ].map(bar => (
                    <div key={bar.label} className="space-y-1.5">
                      <div className="flex justify-between font-mono text-[9px] text-zinc-450 dark:text-zinc-500">
                        <span>{bar.label}</span>
                        <span className="font-bold text-zinc-800 dark:text-zinc-300">{bar.val}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-zinc-900 dark:bg-white rounded-full transition-all duration-500" 
                          style={{ width: `${bar.val}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 6: Campaign Creative Brief */}
            <div className="border-b border-zinc-150 dark:border-zinc-900">
              <button 
                onClick={() => toggleSection('creativeBrief')}
                className="w-full flex items-center justify-between p-3.5 text-left font-semibold text-[10px] uppercase tracking-widest text-zinc-450 dark:text-zinc-500 bg-zinc-50/20 dark:bg-zinc-950/10 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition cursor-pointer"
              >
                <span>6. Campaign Creative Brief</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-3 w-3 text-zinc-400 transition-transform duration-200 ${collapsed.creativeBrief ? '-rotate-90' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {!collapsed.creativeBrief && (
                <div className="p-4 space-y-3.5 animate-fade-in text-xs">
                  {creativeBrief ? (
                    <div className="space-y-3.5">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[8px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wide">Objective</p>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">{creativeBrief.campaign?.objective}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wide">Audience</p>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5 truncate" title={creativeBrief.audience?.primary}>{creativeBrief.audience?.primary}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wide">Platform</p>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">{creativeBrief.campaign?.platform}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wide">Content Type</p>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">{creativeBrief.campaign?.contentType}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wide">Visual Style</p>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5 truncate" title={creativeBrief.visual?.style}>{creativeBrief.visual?.style}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wide">Layout</p>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5 truncate" title={creativeBrief.visual?.layout}>{creativeBrief.visual?.layout}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[8px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wide">Core Message</p>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5 leading-normal">{creativeBrief.message?.coreMessage}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[8px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wide">Headline Direction</p>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5 leading-normal">{creativeBrief.message?.headlineDirection}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wide">CTA</p>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">{creativeBrief.message?.cta}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wide">Priority Assets</p>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5 truncate" title={creativeBrief.visual?.priorityAssets?.join(', ')}>
                            {creativeBrief.visual?.priorityAssets?.join(', ')}
                          </p>
                        </div>
                      </div>

                      {/* Generated Prompt Section */}
                      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900">
                        <p className="text-[8px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wide pb-1.5">Generated Image Prompt (JSON)</p>
                        <div className="relative group">
                          <pre className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-[#0d0d11] text-[9.5px] font-mono text-zinc-700 dark:text-zinc-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                            {JSON.stringify({ prompt: creativeBrief.imagePrompt || '' }, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-zinc-400 dark:text-zinc-650 text-center py-2 italic text-[11px]">Type a campaign directive in the console below to generate a brief (e.g. "Create a LinkedIn launch post")</p>
                  )}
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <p className="text-xs text-zinc-400 dark:text-zinc-650">Pending URL domain scan</p>
          </div>
        )}
      </div>

      {/* Bottom Half: Chat Console (AI Creative Director) */}
      <div className="flex-1 flex flex-col overflow-hidden bg-zinc-50 dark:bg-[#070709] border-t border-zinc-200 dark:border-zinc-900 transition-colors duration-250 shrink-0">
        
        {/* Terminal Header */}
        <div className="p-3 bg-white dark:bg-[#09090b] border-b border-zinc-200 dark:border-zinc-800/50 flex items-center justify-between transition-colors duration-250">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-550 dark:text-zinc-400">AI Creative Director</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500">Live Agent Console</span>
          </div>
        </div>

        {/* Conversation Message List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {chatHistory.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div 
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${isUser ? 'ml-auto items-end animate-fade-in' : 'mr-auto items-start animate-fade-in'}`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[8px] font-mono text-zinc-400 dark:text-zinc-600 uppercase">
                    {isUser ? 'Client Command' : 'Director Agent'}
                  </span>
                  <span className="text-[8px] font-mono text-zinc-300 dark:text-zinc-700">•</span>
                  <span className="text-[8px] font-mono text-zinc-400 dark:text-zinc-600">{msg.timestamp}</span>
                </div>
                <div className={`p-2.5 rounded-xl text-xs leading-relaxed transition-colors duration-250 ${
                  isUser 
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-black border border-zinc-850 dark:border-white shadow-sm' 
                    : 'bg-white dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            );
          })}

          {/* Quick Suggestions Shelf (only visible when not refining, right under system messages) */}
          {!isRefining && (
            <div className="space-y-1.5 pt-1 animate-fade-in">
              <span className="text-[8.5px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest block mb-1">Quick Creative Directives</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Make it more premium',
                  'Create Carousel',
                  'Dark Theme',
                  'Shorter Caption',
                  'More White Space',
                  'Stronger CTA',
                  'Replace Background'
                ].map(suggestion => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-[9px] font-mono font-medium px-2 py-1 bg-white hover:bg-zinc-100 dark:bg-[#0d0d11] dark:hover:bg-[#121217] text-zinc-550 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded-md transition shadow-xs cursor-pointer select-none"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Refining Loader Indicator */}
          {isRefining && (
            <div className="flex flex-col max-w-[85%] mr-auto items-start animate-pulse">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[8px] font-mono text-zinc-400 dark:text-zinc-600">DIRECTOR AGENT</span>
                <span className="text-[8px] font-mono text-zinc-300 dark:text-zinc-700">•</span>
                <span className="text-[8px] font-mono text-zinc-400 dark:text-zinc-600">Iterating</span>
              </div>
              <div className="p-2.5 rounded-xl text-xs bg-white dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-800 text-zinc-500 flex items-center gap-2 transition-colors duration-250 shadow-sm">
                <div className="h-3 w-3 rounded-full border border-zinc-400 dark:border-zinc-500 border-t-transparent animate-spin" />
                Refining brand canvas on n8n...
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Conversational input bar at base */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-[#09090b] transition-colors duration-250">
          <div className="relative flex items-center bg-zinc-100 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-800/50 rounded-md overflow-hidden transition focus-within:border-zinc-400 dark:focus-within:border-zinc-500 pr-1.5 transition-colors duration-250">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isRefining}
              placeholder="Describe the changes you want..."
              className="flex-1 bg-transparent text-xs text-zinc-800 dark:text-zinc-300 placeholder-zinc-400 dark:placeholder-zinc-600 px-3 py-3 focus:outline-none disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={isRefining || !inputText.trim()}
              className={`p-1.5 rounded transition cursor-pointer ${
                inputText.trim() && !isRefining
                  ? 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200'
                  : 'bg-zinc-200 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-650 cursor-not-allowed'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </form>

      </div>

    </div>
  );
}
