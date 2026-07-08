import { useState, useEffect } from 'react';
import type { ApiKeys } from '../hooks/useBackend';

interface ImageGenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (provider: 'gemini' | 'openai' | 'mock', settings: any) => void;
  companyName: string;
  apiKeys: ApiKeys;
}

export default function ImageGenModal({ isOpen, onClose, onGenerate, companyName, apiKeys }: ImageGenModalProps) {
  // If in Company Setup Mode, all premium adapters are unlocked (uses backend keys).
  // If in Custom Provider Mode, check if the session keys have been configured in Settings.
  const isCompanySetup = apiKeys.mode === 'company';
  const geminiAvailable = isCompanySetup || !!(apiKeys.customGeminiKey && apiKeys.customGeminiKey.trim().length > 0);
  const openaiAvailable = isCompanySetup || !!(apiKeys.customOpenaiKey && apiKeys.customOpenaiKey.trim().length > 0);

  const [provider, setProvider] = useState<'gemini' | 'openai' | 'mock'>('mock');

  // Reset selected provider based on available keys when the modal opens
  useEffect(() => {
    if (isOpen) {
      if (geminiAvailable) {
        setProvider('gemini');
      } else if (openaiAvailable) {
        setProvider('openai');
      } else {
        setProvider('mock');
      }
    }
  }, [isOpen, geminiAvailable, openaiAvailable]);

  // Settings state
  const [quality, setQuality] = useState<'standard' | 'high' | 'ultra'>('high');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:5' | '16:9'>('1:1');
  const [slides, setSlides] = useState<number>(1);
  const [refStrength, setRefStrength] = useState<'low' | 'medium' | 'high'>('medium');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(provider, {
      quality,
      aspectRatio,
      slides,
      referenceStrength: refStrength
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl flex flex-col transition-colors duration-250">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-150 dark:border-zinc-900 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Image Generation Provider</h2>
            <p className="text-[11px] text-zinc-400 mt-1">Configure layout, quality, and models for {companyName}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-zinc-455 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
          
          {/* Provider Option Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-widest block">Select AI Model</span>
              <span className="text-[9px] bg-zinc-150 dark:bg-zinc-900 font-mono text-zinc-550 dark:text-zinc-400 px-2 py-0.5 rounded uppercase">
                Mode: {isCompanySetup ? 'Company Setup' : 'Custom Provider'}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Google Gemini Card */}
              <div 
                onClick={() => geminiAvailable && setProvider('gemini')}
                className={`border rounded-xl p-4 cursor-pointer transition relative flex flex-col justify-between ${
                  !geminiAvailable 
                    ? 'opacity-60 bg-zinc-50/20 dark:bg-zinc-950/5 border-zinc-200 dark:border-zinc-850 cursor-not-allowed'
                    : provider === 'gemini' 
                    ? 'border-zinc-900 dark:border-white bg-zinc-50/50 dark:bg-zinc-950/20' 
                    : 'border-zinc-200 dark:border-zinc-850 hover:border-zinc-350 dark:hover:border-zinc-700 bg-transparent'
                }`}
              >
                {provider === 'gemini' && geminiAvailable && (
                  <div className="absolute top-3 right-3 h-4 w-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center text-[9px] font-bold">✓</div>
                )}
                {!geminiAvailable && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 px-1.5 py-0.5 rounded text-[8px] font-bold text-zinc-450 uppercase">
                    🔒 Locked
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">Google Gemini</span>
                  </div>
                  <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 mt-0.5">Model: Imagen 3.0</p>
                  <p className="text-[11px] text-zinc-550 dark:text-zinc-450 mt-2 leading-normal">
                    High fidelity photorealistic results and text adherence.
                  </p>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-1 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900 text-[9px]">
                  <div>
                    <span className="text-[7px] font-semibold text-zinc-450 dark:text-zinc-555 uppercase">Quality</span>
                    <p className="font-bold text-zinc-750 dark:text-zinc-305 mt-0.5">High</p>
                  </div>
                  <div>
                    <span className="text-[7px] font-semibold text-zinc-450 dark:text-zinc-555 uppercase">Speed</span>
                    <p className="font-bold text-zinc-750 dark:text-zinc-305 mt-0.5">3-5s</p>
                  </div>
                  <div>
                    <span className="text-[7px] font-semibold text-zinc-450 dark:text-zinc-555 uppercase">Cost</span>
                    <p className="font-bold text-zinc-750 dark:text-zinc-305 mt-0.5">{isCompanySetup ? 'Free' : 'Custom'}</p>
                  </div>
                </div>
              </div>

              {/* OpenAI Card */}
              <div 
                onClick={() => openaiAvailable && setProvider('openai')}
                className={`border rounded-xl p-4 cursor-pointer transition relative flex flex-col justify-between ${
                  !openaiAvailable 
                    ? 'opacity-60 bg-zinc-50/20 dark:bg-zinc-950/5 border-zinc-200 dark:border-zinc-850 cursor-not-allowed'
                    : provider === 'openai' 
                    ? 'border-zinc-900 dark:border-white bg-zinc-50/50 dark:bg-zinc-950/20' 
                    : 'border-zinc-200 dark:border-zinc-850 hover:border-zinc-350 dark:hover:border-zinc-700 bg-transparent'
                }`}
              >
                {provider === 'openai' && openaiAvailable && (
                  <div className="absolute top-3 right-3 h-4 w-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center text-[9px] font-bold">✓</div>
                )}
                {!openaiAvailable && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 px-1.5 py-0.5 rounded text-[8px] font-bold text-zinc-450 uppercase">
                    🔒 Locked
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">OpenAI GPT Image</span>
                  </div>
                  <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-550 mt-0.5">Model: DALL-E 3</p>
                  <p className="text-[11px] text-zinc-550 dark:text-zinc-455 mt-2 leading-normal">
                    Rich illustrations and strong prompt details alignment.
                  </p>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-1 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900 text-[9px]">
                  <div>
                    <span className="text-[7px] font-semibold text-zinc-450 dark:text-zinc-555 uppercase">Quality</span>
                    <p className="font-bold text-zinc-750 dark:text-zinc-305 mt-0.5">High</p>
                  </div>
                  <div>
                    <span className="text-[7px] font-semibold text-zinc-450 dark:text-zinc-555 uppercase">Speed</span>
                    <p className="font-bold text-zinc-750 dark:text-zinc-305 mt-0.5">5-8s</p>
                  </div>
                  <div>
                    <span className="text-[7px] font-semibold text-zinc-450 dark:text-zinc-555 uppercase">Cost</span>
                    <p className="font-bold text-zinc-750 dark:text-zinc-305 mt-0.5">{isCompanySetup ? 'Free' : 'Custom'}</p>
                  </div>
                </div>
              </div>

              {/* Company Default (Skip Card) */}
              <div 
                onClick={() => setProvider('mock')}
                className={`border rounded-xl p-4 cursor-pointer transition relative flex flex-col justify-between ${
                  provider === 'mock' 
                    ? 'border-zinc-900 dark:border-white bg-zinc-50/50 dark:bg-zinc-950/20' 
                    : 'border-zinc-200 dark:border-zinc-850 hover:border-zinc-350 dark:hover:border-zinc-700 bg-transparent'
                }`}
              >
                {provider === 'mock' && (
                  <div className="absolute top-3 right-3 h-4 w-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center text-[9px] font-bold">✓</div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">Company Default</span>
                    <span className="text-[9px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Skip</span>
                  </div>
                  <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 mt-0.5">Model: Brand Templates</p>
                  <p className="text-[11px] text-zinc-550 dark:text-zinc-450 mt-2 leading-normal">
                    Uses local brand gradients and layouts. Instant but basic quality.
                  </p>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-1 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900 text-[9px]">
                  <div>
                    <span className="text-[7px] font-semibold text-zinc-450 dark:text-zinc-555 uppercase">Quality</span>
                    <p className="font-bold text-zinc-750 dark:text-zinc-305 mt-0.5">Basic</p>
                  </div>
                  <div>
                    <span className="text-[7px] font-semibold text-zinc-450 dark:text-zinc-555 uppercase">Speed</span>
                    <p className="font-bold text-zinc-750 dark:text-zinc-305 mt-0.5">Instant</p>
                  </div>
                  <div>
                    <span className="text-[7px] font-semibold text-zinc-450 dark:text-zinc-555 uppercase">Cost</span>
                    <p className="font-bold text-zinc-750 dark:text-zinc-305 mt-0.5">Free</p>
                  </div>
                </div>
              </div>

            </div>
            
            {/* API Key Missing Warnings */}
            {!geminiAvailable && !openaiAvailable && (
              <div className="bg-amber-50 dark:bg-amber-955/20 text-amber-800 dark:text-amber-400 p-3 rounded-lg text-[10.5px] leading-relaxed border border-amber-200/50 mt-2">
                ⚠️ <strong>No Image API Keys Configured</strong>. Google Gemini and OpenAI are locked. Using the **Company Default Image Generator** as a fallback. Open Developer Settings (top-left ⚙️) to unlock premium models.
              </div>
            )}
          </div>

          {/* Configuration Settings */}
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest block">Generation Settings</span>
            
            <div className="grid grid-cols-2 gap-4">
              
              {/* Aspect Ratio */}
              <div>
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide block mb-1.5">Aspect Ratio</label>
                <div className="flex bg-zinc-100 dark:bg-zinc-900/60 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-850">
                  {(['1:1', '4:5', '16:9'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setAspectRatio(ratio)}
                      className={`flex-1 text-center py-1 text-xs rounded transition-all font-semibold cursor-pointer ${
                        aspectRatio === ratio 
                          ? 'bg-white dark:bg-[#18181b] text-zinc-900 dark:text-white shadow-sm border border-zinc-205 dark:border-zinc-700/50' 
                          : 'text-zinc-550 hover:text-zinc-850 dark:hover:text-zinc-305'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Quality */}
              <div>
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide block mb-1.5">Image Quality</label>
                <div className="flex bg-zinc-100 dark:bg-zinc-900/60 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-850">
                  {(['standard', 'high', 'ultra'] as const).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuality(q)}
                      className={`flex-1 text-center py-1 text-xs rounded transition-all font-semibold capitalize cursor-pointer ${
                        quality === q 
                          ? 'bg-white dark:bg-[#18181b] text-zinc-900 dark:text-white shadow-sm border border-zinc-205 dark:border-zinc-700/50' 
                          : 'text-zinc-550 hover:text-zinc-850 dark:hover:text-zinc-305'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slides count */}
              <div>
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wide block mb-1.5">Carousel Slides</label>
                <div className="flex bg-zinc-100 dark:bg-zinc-900/60 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-850">
                  {([1, 3, 5, 7] as const).map((slideNum) => (
                    <button
                      key={slideNum}
                      type="button"
                      onClick={() => setSlides(slideNum)}
                      className={`flex-1 text-center py-1 text-xs rounded transition-all font-semibold cursor-pointer ${
                        slides === slideNum 
                          ? 'bg-white dark:bg-[#18181b] text-zinc-900 dark:text-white shadow-sm border border-zinc-205 dark:border-zinc-700/50' 
                          : 'text-zinc-550 hover:text-zinc-850 dark:hover:text-zinc-305'
                      }`}
                    >
                      {slideNum}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reference Strength */}
              <div>
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-wide block mb-1.5">Reference Strength</label>
                <div className="flex bg-zinc-100 dark:bg-zinc-900/60 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-850">
                  {(['low', 'medium', 'high'] as const).map((strength) => (
                    <button
                      key={strength}
                      type="button"
                      onClick={() => setRefStrength(strength)}
                      className={`flex-1 text-center py-1 text-xs rounded transition-all font-semibold capitalize cursor-pointer ${
                        refStrength === strength 
                          ? 'bg-white dark:bg-[#18181b] text-zinc-900 dark:text-white shadow-sm border border-zinc-205 dark:border-zinc-700/50' 
                          : 'text-zinc-550 hover:text-zinc-850 dark:hover:text-zinc-305'
                      }`}
                    >
                      {strength}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Submit Footer */}
          <div className="pt-4 border-t border-zinc-150 dark:border-zinc-900 flex justify-end gap-3.5">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-350 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-xs font-semibold px-5 py-2 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 dark:text-black rounded-xl transition shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Synthesize AI Image
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
