import { useState } from 'react';
import type { ApiKeys } from '../hooks/useBackend';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: ApiKeys;
  onUpdateKeys: (keys: Partial<ApiKeys>) => void;
}

export default function SettingsDrawer({ isOpen, onClose, apiKeys, onUpdateKeys }: SettingsDrawerProps) {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({
    firecrawl: false,
    gemini: false,
    openai: false,
    ayrshare: false
  });

  const toggleShowKey = (field: string) => {
    setShowKeys(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Body */}
      <div className="relative w-full max-w-md h-full bg-white dark:bg-[#09090b] border-l border-zinc-250 dark:border-zinc-800/50 flex flex-col p-6 overflow-y-auto no-scrollbar shadow-2xl transition-all duration-300 transform translate-x-0 transition-colors duration-250">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800/50 transition-colors duration-250">
          <div>
            <h2 className="text-lg font-medium text-zinc-900 dark:text-white tracking-tight letter-spacing-condensed">Developer Settings</h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Configure credentials for automated ingestion</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/50 text-zinc-450 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Inputs */}
        <div className="flex-1 py-6 space-y-6">
          
          {/* Firecrawl Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 tracking-wider uppercase">Firecrawl API Key</label>
              <span className="text-[10px] text-zinc-450 dark:text-zinc-600">Web Scraping</span>
            </div>
            <div className="relative">
              <input 
                type={showKeys.firecrawl ? 'text' : 'password'}
                value={apiKeys.firecrawlKey}
                onChange={(e) => onUpdateKeys({ firecrawlKey: e.target.value })}
                placeholder="fc_..."
                className="w-full bg-zinc-50 dark:bg-[#0d0d11] text-sm text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800/50 rounded-md px-3.5 py-2.5 pr-10 focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-500 font-mono transition"
              />
              <button 
                type="button"
                onClick={() => toggleShowKey('firecrawl')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-650 dark:text-zinc-500 dark:hover:text-zinc-300"
              >
                {showKeys.firecrawl ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Gemini Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 tracking-wider uppercase">Gemini API Key</label>
              <span className="text-[10px] text-zinc-450 dark:text-zinc-600">Core AI Generation</span>
            </div>
            <div className="relative">
              <input 
                type={showKeys.gemini ? 'text' : 'password'}
                value={apiKeys.geminiKey}
                onChange={(e) => onUpdateKeys({ geminiKey: e.target.value })}
                placeholder="AIzaSy..."
                className="w-full bg-zinc-50 dark:bg-[#0d0d11] text-sm text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800/50 rounded-md px-3.5 py-2.5 pr-10 focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-500 font-mono transition"
              />
              <button 
                type="button"
                onClick={() => toggleShowKey('gemini')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-650 dark:text-zinc-500 dark:hover:text-zinc-300"
              >
                {showKeys.gemini ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* OpenAI Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 tracking-wider uppercase">OpenAI API Key</label>
              <span className="text-[10px] text-zinc-450 dark:text-zinc-600">Vision Fallback</span>
            </div>
            <div className="relative">
              <input 
                type={showKeys.openai ? 'text' : 'password'}
                value={apiKeys.openaiKey}
                onChange={(e) => onUpdateKeys({ openaiKey: e.target.value })}
                placeholder="sk-proj-..."
                className="w-full bg-zinc-50 dark:bg-[#0d0d11] text-sm text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800/50 rounded-md px-3.5 py-2.5 pr-10 focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-500 font-mono transition"
              />
              <button 
                type="button"
                onClick={() => toggleShowKey('openai')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-650 dark:text-zinc-500 dark:hover:text-zinc-300"
              >
                {showKeys.openai ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Ayrshare Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-505 dark:text-zinc-400 tracking-wider uppercase">Ayrshare API Key</label>
              <span className="text-[10px] text-zinc-450 dark:text-zinc-600">Social Publishing</span>
            </div>
            <div className="relative">
              <input 
                type={showKeys.ayrshare ? 'text' : 'password'}
                value={apiKeys.ayrshareKey}
                onChange={(e) => onUpdateKeys({ ayrshareKey: e.target.value })}
                placeholder="ayr-..."
                className="w-full bg-zinc-50 dark:bg-[#0d0d11] text-sm text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800/50 rounded-md px-3.5 py-2.5 pr-10 focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-500 font-mono transition"
              />
              <button 
                type="button"
                onClick={() => toggleShowKey('ayrshare')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-650 dark:text-zinc-500 dark:hover:text-zinc-300"
              >
                {showKeys.ayrshare ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Auto-Save Switch */}
          <div className="flex items-center justify-between p-3.5 bg-zinc-55 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-800/50 rounded-md transition-colors duration-250">
            <div>
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-300">Auto-Save Context</span>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">Persist credentials to local storage state</p>
            </div>
            <button 
              type="button"
              onClick={() => onUpdateKeys({ autoSave: !apiKeys.autoSave })}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${apiKeys.autoSave ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-800'}`}
            >
              <span 
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-[#09090b] shadow ring-0 transition duration-200 ease-in-out ${apiKeys.autoSave ? 'translate-x-4' : 'translate-x-0'}`}
              />
            </button>
          </div>

        </div>

        {/* Footer info showing JSON ingestion structure */}
        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800/50 space-y-3 transition-colors duration-250">
          <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">n8n Ingestion Scaffold</span>
          <pre className="p-3 bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-800/50 rounded-md font-mono text-[10px] text-zinc-700 dark:text-zinc-400 overflow-x-auto transition-colors duration-250">
{`{
  "headers": {
    "X-Firecrawl-Key": "${apiKeys.firecrawlKey ? '••••••••' : ''}",
    "X-Gemini-Key": "${apiKeys.geminiKey ? '••••••••' : ''}",
    "X-OpenAI-Key": "${apiKeys.openaiKey ? '••••••••' : ''}",
    "Authorization": "Bearer ${apiKeys.ayrshareKey ? '••••••••' : ''}"
  }
}`}
          </pre>
        </div>

      </div>
    </div>
  );
}
