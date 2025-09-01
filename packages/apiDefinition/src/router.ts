// Main tRPC Router

import { initTRPC } from "@trpc/server";
import { z } from "zod";

// Initialize tRPC
const t = initTRPC.create();

// Export router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;

// Input schemas
const submitContentInput = z.object({
  url: z.string().url(),
  title: z.string(),
  domain: z.string(),
  pathName: z.string(),
  youtubeVideo: z
    .object({
      videoId: z.string(),
      title: z.string(),
      author: z.string(),
      shortDescription: z.string(),
      captions: z.string(),
      isLiveContent: z.boolean(),
      lengthSeconds: z.string(),
      channelId: z.string(),
      thumbnails: z.array(
        z.object({
          url: z.string(),
          width: z.number(),
          height: z.number(),
        })
      ),
    })
    .optional(),
  metadata: z.array(
    z.object({
      name: z.string(),
      value: z.string(),
    })
  ),
  sender: z.object({
    appName: z.string(),
    appVersion: z.string(),
    timestamp: z.string(),
    osName: z.string(),
    userAgent: z.string(),
  }),
});

const execSubmissionInput = z.object({
  submissionId: z.string(),
});

const cancelSubmissionInput = z.object({
  submissionId: z.string(),
});

// Response schemas
const submitContentResponse = z.object({
  success: z.boolean(),
  submissionId: z.string(),
  submissionType: z.string(),
  submissionUrl: z.string(),
  submissionTitle: z.string(),
  message: z.string(),
  credits: z.object({
    current: z.number(),
    creditsCost: z.number(),
  }),
});

const execSubmissionResponse = z.object({
  success: z.boolean(),
  message: z.string(),
});

const cancelSubmissionResponse = z.object({
  success: z.boolean(),
  message: z.string(),
});

const getMeResponse = z.object({
  isAuthenticated: z.boolean(),
  user: z.object({
    userId: z.string(),
    email: z.string(),
    name: z.string(),
    rssUrlPath: z.string(),
    isAdmin: z.boolean(),
    isPaused: z.boolean(),
    isDisabled: z.boolean(),
  }),
  lastSubmissions: z.array(
    z.object({
      submissionId: z.string(),
      submissionType: z.string(),
      date: z.string(),
      approvalStatus: z.enum(["notConfirmed", "confirmed", "rejected"]),
      submissionStatus: z.enum([
        "pending",
        "processing",
        "completed",
        "failed",
      ]),
      url: z.string(),
      title: z.string(),
      creditsCost: z.number(),
    })
  ),
  feedContents: z.array(
    z.object({
      contentId: z.string(),
      title: z.string(),
      author: z.string(),
      pathToAudio: z.string(),
      pathToImage: z.string(),
      originalContentUrl: z.string(),
    })
  ),
  credits: z.object({
    availableCredits: z.number(),
    lastUpdate: z.string(),
  }),
  messages: z.array(
    z.object({
      message: z.string(),
      type: z.string(),
      createdAt: z.string(),
    })
  ),
});

// Main router
export const appRouter = router({
  // Content submission
  submitContent: publicProcedure
    .input(submitContentInput)
    .output(submitContentResponse)
    .mutation(async ({ input }) => {
      // This will be implemented in the cfBackend
      console.log("submitContent called with:", input);
      throw new Error("Not implemented");
    }),

  // Approve/execute submission
  approveSubmission: publicProcedure
    .input(execSubmissionInput)
    .output(execSubmissionResponse)
    .mutation(async ({ input }) => {
      // This will be implemented in the cfBackend
      console.log("approveSubmission called with:", input);
      throw new Error("Not implemented");
    }),

  // Cancel submission
  cancelSubmission: publicProcedure
    .input(cancelSubmissionInput)
    .output(cancelSubmissionResponse)
    .mutation(async ({ input }) => {
      // This will be implemented in the cfBackend
      console.log("cancelSubmission called with:", input);
      throw new Error("Not implemented");
    }),

  // Get user info
  getMe: publicProcedure.output(getMeResponse).query(async () => {
    // This will be implemented in the cfBackend
    throw new Error("Not implemented");
  }),
});

// Export type for client usage
export type AppRouter = typeof appRouter;
