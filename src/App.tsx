import { useState, useEffect } from 'react';
import { useBackend } from './hooks/useBackend';
import LeftColumn from './components/LeftColumn';
import CenterColumn from './components/CenterColumn';
import RightColumn from './components/RightColumn';
import SettingsDrawer from './components/SettingsDrawer';

export default function App() {
  const {
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
  } = useBackend();

  const [domainInput, setDomainInput] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
      <header className="h-14 border-b border-zinc-200 dark:border-zinc-800/50 flex items-center justify-between px-6 bg-white dark:bg-[#09090b] shrink-0 z-20 transition-colors duration-250">
        
        {/* Brand Logo Glyph */}
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 bg-zinc-900 dark:bg-white rounded flex items-center justify-center border border-zinc-700/50 dark:border-zinc-800/50">
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
          <div>
            <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white letter-spacing-condensed">Antigravity Canvas</span>
            <span className="text-[9px] font-mono text-zinc-500 ml-2 uppercase bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/50 px-1.5 py-0.5 rounded">
              v1.0.0-Beta
            </span>
          </div>
        </div>

        {/* Domain Scraper Input Bar */}
        <form onSubmit={handleDomainSubmit} className="flex-1 max-w-md mx-8">
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
              className={`text-[10px] font-semibold px-2.5 py-1.5 rounded transition ${
                domainInput.trim() && !isLoading
                  ? 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200'
                  : 'bg-zinc-200 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600 cursor-not-allowed'
              }`}
            >
              Scrape Brand
            </button>
          </div>
        </form>

        {/* Right Status Badge & Theme Toggle */}
        <div className="flex items-center gap-4">
          
          {/* Monochromatic Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md border border-zinc-200 dark:border-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition"
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
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-900 dark:bg-white animate-pulse" />
            <span className="text-[10px] font-mono text-zinc-500">Pipeline Active</span>
          </div>
        </div>

      </header>

      {/* 🏢 3-Column Panoramic Workspace Layout (fixed height, non-scrolling) */}
      <div className="flex-1 flex overflow-hidden w-full bg-[#f5f5f7] dark:bg-[#050507] transition-colors duration-250">
        
        {/* Column 1: Left - Today's Content Queue */}
        <LeftColumn 
          posts={posts}
          activePost={activePost}
          onSelectPost={selectPost}
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
          onPublish={publishPost}
        />

        {/* Column 3: Right - Operational Sidebar Console */}
        <RightColumn 
          brandKit={brandKit}
          chatHistory={chatHistory}
          isRefining={isRefining}
          onRefinePost={refinePost}
        />

      </div>

      {/* ⚙️ Developer Settings Panel Sheet/Drawer */}
      <SettingsDrawer 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKeys={apiKeys}
        onUpdateKeys={updateApiKeys}
      />

    </div>
  );
}
