import { useState, useEffect } from "react";
import { ArrowLeft, Rss } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Loading } from "@/components/loading";
import { FeedElement } from "./feedElement";
import { useApi, type GetMeOutput } from "@/lib/ApiContext";

interface FeedPageProps {
  onBack: () => void;
}

export function FeedPage({ onBack }: FeedPageProps) {
  const { getMe } = useApi();

  const [userData, setUserData] = useState<GetMeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const data = await getMe();
      setUserData(data);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-white dark:bg-gray-900 p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Button variant="outline" size="sm" onClick={onBack} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center space-x-2">
          <Rss className="h-5 w-5 text-green-600 dark:text-green-400" />
          <h1 className="text-xl font-bold text-black dark:text-white">
            Feed Elements
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <Loading isVisible={true} message="Loading feed..." />
        ) : userData && userData.feedContents.length > 0 ? (
          <div className="space-y-3">
            {userData.feedContents.map((item, index) => (
              <FeedElement key={item.contentId} item={item} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Rss className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No feed elements yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your feed will appear here once you start analyzing pages.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
