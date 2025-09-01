import { CreditCard } from 'lucide-react';

interface CreditsPanelProps {
  availableCredits: number;
  lastUpdate?: string;
  onNavigateToCredits: () => void;
}

export function CreditsPanel({ availableCredits, lastUpdate, onNavigateToCredits }: CreditsPanelProps) {
  return (
    <div
      className="flex-1 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 rounded-lg mb-4 border border-blue-200 dark:border-blue-800 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] hover:border-blue-300 dark:hover:border-blue-700"
      onClick={onNavigateToCredits}
    >
      <div className="flex items-center justify-between">
        <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <div className="flex-1 text-center">
          <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Credits
          </div>
          <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
            {availableCredits}
          </div>
        </div>
      </div>
    </div>
  );
}
