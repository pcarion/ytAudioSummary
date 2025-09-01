import { Rss, ChevronRight } from 'lucide-react';

interface FeedPanelProps {
  feedCount: number;
  onNavigateToFeed: () => void;
}

export function FeedPanel({ feedCount, onNavigateToFeed }: FeedPanelProps) {
  return (
    <div
      className="flex-1 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-3 rounded-lg mb-4 border border-green-200 dark:border-green-800 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] hover:border-green-300 dark:hover:border-green-700"
      onClick={onNavigateToFeed}
    >
      <div className="flex items-center justify-between">
        <Rss className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
        <div className="flex-1 text-center">
          <div className="text-sm font-medium text-green-900 dark:text-green-100">
            Feed
          </div>
          <div className="text-lg font-bold text-green-900 dark:text-green-100">
            {feedCount}
          </div>
        </div>
      </div>
    </div>
  );
}
