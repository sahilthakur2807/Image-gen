import { useState } from 'react';
import type { PostItem } from '../hooks/useBackend';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePost: PostItem;
  onPublish: (postId: string) => void;
}

export default function PublishModal({ isOpen, onClose, activePost, onPublish }: PublishModalProps) {
  const [selectedChannels, setSelectedChannels] = useState<('LinkedIn' | 'Instagram' | 'Facebook' | 'X')[]>(() => {
    return activePost.targetPlatforms;
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [actionType, setActionType] = useState<'publish' | 'schedule' | 'approve' | null>(null);

  if (!isOpen) return null;

  const toggleChannel = (channel: 'LinkedIn' | 'Instagram' | 'Facebook' | 'X') => {
    setSelectedChannels(prev => 
      prev.includes(channel) 
        ? prev.filter(c => c !== channel) 
        : [...prev, channel]
    );
  };

  const handleAction = (type: 'publish' | 'schedule' | 'approve') => {
    setActionType(type);
    setTimeout(() => {
      setIsSuccess(true);
      setTimeout(() => {
        onPublish(activePost.id);
        setIsSuccess(false);
        setActionType(null);
        onClose();
      }, 1500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-sm bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-2xl overflow-hidden transition-all duration-300 transform scale-100">
        
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-4 text-center animate-fade-in">
            <div className="h-12 w-12 rounded-full bg-green-50 dark:bg-green-950/30 flex items-center justify-center text-green-600 dark:text-green-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                {actionType === 'publish' && 'Published Successfully!'}
                {actionType === 'schedule' && 'Campaign Scheduled!'}
                {actionType === 'approve' && 'Post Approved!'}
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Dispatched to: {selectedChannels.join(', ')}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Header */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight">
                Approve & Publish Campaign
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Select target social media publication channels
              </p>
            </div>

            {/* Channels Select Grid */}
            <div className="grid grid-cols-2 gap-2">
              {(['LinkedIn', 'Instagram', 'Facebook', 'X'] as const).map(channel => {
                const isSelected = selectedChannels.includes(channel);
                return (
                  <button
                    key={channel}
                    type="button"
                    onClick={() => toggleChannel(channel)}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left text-xs font-medium transition cursor-pointer select-none ${
                      isSelected 
                        ? 'bg-zinc-50 dark:bg-[#121217] border-zinc-900 dark:border-white text-zinc-900 dark:text-white' 
                        : 'bg-transparent border-zinc-200 dark:border-zinc-800/60 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <div className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${
                      isSelected 
                        ? 'bg-zinc-900 border-zinc-900 dark:bg-white dark:border-white text-white dark:text-black' 
                        : 'border-zinc-300 dark:border-zinc-700'
                    }`}>
                      {isSelected && (
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    {channel}
                  </button>
                );
              })}
            </div>

            {/* Actions Footer */}
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleAction('approve')}
                  disabled={actionType !== null || selectedChannels.length === 0}
                  className="flex-1 py-2 px-3 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-center transition disabled:opacity-40"
                >
                  {actionType === 'approve' ? 'Approving...' : 'Approve Only'}
                </button>
                <button
                  type="button"
                  onClick={() => handleAction('schedule')}
                  disabled={actionType !== null || selectedChannels.length === 0}
                  className="flex-1 py-2 px-3 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-center transition disabled:opacity-40"
                >
                  {actionType === 'schedule' ? 'Scheduling...' : 'Schedule'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleAction('publish')}
                disabled={actionType !== null || selectedChannels.length === 0}
                className="w-full py-2.5 px-4 text-xs font-semibold rounded-md bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition text-center disabled:opacity-40"
              >
                {actionType === 'publish' ? 'Publishing...' : 'Publish Now'}
              </button>

              <button
                type="button"
                onClick={onClose}
                disabled={actionType !== null}
                className="w-full text-[10px] text-zinc-450 hover:text-zinc-800 dark:hover:text-zinc-350 text-center py-1 transition mt-1"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
