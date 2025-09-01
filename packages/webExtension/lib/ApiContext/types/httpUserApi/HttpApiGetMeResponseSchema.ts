import { z } from 'zod';


// getUser
// ----
// get user
// GET:me

export const HttpApiGetMeResponseSchema = z.object({
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
  lastSubmissions: z.array(z.object({
  submissionId: z.string(),
  submissionType: z.string(),
  date: z.string(),
  approvalStatus: z.enum(['notConfirmed', 'confirmed', 'rejected']),
  submissionStatus: z.enum(['pending', 'processing', 'completed', 'failed']),
  url: z.string(),
  title: z.string(),
  creditsCost: z.number(),
  })),
  feedContents: z.array(z.object({
  contentId: z.string(),
  title: z.string(),
  author: z.string(),
  pathToAudio: z.string(),
  pathToImage: z.string(),
  originalContentUrl: z.string(),
  })),
  credits: z.object({
  availableCredits: z.number(),
  lastUpdate: z.string(),
  }),
  messages: z.array(z.object({
  message: z.string(),
  type: z.string(),
  createdAt: z.string(),
  })),
}).strict();

