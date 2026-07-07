import { useState, useRef } from 'react';
import type { PointerEvent } from 'react';
import type { PostItem, BrandKit, ExtractionStatus } from '../hooks/useBackend';
import { LOADING_STEPS } from '../hooks/useBackend';

interface CenterColumnProps {
  extractionStatus: ExtractionStatus;
  currentLoadingStep: number;
  activePost: PostItem | null;
  brandKit: BrandKit | null;
  selectedPlatform: 'LinkedIn' | 'Instagram' | 'X';
  onPlatformChange: (platform: 'LinkedIn' | 'Instagram' | 'X') => void;
  onPublish: (postId: string) => void;
}

export default function CenterColumn({
  extractionStatus,
  currentLoadingStep,
  activePost,
  brandKit,
  selectedPlatform,
  onPlatformChange,
  onPublish
}: CenterColumnProps) {
  // Drag and Resize State
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [width, setWidth] = useState(480); // default width in pixels
  
  const dragStart = useRef({ x: 0, y: 0 });
  const posStart = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, w: 0 });
  const activeResizeHandle = useRef<'tl' | 'tr' | 'bl' | 'br' | null>(null);
  const isDragging = useRef(false);

  const startDrag = (e: PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    posStart.current = { x: position.x, y: position.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onDragMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPosition({
      x: posStart.current.x + dx,
      y: posStart.current.y + dy
    });
  };

  const onDragEnd = (e: PointerEvent<HTMLDivElement>) => {
    isDragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const startResize = (e: PointerEvent<HTMLDivElement>, handle: 'tl' | 'tr' | 'bl' | 'br') => {
    e.preventDefault();
    e.stopPropagation();
    activeResizeHandle.current = handle;
    resizeStart.current = { x: e.clientX, y: e.clientY, w: width };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onResizeMove = (e: PointerEvent<HTMLDivElement>) => {
    const handle = activeResizeHandle.current;
    if (!handle) return;
    const dx = e.clientX - resizeStart.current.x;
    
    let dw = 0;
    if (handle === 'br' || handle === 'tr') {
      dw = dx;
    } else if (handle === 'bl' || handle === 'tl') {
      dw = -dx;
    }

    setWidth(Math.max(340, Math.min(680, resizeStart.current.w + dw)));
  };

  const onResizeEnd = (e: PointerEvent<HTMLDivElement>) => {
    activeResizeHandle.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // Generate initials for avatar representation
  const getInitials = (domain?: string) => {
    if (!domain) return 'AI';
    return domain.split('.')[0].substring(0, 2).toUpperCase();
  };

  const getBrandName = (domain?: string) => {
    if (!domain) return 'AI Pipeline';
    const base = domain.split('.')[0];
    return base.charAt(0).toUpperCase() + base.slice(1);
  };

  const isLoading = extractionStatus === 'processing';

  return (
    <div className="flex-1 h-full bg-[#f9f9fb] dark:bg-[#09090b] flex flex-col relative overflow-hidden transition-colors duration-250">
      
      {/* Top Selector Panel */}
      <div className="h-14 border-b border-zinc-200 dark:border-zinc-800/50 flex items-center justify-between px-6 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md z-10 transition-colors duration-250">
        
        {/* Segmented Platform Tabs & Reset Button */}
        <div className="flex items-center gap-3">
          <div className="flex bg-zinc-100 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-800/50 p-0.5 rounded-md transition-colors duration-250">
            {(['LinkedIn', 'Instagram', 'X'] as const).map((platform) => {
              const isSel = selectedPlatform === platform;
              return (
                <button
                  key={platform}
                  onClick={() => onPlatformChange(platform)}
                  className={`px-3 py-1 rounded-[4px] text-xs font-medium transition ${
                    isSel 
                      ? 'bg-white dark:bg-[#18181b] text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700/50 shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                  }`}
                >
                  {platform}
                </button>
              );
            })}
          </div>

          {/* Reset position button */}
          {(position.x !== 0 || position.y !== 0 || width !== 480) && (
            <button
              onClick={() => {
                setPosition({ x: 0, y: 0 });
                setWidth(480);
              }}
              className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-800/50 text-[10px] font-mono text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-250 transition bg-white dark:bg-zinc-900 shadow-sm"
              title="Reset position and size"
            >
              Reset Canvas
            </button>
          )}
        </div>

        {/* Action Button */}
        {activePost && (
          <button
            onClick={() => onPublish(activePost.id)}
            disabled={activePost.status === 'Scheduled' || isLoading}
            className={`text-xs font-semibold px-4 py-1.5 rounded-md border transition flex items-center gap-1.5 ${
              activePost.status === 'Scheduled'
                ? 'bg-transparent border-zinc-200 dark:border-zinc-800/50 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                : 'bg-zinc-900 text-white hover:bg-zinc-800 border-zinc-900 dark:bg-white dark:hover:bg-zinc-200 dark:border-white dark:text-black'
            }`}
          >
            {activePost.status === 'Scheduled' ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Scheduled via Ayrshare
              </>
            ) : (
              'Publish to Channel'
            )}
          </button>
        )}
      </div>

      {/* Main Canvas Workspace Area */}
      <div className="flex-1 p-8 flex items-center justify-center overflow-y-auto no-scrollbar bg-[#f0f0f2] dark:bg-[#050507] transition-colors duration-250">
        
        {/* 1. Onboarding / Loading Overlay */}
        {isLoading ? (
          <div className="w-full max-w-lg bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800/50 rounded-lg p-6 space-y-6 shadow-2xl relative transition-colors duration-250">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-zinc-900 dark:bg-white animate-pulse" />
              <h3 className="text-sm font-semibold text-zinc-850 dark:text-white tracking-wide uppercase font-mono">DOM Crawler Active</h3>
            </div>
            
            {/* Checklist progress tracker */}
            <div className="space-y-2.5">
              {LOADING_STEPS.map((step, idx) => {
                const isCompleted = idx < currentLoadingStep;
                const isActive = idx === currentLoadingStep;
                return (
                  <div 
                    key={step} 
                    className={`flex items-center gap-3 transition-opacity duration-300 ${
                      isCompleted ? 'opacity-40' : isActive ? 'opacity-100' : 'opacity-15'
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="h-4.5 w-4.5 text-zinc-655 dark:text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : isActive ? (
                      <div className="h-4.5 w-4.5 flex items-center justify-center">
                        <div className="h-3 w-3 rounded-full border-2 border-zinc-800 dark:border-white border-t-transparent animate-spin" />
                      </div>
                    ) : (
                      <div className="h-4.5 w-4.5 flex items-center justify-center">
                        <div className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-800" />
                      </div>
                    )}
                    <span className="text-xs font-mono text-zinc-700 dark:text-zinc-300">{step}</span>
                  </div>
                );
              })}
            </div>

            {/* Simulated Canvas Skeleton Frame */}
            <div className="border border-zinc-200 dark:border-zinc-800/50 rounded p-4 bg-zinc-50 dark:bg-[#0c0c0e] space-y-3 transition-colors duration-250">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800/50 shimmer-loader" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800/50 rounded w-1/3 shimmer-loader" />
                  <div className="h-2 bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800/50 rounded w-1/4 shimmer-loader" />
                </div>
              </div>
              <div className="h-32 bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800/50 rounded shimmer-loader" />
            </div>
          </div>
        ) : !activePost ? (
          /* Empty / Onboarding Idle State */
          <div className="text-center max-w-sm space-y-3">
            <div className="mx-auto w-12 h-12 rounded-lg border border-zinc-200 dark:border-zinc-800/50 bg-zinc-100 dark:bg-[#0d0d11] flex items-center justify-center text-zinc-400 dark:text-zinc-600 transition-colors duration-250">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-zinc-900 dark:text-white tracking-tight letter-spacing-condensed">No active campaign</h3>
            <p className="text-xs text-zinc-500">Enter a website URL at the top to start scraping assets and synthesizing posts.</p>
          </div>
        ) : (
          
          /* 2. Review & Refine Active Simulator View */
          <div 
            style={{
              transform: `translate(${position.x}px, ${position.y}px)`,
              width: `${width}px`,
              touchAction: 'none'
            }}
            className="relative select-none animate-fade-in group/card bg-transparent"
          >
            {/* Outline overlay */}
            <div className="absolute -inset-1.5 border border-transparent group-hover/card:border-zinc-350/50 dark:group-hover/card:border-zinc-700/30 rounded-xl pointer-events-none transition-colors duration-250" />
            
            {/* Corner Resize Handles */}
            <div 
              onPointerDown={(e) => startResize(e, 'tl')}
              onPointerMove={onResizeMove}
              onPointerUp={onResizeEnd}
              className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-zinc-300 dark:bg-zinc-755 hover:bg-zinc-650 dark:hover:bg-white border border-white dark:border-zinc-900 rounded-full cursor-nwse-resize z-30 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200" 
              title="Resize Width"
            />
            <div 
              onPointerDown={(e) => startResize(e, 'tr')}
              onPointerMove={onResizeMove}
              onPointerUp={onResizeEnd}
              className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-zinc-300 dark:bg-zinc-755 hover:bg-zinc-650 dark:hover:bg-white border border-white dark:border-zinc-900 rounded-full cursor-nesw-resize z-30 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200" 
              title="Resize Width"
            />
            <div 
              onPointerDown={(e) => startResize(e, 'bl')}
              onPointerMove={onResizeMove}
              onPointerUp={onResizeEnd}
              className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-zinc-300 dark:bg-zinc-755 hover:bg-zinc-650 dark:hover:bg-white border border-white dark:border-zinc-900 rounded-full cursor-nesw-resize z-30 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200" 
              title="Resize Width"
            />
            <div 
              onPointerDown={(e) => startResize(e, 'br')}
              onPointerMove={onResizeMove}
              onPointerUp={onResizeEnd}
              className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-zinc-300 dark:bg-zinc-755 hover:bg-zinc-650 dark:hover:bg-white border border-white dark:border-zinc-900 rounded-full cursor-nwse-resize z-30 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200" 
              title="Resize Width"
            />

            {/* Drag Handle Banner */}
            <div 
              onPointerDown={startDrag}
              onPointerMove={onDragMove}
              onPointerUp={onDragEnd}
              className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 px-2 py-0.5 rounded text-[9px] font-mono font-medium text-zinc-450 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 cursor-grab active:cursor-grabbing z-20 flex items-center gap-1 shadow-sm opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 select-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Drag Canvas
            </div>
            
            {/* PLATFORM FRAME: LINKEDIN */}
            {selectedPlatform === 'LinkedIn' && (
              <div className="bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800/50 rounded-lg p-4 space-y-3 shadow-2xl transition-colors duration-250">
                
                {/* Meta header */}
                <div className="flex items-start justify-between">
                  <div className="flex gap-2">
                    <div className="h-10 w-10 bg-zinc-200 dark:bg-black text-zinc-850 dark:text-white text-xs border border-zinc-300 dark:border-zinc-800/50 rounded-full flex items-center justify-center font-bold tracking-tight transition-colors duration-250">
                      {getInitials(brandKit?.domain)}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:underline cursor-pointer flex items-center gap-1 transition-colors duration-250">
                        {getBrandName(brandKit?.domain)}
                        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-normal">• 1st</span>
                      </div>
                      <div className="text-[10px] text-zinc-500">AI automated image gen pipeline</div>
                      <div className="text-[9px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1 transition-colors duration-250">
                        2h • Edited • 
                        <svg className="h-2.5 w-2.5 animate-pulse" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM4.5 7.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <button className="text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                  </button>
                </div>

                {/* Caption string neat underneath */}
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line transition-colors duration-250">
                  {activePost.captionText}
                </p>

                {/* Simulated Canvas Image Frame */}
                <div className="relative border border-zinc-200 dark:border-zinc-800/50 rounded overflow-hidden aspect-video bg-black flex items-center justify-center group transition-colors duration-250">
                  <img 
                    src={activePost.currentImageLayerUrl} 
                    alt="Active Generator Layer" 
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  {/* BRANDING OVERLAY INJECTED ELEMENT */}
                  <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-[#09090b]/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800/50 rounded px-2.5 py-1.5 flex items-center gap-2 shadow-lg transition-colors duration-250">
                    {/* Brand logo tag */}
                    <span className="text-[10px] font-bold text-zinc-900 dark:text-white tracking-widest uppercase transition-colors duration-250">
                      {brandKit?.logoUrl || 'AI'}
                    </span>
                    {/* Primary color dot */}
                    <div className="flex gap-1 items-center">
                      <span 
                        className="h-2 w-2 rounded-full border border-zinc-200 dark:border-white/20"
                        style={{ backgroundColor: brandKit?.colors[0] || '#ffffff' }}
                      />
                      <span className="text-[8px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-tight transition-colors duration-250">
                        {brandKit?.colors[0] || '#FFF'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* LinkedIn Action Stats */}
                <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-450 dark:text-zinc-500 border-b border-zinc-100 dark:border-zinc-900 pb-2 transition-colors duration-250">
                  <div className="flex items-center gap-1.5">
                    <span className="flex -space-x-1">
                      <span className="h-4 w-4 bg-zinc-100 dark:bg-zinc-800 rounded-full border border-white dark:border-black flex items-center justify-center text-[7px]">👍</span>
                      <span className="h-4 w-4 bg-zinc-200 dark:bg-zinc-700 rounded-full border border-white dark:border-black flex items-center justify-center text-[7px]">💡</span>
                    </span>
                    <span>18 likes • 3 comments</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center text-zinc-400 dark:text-zinc-500 text-xs font-semibold px-2 pt-1">
                  <button className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-300 py-1 transition">👍 Like</button>
                  <button className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-300 py-1 transition">💬 Comment</button>
                  <button className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-300 py-1 transition">🔁 Repost</button>
                  <button className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-300 py-1 transition">📤 Send</button>
                </div>

              </div>
            )}

            {/* PLATFORM FRAME: INSTAGRAM */}
            {selectedPlatform === 'Instagram' && (
              <div className="bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800/50 rounded-lg shadow-2xl overflow-hidden max-w-[440px] mx-auto transition-colors duration-250">
                
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-zinc-100 dark:border-zinc-900 transition-colors duration-250">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-zinc-200 dark:bg-black text-zinc-900 dark:text-white text-xs border border-zinc-300 dark:border-zinc-800/50 rounded-full flex items-center justify-center font-bold tracking-tight transition-colors duration-250">
                      {getInitials(brandKit?.domain)}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 hover:underline cursor-pointer transition-colors duration-250">
                        {getBrandName(brandKit?.domain).toLowerCase()}
                      </span>
                      <p className="text-[8px] text-zinc-400 dark:text-zinc-500">Sponsored • Canvas Simulation</p>
                    </div>
                  </div>
                  <button className="text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                  </button>
                </div>

                {/* 1:1 Aspect Canvas Wrapper */}
                <div className="relative aspect-square bg-black flex items-center justify-center group">
                  <img 
                    src={activePost.currentImageLayerUrl} 
                    alt="Instagram Layer" 
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  {/* BRANDING OVERLAY INJECTED ELEMENT */}
                  <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/60 backdrop-blur-md border border-zinc-200 dark:border-zinc-800/30 rounded-full px-3 py-1 flex items-center gap-1.5 shadow-lg transition-colors duration-250">
                    <span className="text-[9px] font-mono text-zinc-900 dark:text-white/90 uppercase tracking-widest transition-colors duration-250">
                      {brandKit?.logoUrl || 'AI'}
                    </span>
                    <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: brandKit?.colors[0] || '#ffffff' }} />
                  </div>
                </div>

                {/* Action Bar */}
                <div className="p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-zinc-400 dark:text-zinc-450">
                    <div className="flex gap-4">
                      <button className="hover:text-zinc-900 dark:hover:text-white transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                      <button className="hover:text-zinc-900 dark:hover:text-white transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </button>
                      <button className="hover:text-zinc-900 dark:hover:text-white transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 10.742a3 3 0 110 2.516m0-2.516a3 3 0 110-2.516m0 2.516l5.759-3.24M14.443 6.438l-5.759 3.24M14.443 14.562l-5.759-3.24" />
                        </svg>
                      </button>
                    </div>
                    <button className="hover:text-zinc-900 dark:hover:text-white transition">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>

                  {/* Likes and Captions */}
                  <div className="space-y-1 text-xs">
                    <p className="font-semibold text-zinc-900 dark:text-white transition-colors duration-250">412 likes</p>
                    <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed transition-colors duration-250">
                      <span className="font-semibold text-zinc-900 dark:text-white mr-1.5">{getBrandName(brandKit?.domain).toLowerCase()}</span>
                      {activePost.captionText}
                    </p>
                  </div>
                </div>

              </div>
            )}

            {/* PLATFORM FRAME: X TIMELINE */}
            {selectedPlatform === 'X' && (
              <div className="bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800/50 rounded-lg p-4 space-y-3.5 shadow-2xl transition-colors duration-250">
                
                {/* User Info header */}
                <div className="flex gap-2.5 items-start">
                  <div className="h-9 w-9 bg-zinc-200 dark:bg-black text-zinc-900 dark:text-white text-xs border border-zinc-300 dark:border-zinc-800/50 rounded-full flex items-center justify-center font-bold tracking-tight transition-colors duration-250">
                    {getInitials(brandKit?.domain)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 justify-between">
                      <div className="flex items-center gap-1 truncate text-xs">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 hover:underline cursor-pointer truncate transition-colors duration-250">
                          {getBrandName(brandKit?.domain)}
                        </span>
                        <span className="text-zinc-400 dark:text-zinc-500 font-mono truncate transition-colors duration-250">
                          @{getBrandName(brandKit?.domain).toLowerCase()} • 1h
                        </span>
                      </div>
                      <button className="text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                        </svg>
                      </button>
                    </div>

                    {/* Captions directly under handle */}
                    <p className="text-xs text-zinc-700 dark:text-zinc-200 mt-1.5 leading-relaxed whitespace-pre-line transition-colors duration-250">
                      {activePost.captionText}
                    </p>

                    {/* Canvas frame */}
                    <div className="relative border border-zinc-200 dark:border-zinc-800/50 rounded-lg overflow-hidden aspect-video bg-black flex items-center justify-center group mt-3 transition-colors duration-250">
                      <img 
                        src={activePost.currentImageLayerUrl} 
                        alt="X Visual Layer" 
                        className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                      />

                      {/* BRANDING OVERLAY INJECTED ELEMENT */}
                      <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 border border-zinc-200 dark:border-zinc-800/50 rounded-md px-2 py-1 flex items-center gap-1.5 shadow-lg transition-colors duration-250">
                        <span className="text-[8px] font-bold text-zinc-650 dark:text-zinc-400 tracking-wider transition-colors duration-250">
                          GENERATED BY {brandKit?.logoUrl || 'AI'}
                        </span>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: brandKit?.colors[0] || '#ffffff' }} />
                      </div>
                    </div>

                    {/* Bottom Action Panel */}
                    <div className="flex justify-between max-w-sm mt-3 text-zinc-450 dark:text-zinc-500 text-[11px] transition-colors duration-250">
                      <button className="flex items-center gap-1 hover:text-blue-500 dark:hover:text-blue-400 transition">💬 4</button>
                      <button className="flex items-center gap-1 hover:text-green-500 dark:hover:text-green-400 transition">🔁 12</button>
                      <button className="flex items-center gap-1 hover:text-red-500 dark:hover:text-red-400 transition">❤️ 48</button>
                      <button className="flex items-center gap-1 hover:text-zinc-700 dark:hover:text-zinc-305 transition">📊 1.2K</button>
                      <button className="flex items-center gap-1 hover:text-blue-500 dark:hover:text-blue-400 transition">📤</button>
                    </div>

                  </div>
                </div>

              </div>
            )}

          </div>
        )}
      </div>

    </div>
  );
}
