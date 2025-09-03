// component to display the confirmation of a submission

import { Button } from "@/components/ui/button";
import React from "react";

export interface PendingSubmission {
  submissionId: string;
  title: string;
  url: string;
  date: string;
  thumbnailUrl: string;
}

export interface PendingSubmissionProps {
  submission: PendingSubmission;
  onApprove: (submissionId: string) => void;
  onReject: (submissionId: string) => void;
  onLoadUrl: (submissionId: string, url: string) => void;
  isLoading?: boolean;
}

export function PendingSubmission({
  submission,
  onApprove,
  onReject,
  onLoadUrl,
  isLoading = false,
}: PendingSubmissionProps) {
  const { submissionId, title, url, thumbnailUrl } = submission;

  const handleClickUrl = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onLoadUrl) {
      e.preventDefault();
      onLoadUrl(submissionId, url);
    }
    // else, default anchor behavior
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border p-2 max-w-md mx-auto flex flex-col gap-4 shadow">
      <div className="flex items-start gap-4">
        {/* Thumbnail Image */}
        <div className="flex-shrink-0">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-16 h-12 object-cover rounded border"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                target.nextElementSibling?.classList.remove("hidden");
              }}
            />
          ) : null}
          {/* Placeholder when no thumbnail or image fails to load */}
          <div
            className={`w-16 h-12 bg-gray-200 dark:bg-gray-700 rounded border flex items-center justify-center ${
              thumbnailUrl ? "hidden" : ""
            }`}
          >
            <svg
              className="w-6 h-6 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col items-start">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-xs text-blue-700 dark:text-blue-300 hover:underline break-all cursor-pointer"
              title={url}
              onClick={handleClickUrl}
            >
              {title}
            </a>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-600 dark:text-gray-400 hover:underline break-all cursor-pointer"
              title={url}
              onClick={handleClickUrl}
            >
              {url}
            </a>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="default"
            className="px-4 bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600 dark:text-white"
            onClick={() => onApprove(submissionId)}
            disabled={isLoading}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="px-4 bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600 dark:text-white"
            onClick={() => onReject(submissionId)}
            disabled={isLoading}
          >
            Reject
          </Button>
        </div>
      </div>
    </div>
  );
}
