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
    gemini: false,
    openai: false
  });

  const toggleShowKey = (field: string) => {
    setShowKeys(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
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
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Configure crawling and image generation services</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/50 text-zinc-450 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Inputs */}
        <div className="flex-1 py-6 space-y-6">

          {/* Internal Services Section */}
          <div className="space-y-3 bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest block">Managed Internal Services</span>
            <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-450 leading-relaxed">
              <p>
                🌐 **Firecrawl Web Crawler** and 🧠 **Gemini Brain (Strategy Engine)** are fully managed internally by the application setup.
              </p>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                Credentials are automatically resolved from secure environment files (<code>.env.local</code>) on the server. No configuration required.
              </p>
            </div>
          </div>

          {/* Image Generation Config Section */}
          <div className="space-y-4 pt-2">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest block">Image Generation Infrastructure</span>
            
            {/* Mode Select Buttons */}
            <div className="flex bg-zinc-100 dark:bg-zinc-900/60 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-850">
              <button
                type="button"
                onClick={() => onUpdateKeys({ mode: 'company' })}
                className={`flex-1 text-center py-1.5 text-xs rounded transition-all font-semibold cursor-pointer ${
                  apiKeys.mode === 'company' 
                    ? 'bg-white dark:bg-[#18181b] text-zinc-900 dark:text-white shadow-xs border border-zinc-200 dark:border-zinc-700/50' 
                    : 'text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-305'
                }`}
              >
                Company Setup (Default)
              </button>
              <button
                type="button"
                onClick={() => onUpdateKeys({ mode: 'custom' })}
                className={`flex-1 text-center py-1.5 text-xs rounded transition-all font-semibold cursor-pointer ${
                  apiKeys.mode === 'custom' 
                    ? 'bg-white dark:bg-[#18181b] text-zinc-900 dark:text-white shadow-xs border border-zinc-200 dark:border-zinc-700/50' 
                    : 'text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-305'
                }`}
              >
                Custom Provider
              </button>
            </div>

            {/* Render based on Mode */}
            {apiKeys.mode === 'company' ? (
              <div className="space-y-4 animate-fade-in">
                {/* Company Setup Mode Description */}
                <div className="bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800/40 space-y-3">
                  <p className="text-xs text-zinc-650 dark:text-zinc-300 font-medium">
                    ✨ Managed Company Setup Active
                  </p>
                  <p className="text-[11.5px] text-zinc-500 dark:text-zinc-400 leading-normal">
                    This project is currently using the managed company image generation infrastructure. No API key required.
                  </p>
                  <div className="bg-white dark:bg-zinc-950 p-3 rounded-lg border border-zinc-150 dark:border-zinc-900 text-[10.5px] text-zinc-450 dark:text-zinc-500 leading-relaxed shadow-xs">
                    💡 Managed mode provides a fast and simple experience using our hosted infrastructure. For the highest possible image quality, latest model releases, and full control over generation, connect your own OpenAI or Gemini Image API.
                  </div>
                </div>

                {/* Company setup model choice */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">Hosted Company Model</label>
                  <div className="flex bg-zinc-100 dark:bg-zinc-900/60 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-850">
                    <button
                      type="button"
                      onClick={() => onUpdateKeys({ provider: 'gemini' })}
                      className={`flex-1 text-center py-1 text-xs rounded transition-all font-semibold cursor-pointer ${
                        apiKeys.provider === 'gemini' 
                          ? 'bg-white dark:bg-[#18181b] text-zinc-900 dark:text-white shadow-xs' 
                          : 'text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-305'
                      }`}
                    >
                      Google Gemini Image
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateKeys({ provider: 'openai' })}
                      className={`flex-1 text-center py-1 text-xs rounded transition-all font-semibold cursor-pointer ${
                        apiKeys.provider === 'openai' 
                          ? 'bg-white dark:bg-[#18181b] text-zinc-900 dark:text-white shadow-xs' 
                          : 'text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-305'
                      }`}
                    >
                      OpenAI GPT Image
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5 animate-fade-in">
                {/* Custom Provider Choice */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">Select Custom Provider</label>
                  <div className="flex bg-zinc-100 dark:bg-zinc-900/60 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-850">
                    <button
                      type="button"
                      onClick={() => onUpdateKeys({ provider: 'gemini' })}
                      className={`flex-1 text-center py-1 text-xs rounded transition-all font-semibold cursor-pointer ${
                        apiKeys.provider === 'gemini' 
                          ? 'bg-white dark:bg-[#18181b] text-zinc-900 dark:text-white shadow-xs' 
                          : 'text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-305'
                      }`}
                    >
                      Google Gemini Image
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateKeys({ provider: 'openai' })}
                      className={`flex-1 text-center py-1 text-xs rounded transition-all font-semibold cursor-pointer ${
                        apiKeys.provider === 'openai' 
                          ? 'bg-white dark:bg-[#18181b] text-zinc-900 dark:text-white shadow-xs' 
                          : 'text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-305'
                      }`}
                    >
                      OpenAI GPT Image
                    </button>
                  </div>
                </div>

                {/* API Key inputs depending on selected provider */}
                {apiKeys.provider === 'gemini' ? (
                  <div className="space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 tracking-wider uppercase">Google Gemini Image API Key</label>
                      <span className="text-[9px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-mono px-1 rounded">Session Only</span>
                    </div>
                    <div className="relative">
                      <input 
                        type={showKeys.gemini ? 'text' : 'password'}
                        value={apiKeys.customGeminiKey}
                        onChange={(e) => onUpdateKeys({ customGeminiKey: e.target.value })}
                        placeholder="AIzaSy..."
                        className="w-full bg-zinc-50 dark:bg-[#0d0d11] text-sm text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800/50 rounded-md px-3.5 py-2.5 pr-10 focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-500 font-mono transition shadow-xs"
                      />
                      <button 
                        type="button"
                        onClick={() => toggleShowKey('gemini')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-650 dark:text-zinc-500 dark:hover:text-zinc-300 cursor-pointer"
                      >
                        {showKeys.gemini ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 tracking-wider uppercase">OpenAI Image API Key</label>
                      <span className="text-[9px] bg-zinc-100 dark:bg-zinc-800 text-zinc-505 font-mono px-1 rounded">Session Only</span>
                    </div>
                    <div className="relative">
                      <input 
                        type={showKeys.openai ? 'text' : 'password'}
                        value={apiKeys.customOpenaiKey}
                        onChange={(e) => onUpdateKeys({ customOpenaiKey: e.target.value })}
                        placeholder="sk-proj-..."
                        className="w-full bg-zinc-50 dark:bg-[#0d0d11] text-sm text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800/50 rounded-md px-3.5 py-2.5 pr-10 focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-500 font-mono transition shadow-xs"
                      />
                      <button 
                        type="button"
                        onClick={() => toggleShowKey('openai')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-650 dark:text-zinc-500 dark:hover:text-zinc-300 cursor-pointer"
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
                )}
                
                {/* Security info card */}
                <div className="bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 p-3 rounded-lg text-[10.5px] leading-relaxed border border-amber-200/50 shadow-xs">
                  💡 **Session Key Policy**: This API key exists only in the current browser session. It is never saved to localStorage, never stored in a database, and never overwrites server environment files. Closing the browser tab clears it automatically.
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
