import { ExternalLink, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeedContent {
  contentId: string;
  title: string;
  author: string;
  pathToAudio: string;
  pathToImage: string;
  originalContentUrl: string;
}

interface FeedElementProps {
  item: FeedContent;
  index: number;
}

export function FeedElement({ item, index }: FeedElementProps) {
  return (
    <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-start space-x-3">
            {item.pathToImage && (
              <div className="flex-shrink-0">
                <img
                  src={item.pathToImage}
                  alt={item.title || 'Feed content image'}
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
                {item.title || 'Untitled'}
              </h3>
              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mb-2">
                <span>By {item.author}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-3 flex-shrink-0">
          {item.pathToAudio && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(item.pathToAudio, '_blank')}
              className="p-2"
              title="Open audio file"
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          )}
          {item.originalContentUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => browser.tabs.create({ url: item.originalContentUrl })}
              className="p-2"
              title="Open original content"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
