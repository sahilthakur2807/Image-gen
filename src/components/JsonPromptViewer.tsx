import { useState } from 'react';

interface JsonPromptViewerProps {
  isOpen: boolean;
  onClose: () => void;
  snapshots?: {
    brandKnowledge: any;
    creativeBrief: any;
    imagePrompt: any;
    generation: any;
    pipelineLog: any;
  };
}

type TabType = 'brandKnowledge' | 'creativeBrief' | 'imagePrompt' | 'generation' | 'pipelineLog';

export default function JsonPromptViewer({ isOpen, onClose, snapshots }: JsonPromptViewerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('generation');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Fallback defaults
  const activeJson = snapshots ? snapshots[activeTab] || { error: 'Snapshot data not available' } : { error: 'No generation metadata loaded.' };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(activeJson, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(activeJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}-${snapshots?.generation?.generationId || 'snapshot'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Syntax highlighting
  const highlightJson = (json: any, query: string, collapsed: boolean) => {
    let displayJson = json;
    if (collapsed) {
      // Simplified top-level keys representation
      displayJson = Object.keys(json).reduce((acc: any, key) => {
        const val = json[key];
        acc[key] = Array.isArray(val) 
          ? `[Array(${val.length})]` 
          : typeof val === 'object' && val !== null 
          ? `{Object(${Object.keys(val).length})}` 
          : val;
        return acc;
      }, {});
    }

    let str = JSON.stringify(displayJson, null, 2);
    // Escape HTML tags to prevent injections
    str = str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // JSON regex matcher for syntax color codes
    const jsonRegex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g;
    let html = str.replace(jsonRegex, (match) => {
      let cls = 'text-amber-500'; // Numbers default
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'text-sky-400 font-medium'; // Object Keys (VS Code Sky Blue)
        } else {
          cls = 'text-amber-200'; // Strings (VS Code warm orange/yellow strings)
        }
      } else if (/true|false/.test(match)) {
        cls = 'text-emerald-400 font-bold'; // Booleans
      } else if (/null/.test(match)) {
        cls = 'text-zinc-500'; // Null fallback
      }
      return `<span class="${cls}">${match}</span>`;
    });

    if (query.trim()) {
      // Safely highlight query search match
      const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const searchRegex = new RegExp(`(${escapedQuery})`, 'gi');
      html = html.replace(searchRegex, `<mark class="bg-yellow-500/40 text-yellow-100 font-bold px-0.5 rounded border border-yellow-500/20">$1</mark>`);
    }

    return html;
  };

  const tabs = [
    { id: 'brandKnowledge', label: 'Brand Kit' },
    { id: 'creativeBrief', label: 'Brief' },
    { id: 'imagePrompt', label: 'Prompt Package' },
    { id: 'generation', label: 'Metadata' },
    { id: 'pipelineLog', label: 'Pipeline Logs' }
  ] as const;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-end z-50 animate-fade-in">
      {/* Backdrop clicks close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* VS Code Dark panel Container */}
      <div className="relative w-full max-w-2xl h-full bg-[#1e1e1e] text-[#d4d4d4] border-l border-zinc-800 flex flex-col shadow-2xl animate-slide-left select-none">
        
        {/* Editor Top Bar Header */}
        <div className="bg-[#252526] px-5 py-4 border-b border-[#3c3c3c] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-zinc-550 text-xs font-mono">&lt;/&gt;</span>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">JSON Prompt Engine Inspector</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded text-zinc-500 hover:bg-[#333333] hover:text-white transition cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* VS Code tab headers row */}
        <div className="bg-[#2d2d2d] flex items-center border-b border-[#252526] overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-2.5 text-xs font-mono transition border-r border-[#252526] cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-[#1e1e1e] text-[#3b9ffd] border-t-2 border-t-[#3b9ffd] font-semibold' 
                  : 'text-zinc-400 hover:bg-[#2a2a2a] hover:text-zinc-200'
              }`}
            >
              {tab.label}.json
            </button>
          ))}
        </div>

        {/* Console Action toolbar */}
        <div className="bg-[#1e1e1e] p-3 border-b border-zinc-800/80 flex items-center justify-between gap-4 text-xs font-mono">
          {/* Search match */}
          <div className="relative flex-1 max-w-xs">
            <input 
              type="text"
              placeholder="Find (regex)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#3c3c3c] text-white border border-[#6b6b6b] focus:border-[#007acc] focus:outline-none rounded px-2.5 py-1 text-xs font-mono"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1.5 text-zinc-400 hover:text-white text-[10px]"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Collapse toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="px-2.5 py-1 bg-[#333333] hover:bg-[#444444] text-zinc-300 hover:text-white rounded border border-zinc-700 transition cursor-pointer"
            >
              {isCollapsed ? 'Expand All' : 'Collapse Keys'}
            </button>

            {/* Copy */}
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 bg-[#333333] hover:bg-[#444444] text-zinc-300 hover:text-white rounded border border-zinc-700 transition flex items-center gap-1 cursor-pointer"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              className="px-2.5 py-1 bg-[#007acc] hover:bg-[#0062a3] text-white rounded transition flex items-center gap-1 cursor-pointer shadow-sm"
            >
              Download
            </button>
          </div>
        </div>

        {/* Pretty print display box */}
        <div className="flex-1 overflow-auto p-5 font-mono text-xs bg-[#1e1e1e] select-text">
          <pre 
            className="leading-relaxed whitespace-pre-wrap select-text"
            dangerouslySetInnerHTML={{ 
              __html: highlightJson(activeJson, searchTerm, isCollapsed) 
            }} 
          />
        </div>

        {/* Footer info bar */}
        <div className="bg-[#007acc] text-white px-4 py-1.5 text-[10px] font-mono flex justify-between select-none">
          <span>LF • UTF-8 • JSON</span>
          <span>Snapshot Version: {snapshots?.generation?.promptVersion || 'v1.2'}</span>
        </div>

      </div>
    </div>
  );
}
