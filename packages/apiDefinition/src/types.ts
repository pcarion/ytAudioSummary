import { z } from "zod";

// Response schemas
export const submitContentResponse = z.object({
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

export const execSubmissionResponse = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const cancelSubmissionResponse = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const getMeResponse = z.object({
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

// Export types
export type SubmitContentResponse = z.infer<typeof submitContentResponse>;
export type ExecSubmissionResponse = z.infer<typeof execSubmissionResponse>;
export type CancelSubmissionResponse = z.infer<typeof cancelSubmissionResponse>;
export type GetMeResponse = z.infer<typeof getMeResponse>;
