import { z } from 'zod';


// cancelSubmission
// ----
// cancel a submission
// POST:cancel

export const HttpApiCancelSubmissionResponseSchema = z.object({
  success: z.boolean(),
  submissionId: z.string(),
}).strict();

