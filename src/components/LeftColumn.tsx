interface LeftColumnProps {
  scrapedDomains: string[];
  activeDomain: string | null;
  onSelectDomain: (domain: string) => void;
  onOpenSettings: () => void;
}

export default function LeftColumn({ 
  scrapedDomains, 
  activeDomain, 
  onSelectDomain, 
  onOpenSettings 
}: LeftColumnProps) {
  return (
    <div className="w-[300px] h-full bg-white dark:bg-[#09090b] border-r border-zinc-200 dark:border-zinc-800/50 flex flex-col justify-between transition-colors duration-250 shrink-0">
      
      {/* Upper Scraped URLs list */}
      <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar">
        {/* Title */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800/50 flex items-center justify-between transition-colors duration-250">
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-550 dark:text-zinc-400">Scraped Websites</span>
          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800/50 transition-colors duration-250">
            {scrapedDomains.length} Domains
          </span>
        </div>

        {/* List items */}
        <div className="p-3.5 space-y-2">
          {scrapedDomains.length === 0 ? (
            <div className="text-center py-8 text-zinc-400 dark:text-zinc-650 text-xs">
              No websites analyzed yet.
            </div>
          ) : (
            scrapedDomains.map((domain) => {
              const isActive = activeDomain === domain;
              return (
                <button
                  key={domain}
                  onClick={() => onSelectDomain(domain)}
                  className={`w-full text-left p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all duration-200 ${
                    isActive 
                      ? 'bg-zinc-50 dark:bg-[#141419] border-zinc-400 dark:border-zinc-700 text-zinc-900 dark:text-white shadow-sm font-semibold' 
                      : 'bg-transparent border-zinc-200/60 dark:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-[#0c0c0e] text-zinc-500 dark:text-zinc-400 hover:text-zinc-850 hover:border-zinc-350 dark:hover:border-zinc-800'
                  }`}
                >
                  {/* Brand glyph */}
                  <div className="h-6 w-6 rounded bg-zinc-900 dark:bg-zinc-800 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {domain.substring(0, 2).toUpperCase()}
                  </div>
                  
                  {/* Domain metadata */}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs truncate font-mono text-zinc-800 dark:text-zinc-200">
                      {domain}
                    </p>
                  </div>

                  {/* Active Indicator */}
                  {isActive && (
                    <span className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom Settings Trigger */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800/50 transition-colors duration-250 bg-zinc-50/50 dark:bg-[#09090b]/50">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white hover:bg-zinc-50 dark:bg-[#0c0c0e] dark:hover:bg-[#141419] border border-zinc-250 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition text-xs font-semibold shadow-sm cursor-pointer"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 animate-spin-slow" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            style={{ animationDuration: '8s' }}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
            />
          </svg>
          API Integrations
        </button>
      </div>

    </div>
  );
}
