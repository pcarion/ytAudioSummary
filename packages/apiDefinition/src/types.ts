import type { z } from "zod";

// Import schemas from router.ts
import type {
	submitContentResponse,
	execSubmissionResponse,
	cancelSubmissionResponse,
	getMeResponse,
} from "./router";

// Export types inferred from schemas
export type SubmitContentResponse = z.infer<typeof submitContentResponse>;
export type ExecSubmissionResponse = z.infer<typeof execSubmissionResponse>;
export type CancelSubmissionResponse = z.infer<typeof cancelSubmissionResponse>;
export type GetMeResponse = z.infer<typeof getMeResponse>;
