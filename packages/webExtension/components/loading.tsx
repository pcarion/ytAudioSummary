import { Loader2 } from "lucide-react";

interface LoadingProps {
  isVisible: boolean;
  message?: string;
}

export function Loading({
  isVisible,
  message = "Processing...",
}: LoadingProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          {message}
        </p>
      </div>
    </div>
  );
}
