import { z } from 'zod';


// submitContent
// ----
// submit content
// POST:submit

export const HttpApiSubmitContentResponseSchema = z.object({
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
}).strict();

