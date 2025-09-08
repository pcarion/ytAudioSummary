import { useState, useEffect, useCallback } from "react";
import { Clock, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Header } from "./header";
import { Loading } from "@/components/loading";
import { FeedPanel } from "./feedPanel";
import { messaging } from "@/lib/messaging";
import type { GetPageContent } from "@/lib/types/messages";
import { getBrowserInfo } from "@/lib/browserInfo";
import { pageContentToApiSubmission } from "@/lib/youtube/pageContentToApiSubmission";
import { useApi, type GetMeOutput } from "@/lib/ApiContext";
import { PendingSubmission } from "./pending";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { extractDomainFromUrl } from "./utils";

interface HomeProps {
  onNavigateToFeed: () => void;
  onNavigateToSettings: () => void;
}

export function Home({ onNavigateToFeed, onNavigateToSettings }: HomeProps) {
  const { submitContent, approveSubmission, cancelSubmission, getMe } =
    useApi();
  const [pendingSubmissions, setPendingSubmissions] = useState<
    PendingSubmission[]
  >([]);

  const [pageContent, setPageContent] = useState<GetPageContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<GetMeOutput | null>(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const [isApiLoading, setIsApiLoading] = useState(false);

  useEffect(() => {
    // Load user data when component mounts
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsApiLoading(true);
      setIsLoadingUserData(true);
      const data = await getMe();
      setUserData(data);

      console.log("@@ data.lastSubmissions", data.lastSubmissions);

      // we remove the completed submissions
      // and we map the submissions to the PendingSubmission type
      const newPendingSubmissions = data.lastSubmissions
        .filter((s) => {
          return s.submissionStatus !== "completed";
        })
        .map((s) => {
          return {
            submissionId: s.submissionId,
            title: s.title,
            url: s.url,
            date: s.date,
            thumbnailUrl: s.thumbnailUrl,
            isPending: s.submissionStatus === "pending",
            isProcessing: s.submissionStatus === "processing",
            isError: s.submissionStatus === "failed",
          };
        });

      console.log("@@ newPendingSubmissions", newPendingSubmissions);
      setPendingSubmissions(newPendingSubmissions);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setIsLoadingUserData(false);
      setIsApiLoading(false);
    }
  };

  const addPendingSubmission = useCallback(
    (submission: PendingSubmission) => {
      // make sure we don't have the same submission already
      if (
        pendingSubmissions.some(
          (s) => s.submissionId === submission.submissionId
        )
      ) {
        return;
      }
      setPendingSubmissions([...pendingSubmissions, submission]);
    },
    [pendingSubmissions]
  );

  const getPageContent = async () => {
    const requestId = Math.random().toString(36).substring(7);
    console.log(
      `[${requestId}] Getting page content at:`,
      new Date().toISOString()
    );
    setIsLoading(true);
    setIsApiLoading(true);
    try {
      // we search for the tab that is currently active
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tabs[0]?.id) {
        // we reload it first (that will handle SPA pages that are not fully reloaded by the browser)
        await browser.tabs.reload(tabs[0].id);
        // we wait for 3 second to ensure the page is fully loaded
        await new Promise((resolve) => setTimeout(resolve, 3000));
        // then we send the message to the tab
        console.log(`[${requestId}] Sending message to tab:`, tabs[0].id);
        const response = await messaging.getPageContent(tabs[0].id);

        if (response.success) {
          console.log(
            `[${requestId}] Setting page content - date is: ${response.date}`
          );
          console.log("Page content:");
          console.log(response.content);

          const browserInfo = await getBrowserInfo();
          const submissionBody = pageContentToApiSubmission(response.content, {
            browserInfo,
          });
          console.log("Submission body:");
          console.log(submissionBody);
          const result = await submitContent(submissionBody);
          if (result.success) {
            addPendingSubmission({
              submissionId: result.submissionId,
              title: result.submissionTitle,
              url: extractDomainFromUrl(result.submissionUrl),
              date: "",
              thumbnailUrl: result.thumbnailUrl,
              isPending: true,
              isProcessing: false,
              isError: false,
            });
          }
          console.log("Result:");
          console.log(result);
          setPageContent(response.content);

          // Refresh user data after successful submission
          await loadUserData();
        } else {
          console.error("Failed to get page content:", response.error);
          alert(`Failed to retrieve page content: ${response.error}`);
        }
      }
    } catch (error) {
      console.error("Error getting page content:", error);
      alert(
        "Error retrieving page content. Please refresh the page and try again."
      );
    } finally {
      setIsLoading(false);
      setIsApiLoading(false);
    }
  };

  const handleApproveSubmission = async (submissionId: string) => {
    try {
      setIsApiLoading(true);
      console.log("Approving submission:", submissionId);
      const result = await approveSubmission({ submissionId });
      console.log("Approval result:", result);

      if (result.success) {
        // Refresh user data to update the UI
        await loadUserData();
      } else {
        console.error("Failed to approve submission:", result.message);
        alert(`Failed to approve submission: ${result.message}`);
      }
    } catch (error) {
      console.error("Error approving submission:", error);
      alert("Error approving submission. Please try again.");
    } finally {
      setIsApiLoading(false);
    }
  };

  const handleRejectSubmission = async (submissionId: string) => {
    try {
      setIsApiLoading(true);
      console.log("Rejecting submission:", submissionId);
      const result = await cancelSubmission({ submissionId });
      console.log("Rejection result:", result);

      if (result.success) {
        // Refresh user data to update the UI
        await loadUserData();
      } else {
        console.error("Failed to reject submission");
        alert("Failed to reject submission");
      }
    } catch (error) {
      console.error("Error rejecting submission:", error);
      alert("Error rejecting submission. Please try again.");
    } finally {
      setIsApiLoading(false);
    }
  };

  const handleLoadUrl = (_: unknown, url: string) => {
    browser.tabs.create({ url });
  };

  const onNavigateToCredits = () => {
    onNavigateToSettings();
  };

  return (
    <ErrorBoundary>
      <div className="h-screen w-full bg-white dark:bg-gray-900 p-4 flex flex-col relative">
        {/* Loading Overlay */}
        <Loading isVisible={isApiLoading} />

        <Header
          onSettingsClick={onNavigateToSettings}
          isApiLoading={isApiLoading || isLoadingUserData}
        />

        {/* Credits and Feed Panels */}
        {userData && (
          <div className="flex gap-3 mb-4">
            <FeedPanel
              onNavigateToFeed={onNavigateToFeed}
              feedCount={userData.feedContents.length}
            />
          </div>
        )}

        {pendingSubmissions.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border">
            <div className="flex items-center space-x-2 mb-3">
              <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                Pending Submissions
              </h3>
            </div>
            {pendingSubmissions.map((submission) => (
              <PendingSubmission
                key={submission.submissionId}
                submission={submission}
                onApprove={handleApproveSubmission}
                onReject={handleRejectSubmission}
                onLoadUrl={handleLoadUrl}
              />
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-md mx-auto text-center">
            <div className="p-4 mb-2 space-y-3">
              <div className="flex justify-center">
                <Button
                  onClick={getPageContent}
                  disabled={isLoading || isApiLoading}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-10 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg"
                >
                  {isLoading ? "Processing..." : "Analyze Video"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Refresh Button - Bottom Center */}
        <div className="flex justify-center pb-4">
          <Button
            onClick={loadUserData}
            disabled={isApiLoading}
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isApiLoading ? "animate-spin" : ""}`}
            />
            Refresh Data
          </Button>
        </div>
      </div>
    </ErrorBoundary>
  );
}
