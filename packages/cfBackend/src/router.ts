import { initTRPC } from "@trpc/server";
import {
	submitContentInput,
	execSubmissionInput,
	cancelSubmissionInput,
	submitContentResponse,
	execSubmissionResponse,
	cancelSubmissionResponse,
	getMeResponse,
} from "@yt-audio-summary/api-definition";

// Initialize tRPC
const t = initTRPC.create();
const router = t.router;
const publicProcedure = t.procedure;

// Create the actual router implementation
export const appRouter = router({
	// Content submission
	submitContent: publicProcedure
		.input(submitContentInput)
		.output(submitContentResponse)
		.mutation(async ({ input }) => {
			console.log("submitContent called with:", input);

			// Generate a unique submission ID
			const submissionId = `sub_${Date.now()}_${Math.random()
				.toString(36)
				.substring(2, 15)}`;

			// Determine submission type based on content
			const submissionType = input.youtubeVideo ? "youtube_video" : "web_page";

			// Calculate credits cost (mock implementation)
			const creditsCost = input.youtubeVideo ? 5 : 2;

			// Mock response
			return {
				success: true,
				submissionId,
				submissionType,
				submissionUrl: input.url,
				submissionTitle: input.title,
				message: "Content submitted successfully",
				credits: {
					current: 100 - creditsCost, // Mock current credits
					creditsCost,
				},
			};
		}),

	// Approve/execute submission
	approveSubmission: publicProcedure
		.input(execSubmissionInput)
		.output(execSubmissionResponse)
		.mutation(async ({ input }) => {
			console.log("approveSubmission called with:", input);

			// Mock approval logic
			// In a real implementation, this would:
			// 1. Validate the submission exists
			// 2. Check user permissions
			// 3. Start processing the content
			// 4. Update submission status

			return {
				success: true,
				message: `Submission ${input.submissionId} approved and processing started`,
			};
		}),

	// Cancel submission
	cancelSubmission: publicProcedure
		.input(cancelSubmissionInput)
		.output(cancelSubmissionResponse)
		.mutation(async ({ input }) => {
			console.log("cancelSubmission called with:", input);

			// Mock cancellation logic
			// In a real implementation, this would:
			// 1. Validate the submission exists
			// 2. Check if it can be cancelled
			// 3. Stop processing if in progress
			// 4. Update submission status

			return {
				success: true,
				message: `Submission ${input.submissionId} cancelled successfully`,
			};
		}),

	// Get user info
	getMe: publicProcedure.output(getMeResponse).query(async () => {
		console.log("getMe called");

		// Mock user data

		return {
			information: {
				rssUrlPath: "/rss/user_123",
			},
			lastSubmissions: [
				{
					submissionId: "sub_123",
					date: new Date().toISOString(),
					approvalStatus: "notConfirmed" as const,
					submissionStatus: "pending" as const,
					url: "https://youtube.com/watch?v=example",
					title: "Example YouTube Video",
					creditsCost: 5,
				},
			],
			feedContents: [
				{
					contentId: "content_456",
					title: "Processed Audio Summary",
					author: "YouTube Channel",
					pathToAudio: "/audio/content_456.mp3",
					pathToImage: "/images/content_456.jpg",
					originalContentUrl: "https://youtube.com/watch?v=example",
				},
			],
			messages: [
				{
					message: "Welcome to YouTube Audio Summary!",
					type: "info",
					createdAt: new Date().toISOString(),
				},
			],
		};
	}),
});

// Export the router type for client usage
export type AppRouter = typeof appRouter;
