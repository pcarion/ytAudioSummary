import { v7 as uuidv7 } from "uuid";
import { initTRPC } from "@trpc/server";
import {
  submitContentInput,
  execSubmissionInput,
  cancelSubmissionInput,
  submitContentResponse,
  execSubmissionResponse,
  cancelSubmissionResponse,
  getMeResponse,
} from "./types";
import { storeSubmissionMetadata } from "./r2-utils";
import { DatabaseService } from "../db/queries";

// Define the context type
export interface Context {
  env: Env;
}

// Initialize tRPC with context
const t = initTRPC.context<Context>().create();
const router = t.router;
const publicProcedure = t.procedure;

// Create the actual router implementation
export const appRouter = router({
  // Content submission
  submitContent: publicProcedure
    .input(submitContentInput)
    .output(submitContentResponse)
    .mutation(async ({ input, ctx }) => {
      console.log("submitContent called with:", input);

      // Generate a unique submission ID
      const submissionId = uuidv7();

      // find thumbnail with max width and height
      const thumbnailUrl =
        input.youtubeVideo?.thumbnails?.reduce(
          (max, thumbnail) => (thumbnail.width > max.width ? thumbnail : max),
          input.youtubeVideo.thumbnails[0]
        )?.url || "";

      // Store submission metadata in R2 bucket
      try {
        const r2SubmissionPathName = await storeSubmissionMetadata(
          ctx.env.YT_AUDIO_SUMMARY_BUCKET,
          submissionId,
          input
        );
        console.log(`Stored submission metadata for ${submissionId} in R2`);

        // Initialize database service
        const db = new DatabaseService(ctx.env.YT_AUDIO_SUMMARY_DB);

        // Create submission in database
        const submission = await db.createSubmission({
          id: submissionId,
          url: input.url,
          title: input.title,
          thumbnailUrl: thumbnailUrl,
          r2SubmissionPathName: r2SubmissionPathName,
          sender: input.sender,
          status: "pending",
        });
        console.log(
          `Created submission in database: ${JSON.stringify(submission)}`
        );
      } catch (error) {
        console.error("Failed to process submission:", error);
        return {
          success: false,
          submissionId,
          submissionUrl: input.url,
          submissionTitle: input.title,
          message: `failed: ${error}`,
          thumbnailUrl: thumbnailUrl,
        };
      }

      return {
        success: true,
        submissionId,
        submissionUrl: input.url,
        submissionTitle: input.title,
        message: "Content submitted successfully",
        thumbnailUrl: thumbnailUrl,
      };
    }),

  // Approve/execute submission
  approveSubmission: publicProcedure
    .input(execSubmissionInput)
    .output(execSubmissionResponse)
    .mutation(async ({ input, ctx }) => {
      console.log("approveSubmission called with:", input);

      // Initialize database service
      const db = new DatabaseService(ctx.env.YT_AUDIO_SUMMARY_DB);

      // Get the submission
      const submission = await db.getSubmissionById(input.submissionId);
      if (!submission) {
        throw new Error(`Submission ${input.submissionId} not found`);
      }

      // Mark as processing
      await db.markSubmissionAsProcessing(input.submissionId);

      return {
        success: true,
        message: `Submission ${input.submissionId} approved and processing started`,
      };
    }),

  // Cancel submission
  cancelSubmission: publicProcedure
    .input(cancelSubmissionInput)
    .output(cancelSubmissionResponse)
    .mutation(async ({ input, ctx }) => {
      console.log("cancelSubmission called with:", input);

      // Initialize database service
      const db = new DatabaseService(ctx.env.YT_AUDIO_SUMMARY_DB);

      // Get the submission
      const submission = await db.getSubmissionById(input.submissionId);
      if (!submission) {
        throw new Error(`Submission ${input.submissionId} not found`);
      }

      // Check if submission can be cancelled
      if (submission.status === "completed") {
        throw new Error(
          `Cannot cancel completed submission ${input.submissionId}`
        );
      }

      // Cancel the submission
      await db.cancelSubmission(input.submissionId);

      return {
        success: true,
        message: `Submission ${input.submissionId} cancelled successfully`,
      };
    }),

  // Get user info
  getMe: publicProcedure.output(getMeResponse).query(async ({ ctx }) => {
    console.log("getMe called");

    // Initialize database service
    const db = new DatabaseService(ctx.env.YT_AUDIO_SUMMARY_DB);

    // Get all submissions (since we removed user association)
    const submissions = await db.getAllSubmissions(10);
    const lastSubmissions = submissions.map((sub) => ({
      submissionId: sub.id,
      date: sub.createdAt,
      approvalStatus:
        sub.status === "pending"
          ? ("notConfirmed" as const)
          : ("confirmed" as const),
      submissionStatus:
        sub.status === "cancelled"
          ? ("failed" as const)
          : (sub.status as "pending" | "processing" | "completed" | "failed"),
      url: sub.url,
      title: sub.title,
      thumbnailUrl: sub.thumbnailUrl,
    }));

    // Get all feed contents
    const feedContents = await db.getFeedContents(10);
    const feedContentsFormatted = feedContents.map((content) => ({
      contentId: content.id,
      title: content.title,
      author: "YouTube Channel", // This would come from the submission data
      pathToAudio: content.audioFileUrl || "/audio/default.mp3",
      pathToImage: "/images/default.jpg", // This would be generated from thumbnails
      originalContentUrl: content.url,
    }));

    return {
      information: {
        rssUrlPath: "/rss/global", // Global RSS since no user association
      },
      lastSubmissions,
      feedContents: feedContentsFormatted,
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
