interface PromptDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  promptText: string;
  usedAssets: string[];
  promptVersion?: string;
}

export default function PromptDetailsModal({ isOpen, onClose, promptText, usedAssets, promptVersion = 'v1.1' }: PromptDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto no-scrollbar shadow-2xl flex flex-col transition-colors duration-250">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-150 dark:border-zinc-900 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">AI Prompt Details</h2>
            <p className="text-[11px] text-zinc-400 mt-1">Detailed prompt text and reference configuration</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-zinc-450 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 flex-1">
          
          {/* Prompt Version Badge */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-450 dark:text-zinc-550">Prompt Version</span>
            <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-850 dark:text-zinc-200 px-2 py-0.5 rounded font-mono font-bold">
              {promptVersion}
            </span>
          </div>

          {/* Visual Prompt Textarea copy */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest block">Visual Prompt</label>
            <div className="p-4 bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-150 dark:border-zinc-900 rounded-xl font-sans text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed max-h-[40vh] overflow-y-auto selection:bg-zinc-200">
              {promptText}
            </div>
          </div>

          {/* References Checklist */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-widest block">Used Reference Assets</label>
            <div className="flex flex-wrap gap-2 pt-1">
              {usedAssets.length > 0 ? (
                usedAssets.map((asset) => (
                  <span 
                    key={asset}
                    className="text-[10px] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-850 px-2.5 py-1 rounded-full font-mono text-zinc-650 dark:text-zinc-305 font-medium"
                  >
                    🔗 {asset}
                  </span>
                ))
              ) : (
                <span className="text-xs text-zinc-400">No reference assets used.</span>
              )}
            </div>
          </div>

          {/* Close Action */}
          <div className="pt-4 border-t border-zinc-150 dark:border-zinc-900 flex justify-end">
            <button
              onClick={onClose}
              className="text-xs font-semibold px-5 py-2 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 dark:text-black rounded-xl transition cursor-pointer shadow-md"
            >
              Close Details
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
