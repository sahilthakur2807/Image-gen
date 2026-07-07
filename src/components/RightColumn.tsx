import { useState, useRef, useEffect } from 'react';
import type { BrandKit, ChatMessage } from '../hooks/useBackend';

interface RightColumnProps {
  brandKit: BrandKit | null;
  chatHistory: ChatMessage[];
  isRefining: boolean;
  onRefinePost: (prompt: string) => void;
}

export default function RightColumn({ brandKit, chatHistory, isRefining, onRefinePost }: RightColumnProps) {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isRefining) return;
    onRefinePost(inputText);
    setInputText('');
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isRefining]);

  return (
    <div className="w-[340px] h-full bg-white dark:bg-[#09090b] border-l border-zinc-200 dark:border-zinc-800/50 flex flex-col justify-between overflow-hidden transition-colors duration-250">
      
      {/* Top Half: Extracted Brand Kit */}
      <div className="flex-1 border-b border-zinc-200 dark:border-zinc-800/50 p-4 flex flex-col overflow-y-auto no-scrollbar transition-colors duration-250">
        <div className="pb-3 border-b border-zinc-200 dark:border-zinc-800/50 flex items-center justify-between transition-colors duration-250">
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Extracted Brand Kit</span>
          <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 uppercase">
            {brandKit?.domain || 'unknown.com'}
          </span>
        </div>

        {brandKit ? (
          <div className="py-4 space-y-5">
            {/* Color Palette swatches */}
            <div className="space-y-2">
              <label className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Detected Colors</label>
              <div className="grid grid-cols-2 gap-2">
                {brandKit.colors.map((color, idx) => (
                  <div 
                    key={`${color}-${idx}`}
                    className="flex items-center gap-2 p-2 bg-zinc-50 dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800/50 rounded-md transition hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors duration-250"
                  >
                    <div 
                      className="h-6 w-6 rounded border border-black/10 dark:border-white/10 shrink-0" 
                      style={{ backgroundColor: color }}
                    />
                    <div className="min-w-0">
                      <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 uppercase">
                        {idx === 0 ? 'Primary' : idx === 1 ? 'Secondary' : idx === 2 ? 'Accent' : 'Muted'}
                      </p>
                      <p className="text-xs font-mono font-medium text-zinc-800 dark:text-white select-all uppercase">
                        {color}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-2">
              <label className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Typography Classification</label>
              <div className="p-3 bg-zinc-50 dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800/50 rounded-md space-y-1.5 transition-colors duration-250">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-200 font-mono">Font Class</span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">Gemini Vision Parse</span>
                </div>
                <div className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight letter-spacing-condensed">
                  {brandKit.fontConfig}
                </div>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-relaxed font-serif border-t border-zinc-200 dark:border-zinc-900 pt-1.5 mt-1 italic transition-colors duration-250">
                  "Agile automation empowers continuous pipelines."
                </p>
              </div>
            </div>

            {/* Logo Slots */}
            <div className="space-y-2">
              <label className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Logo Vector Slots</label>
              <div className="border border-dashed border-zinc-300 dark:border-zinc-800 rounded-md p-4 bg-zinc-50 dark:bg-[#0c0c0e] flex flex-col items-center justify-center gap-2 transition-colors duration-250">
                <div className="h-9 w-9 bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800/50 rounded-md flex items-center justify-center text-xs font-bold text-zinc-800 dark:text-white tracking-wider transition-colors duration-250">
                  {brandKit.logoUrl.substring(0, 3).toUpperCase()}
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-medium text-zinc-700 dark:text-zinc-300">SVG Logo Identified</p>
                  <p className="text-[8px] font-mono text-zinc-450 dark:text-zinc-600 mt-0.5">Parsed from header class: .logo</p>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <p className="text-xs text-zinc-400 dark:text-zinc-600">Pending URL domain scan</p>
          </div>
        )}
      </div>

      {/* Bottom Half: Chat History Terminal */}
      <div className="flex-1 flex flex-col overflow-hidden bg-zinc-50 dark:bg-[#070709] border-t border-zinc-250 dark:border-zinc-950 transition-colors duration-250">
        
        {/* Terminal Header */}
        <div className="p-3 bg-white dark:bg-[#09090b] border-b border-zinc-200 dark:border-zinc-800/50 flex items-center justify-between transition-colors duration-250">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Conversational Refiner</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-800 dark:bg-white shadow-[0_0_6px_rgba(0,0,0,0.15)] dark:shadow-[0_0_6px_rgba(255,255,255,0.7)] animate-pulse" />
            <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500">n8n Live</span>
          </div>
        </div>

        {/* Conversation Message List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {chatHistory.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div 
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${isUser ? 'ml-auto items-end' : 'mr-auto items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[8px] font-mono text-zinc-400 dark:text-zinc-600">
                    {isUser ? 'YOU' : 'AGENT'}
                  </span>
                  <span className="text-[8px] font-mono text-zinc-300 dark:text-zinc-700">•</span>
                  <span className="text-[8px] font-mono text-zinc-400 dark:text-zinc-600">{msg.timestamp}</span>
                </div>
                <div className={`p-2.5 rounded-md text-xs leading-relaxed transition-colors duration-250 ${
                  isUser 
                    ? 'bg-zinc-900 dark:bg-[#18181b] border border-zinc-850 dark:border-zinc-800/80 text-white' 
                    : 'bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-900 text-zinc-755 dark:text-zinc-400 shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            );
          })}

          {/* Refining Loader Indicator */}
          {isRefining && (
            <div className="flex flex-col max-w-[85%] mr-auto items-start animate-pulse">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[8px] font-mono text-zinc-400 dark:text-zinc-600">AGENT</span>
                <span className="text-[8px] font-mono text-zinc-300 dark:text-zinc-700">•</span>
                <span className="text-[8px] font-mono text-zinc-400 dark:text-zinc-600">Rendering</span>
              </div>
              <div className="p-2.5 rounded-md text-xs bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-900 text-zinc-500 flex items-center gap-2 transition-colors duration-250 shadow-sm">
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
              placeholder={isRefining ? 'Synthesizing changes...' : 'Shorten caption, swap brand style...'}
              className="flex-1 bg-transparent text-xs text-zinc-800 dark:text-zinc-300 placeholder-zinc-400 dark:placeholder-zinc-600 px-3 py-3 focus:outline-none disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={isRefining || !inputText.trim()}
              className={`p-1.5 rounded transition ${
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
