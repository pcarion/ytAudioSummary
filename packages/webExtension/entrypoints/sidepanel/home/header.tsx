import { Button } from "@/components/ui/button";
import extensionLogo from "@/assets/logo.svg";

interface HeaderProps {
  userEmail?: string;
  onSettingsClick: () => void;
  isApiLoading: boolean;
}

export function Header({
  userEmail,
  onSettingsClick,
  isApiLoading,
}: HeaderProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onSettingsClick}
        className="p-0 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center h-auto"
        title="Settings"
        disabled={isApiLoading}
      >
        <img
          src={extensionLogo}
          className="h-12 p-0 transition-all hover:drop-shadow-[0_0_2em_#6366f1]"
          alt="Snipwave logo"
        />
      </Button>
      <div className="flex items-baseline justify-between w-full max-w-xs">
        <h1 className="text-xl font-bold text-black dark:text-white pl-2">
          Snipwave
        </h1>
        {userEmail && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {userEmail}
          </div>
        )}
      </div>
    </div>
  );
}
