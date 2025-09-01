import { z } from 'zod';


// execSubmission
// ----
// execute a submission
// POST:exec

export const HttpApiExecSubmissionResponseSchema = z.object({
  success: z.boolean(),
  submissionId: z.string(),
  submissionType: z.string(),
  message: z.string(),
  newAvailableCredits: z.number(),
}).strict();

