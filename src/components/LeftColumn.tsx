import type { PostItem } from '../hooks/useBackend';

interface LeftColumnProps {
  posts: PostItem[];
  activePost: PostItem | null;
  onSelectPost: (id: string) => void;
  onOpenSettings: () => void;
}

export default function LeftColumn({ posts, activePost, onSelectPost, onOpenSettings }: LeftColumnProps) {
  return (
    <div className="w-[280px] h-full bg-white dark:bg-[#09090b] border-r border-zinc-200 dark:border-zinc-800/50 flex flex-col justify-between transition-colors duration-250">
      
      {/* Upper Content Queue */}
      <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar">
        {/* Title */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800/50 flex items-center justify-between transition-colors duration-250">
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Content Queue</span>
          <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800/50 transition-colors duration-250">
            {posts.length} Posts
          </span>
        </div>

        {/* List items */}
        <div className="p-2 space-y-1">
          {posts.map((post) => {
            const isActive = activePost?.id === post.id;
            return (
              <button
                key={post.id}
                onClick={() => onSelectPost(post.id)}
                className={`w-full text-left p-3 rounded-md transition duration-200 border flex flex-col gap-2 ${
                  isActive 
                    ? 'bg-zinc-100 dark:bg-[#18181b] border-zinc-300 dark:border-zinc-700/80 text-zinc-900 dark:text-white' 
                    : 'bg-transparent border-transparent hover:bg-zinc-50 dark:hover:bg-[#0c0c0e] text-zinc-500 dark:text-zinc-400 hover:text-zinc-850 dark:hover:text-zinc-200'
                }`}
              >
                {/* Header line: Title & status dot */}
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-medium tracking-tight truncate flex-1">
                    {post.title}
                  </span>
                  
                  {/* Status Indicator Dot */}
                  <div className="flex items-center gap-1.5 ml-2">
                    <span 
                      className={`h-1.5 w-1.5 rounded-full ${
                        post.status === 'Scheduled' 
                          ? 'bg-zinc-800 dark:bg-white shadow-[0_0_8px_rgba(0,0,0,0.15)] dark:shadow-[0_0_8px_rgba(255,255,255,0.8)]' 
                          : post.status === 'Ready'
                          ? 'bg-zinc-500 dark:bg-zinc-400'
                          : 'bg-zinc-350 dark:bg-zinc-700'
                      }`}
                    />
                    <span className="text-[9px] uppercase tracking-wider font-mono text-zinc-450 dark:text-zinc-500 text-right">
                      {post.status}
                    </span>
                  </div>
                </div>

                {/* Badges line */}
                <div className="flex flex-wrap gap-1">
                  {post.targetPlatforms.map((platform) => (
                    <span 
                      key={platform} 
                      className="text-[9px] font-mono bg-zinc-105 dark:bg-[#09090b]/80 border border-zinc-200 dark:border-zinc-800/50 text-zinc-400 dark:text-zinc-500 px-1.5 py-0.5 rounded transition-colors duration-250"
                    >
                      {platform === 'LinkedIn' ? 'LN' : platform === 'Instagram' ? 'IG' : 'X'}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Settings Trigger */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800/50 transition-colors duration-250">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-[#0c0c0e] dark:hover:bg-[#18181b] border border-zinc-200 dark:border-zinc-800/50 text-zinc-650 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition text-xs font-medium transition-colors duration-250"
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
