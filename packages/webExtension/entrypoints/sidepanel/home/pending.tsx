// component to display the confirmation of a submission

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";

export interface PendingSubmission {
	submissionId: string;
	title: string;
	url: string;
	date: string;
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
	const { submissionId, title, url, date } = submission;

	const handleClickUrl = (e: React.MouseEvent<HTMLAnchorElement>) => {
		if (onLoadUrl) {
			e.preventDefault();
			onLoadUrl(submissionId, url);
		}
		// else, default anchor behavior
	};

	return (
		<div className="bg-white dark:bg-gray-900 rounded-lg border p-2 max-w-md mx-auto flex flex-col gap-4 shadow">
			<div className="flex items-center justify-between gap-4">
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
						className="px-4"
						onClick={() => onApprove(submissionId)}
						disabled={isLoading}
					>
						Approve
					</Button>
					<Button
						size="sm"
						variant="destructive"
						className="px-4"
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
