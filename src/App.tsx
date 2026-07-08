import { useState, useEffect } from 'react';
import { useBackend } from './hooks/useBackend';
import LeftColumn from './components/LeftColumn';
import CenterColumn from './components/CenterColumn';
import RightColumn from './components/RightColumn';
import SettingsDrawer from './components/SettingsDrawer';
import PublishModal from './components/PublishModal';

export default function App() {
  const {
    extractionStatus,
    currentLoadingStep,
    brandKit,
    activePost,
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
    toggleTheme
  } = useBackend();

  const [domainInput, setDomainInput] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);

  const handleDomainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainInput.trim()) return;
    onboardDomain(domainInput);
    setDomainInput('');
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const isLoading = extractionStatus === 'processing';

  return (
    <div className="h-screen w-screen flex flex-col bg-[#fafafa] dark:bg-[#09090b] text-zinc-800 dark:text-zinc-100 font-sans overflow-hidden select-none transition-colors duration-250">
      
      {/* 🏢 Main Top Header Panel */}
      <header className="py-3.5 border-b border-zinc-200 dark:border-zinc-800/50 flex flex-col gap-3.5 px-6 bg-white dark:bg-[#09090b] shrink-0 z-20 transition-all duration-300">
        
        {/* Top level row of Header */}
        <div className="flex items-center justify-between w-full">
          {/* Brand Logo Glyph */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-zinc-900 dark:bg-white rounded flex items-center justify-center border border-zinc-700/50 dark:border-zinc-800/50 shadow-sm">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4.5 w-4.5 text-white dark:text-black" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-9.707a1 1 0 011.414 0L10 9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v12a1 1 0 11-2 0V3a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </div>
            {activeDomain && (
              <div className="animate-fade-in">
                <span className="text-sm font-semibold tracking-tight text-zinc-905 dark:text-white uppercase font-mono">{activeDomain}</span>
              </div>
            )}
          </div>

          {/* Website URL Input Bar */}
          <form onSubmit={handleDomainSubmit} className="flex-1 max-w-lg mx-8 flex flex-col gap-1">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Website URL</span>
              {isLoading && (
                <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-550 dark:text-zinc-450">
                  <span>Model:</span>
                  <span className="bg-zinc-150 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-1.5 py-0.5 rounded">Gemini 2.0 Flash</span>
                  <span className="text-zinc-300 dark:text-zinc-700">|</span>
                  <span>Time:</span>
                  <span className="text-zinc-800 dark:text-zinc-200 font-bold">{processingTime.toFixed(1)}s</span>
                </div>
              )}
            </div>
            
            <div className="relative flex items-center bg-zinc-100 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-800/50 rounded-md overflow-hidden transition focus-within:border-zinc-400 dark:focus-within:border-zinc-500 pr-1.5">
              <div className="pl-3 text-zinc-400 dark:text-zinc-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input 
                type="text" 
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                disabled={isLoading}
                placeholder={isLoading ? "DOM crawler active..." : "Enter brand domain (e.g. linear.app, v0.dev, apple.com)..."}
                className="w-full bg-transparent text-xs text-zinc-800 dark:text-zinc-300 placeholder-zinc-400 dark:placeholder-zinc-600 px-3 py-2.5 focus:outline-none disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={isLoading || !domainInput.trim()}
                className={`text-[10px] font-semibold px-3 py-1.5 rounded transition cursor-pointer ${
                  domainInput.trim() && !isLoading
                    ? 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200'
                    : 'bg-zinc-200 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-650 cursor-not-allowed'
                }`}
              >
                Analyze Website
              </button>
            </div>
          </form>

          {/* Right Status Badge & Theme Toggle */}
          <div className="flex items-center gap-4">
            
            {/* Monochromatic Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-md border border-zinc-200 dark:border-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer"
              title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m12.728 8.485A6 6 0 1111 6.004V6a6 6 0 017.078 5.642z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <div className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${isLoading ? 'bg-amber-500 animate-ping' : 'bg-green-500 animate-pulse'}`} />
              <span className="text-[10px] font-mono text-zinc-500">
                {isLoading ? 'Crawling Domain' : 'Pipeline Active'}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom level row of Header: Horizontal Pipeline Stages */}
        {isLoading && (
          <div className="w-full flex items-center justify-between border-t border-zinc-150 dark:border-zinc-900 pt-2 animate-fade-in">
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-505">
              <span className="font-semibold text-zinc-700 dark:text-zinc-400 uppercase font-mono">Pipeline Status:</span>
              <span className="font-mono text-zinc-905 dark:text-white animate-pulse">
                {currentLoadingStep === 0 && 'Indexing URL...'}
                {currentLoadingStep === 1 && 'Extracting HTML & Styles...'}
                {currentLoadingStep === 2 && 'Detecting SVG Brand Marks...'}
                {currentLoadingStep === 3 && 'Quantizing Color Spaces...'}
                {currentLoadingStep === 4 && 'Classifying Typographic Families...'}
                {currentLoadingStep === 5 && 'Compiling Design System Tokens...'}
                {currentLoadingStep === 6 && 'Writing Contextual Copy...'}
                {currentLoadingStep === 7 && 'Generating Layout Composition...'}
                {currentLoadingStep >= 8 && 'Rendering Canvas Outputs...'}
              </span>
            </div>

            <div className="flex items-center gap-1 xl:gap-2">
              {[
                'Crawling Website',
                'Extracting Brand Assets',
                'Detecting Logo',
                'Extracting Colors',
                'Identifying Typography',
                'Generating Design Tokens',
                'Writing Caption',
                'Creating Social Graphic',
                'Complete'
              ].map((stage, idx) => {
                const isCompleted = idx < currentLoadingStep;
                const isActive = idx === currentLoadingStep;
                return (
                  <div key={stage} className="flex items-center gap-0.5 xl:gap-1">
                    {idx > 0 && <span className="text-[9px] text-zinc-300 dark:text-zinc-800">→</span>}
                    <div 
                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono transition-all ${
                        isCompleted 
                          ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 font-medium' 
                          : isActive 
                          ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 font-bold border border-amber-250 dark:border-amber-900/60 animate-pulse'
                          : 'text-zinc-400 dark:text-zinc-650'
                      }`}
                      title={stage}
                    >
                      {isCompleted ? (
                        <span>✓</span>
                      ) : isActive ? (
                        <span className="inline-block w-1 h-1 rounded-full bg-amber-500 animate-ping mr-0.5" />
                      ) : null}
                      <span className="hidden xl:inline">{stage}</span>
                      <span className="xl:hidden">{idx + 1}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </header>

      {/* 🏢 3-Column Panoramic Workspace Layout (fixed height, non-scrolling) */}
      <div className="flex-1 flex overflow-hidden w-full bg-[#f5f5f7] dark:bg-[#050507] transition-colors duration-250">
        
        {/* Column 1: Left - Scraped URLs list */}
        <LeftColumn 
          scrapedDomains={scrapedDomains}
          activeDomain={activeDomain}
          onSelectDomain={selectDomain}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Column 2: Center - Live Canvas Simulator */}
        <CenterColumn 
          extractionStatus={extractionStatus}
          currentLoadingStep={currentLoadingStep}
          activePost={activePost}
          brandKit={brandKit}
          selectedPlatform={selectedPlatform}
          onPlatformChange={setSelectedPlatform}
          onPublish={() => setIsPublishOpen(true)}
          designTokens={designTokens}
          processingTime={processingTime}
        />

        {/* Column 3: Right - Operational Sidebar Console */}
        <RightColumn 
          brandKit={brandKit}
          chatHistory={chatHistory}
          isRefining={isRefining}
          onRefinePost={refinePost}
          designTokens={designTokens}
          onUpdateToken={updateDesignToken}
        />

      </div>

      {/* ⚙️ Developer Settings Panel Sheet/Drawer */}
      <SettingsDrawer 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKeys={apiKeys}
        onUpdateKeys={updateApiKeys}
      />

      {/* 📥 Approve & Publish Modal */}
      {activePost && (
        <PublishModal 
          isOpen={isPublishOpen}
          onClose={() => setIsPublishOpen(false)}
          activePost={activePost}
          onPublish={publishPost}
        />
      )}

    </div>
  );
}
