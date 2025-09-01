// Type-only exports for client usage
// This file contains no runtime code, only types

import type { z } from "zod";
import type {
	submitContentInput,
	execSubmissionInput,
	cancelSubmissionInput,
	submitContentResponse,
	execSubmissionResponse,
	cancelSubmissionResponse,
	getMeResponse,
} from "./router";

// Define the API router type structure for clients
export type AppRouter = {
	submitContent: {
		input: z.infer<typeof submitContentInput>;
		output: z.infer<typeof submitContentResponse>;
	};
	approveSubmission: {
		input: z.infer<typeof execSubmissionInput>;
		output: z.infer<typeof execSubmissionResponse>;
	};
	cancelSubmission: {
		input: z.infer<typeof cancelSubmissionInput>;
		output: z.infer<typeof cancelSubmissionResponse>;
	};
	getMe: {
		input: undefined;
		output: z.infer<typeof getMeResponse>;
	};
};

// Export individual types for convenience
export type SubmitContentInput = z.infer<typeof submitContentInput>;
export type SubmitContentOutput = z.infer<typeof submitContentResponse>;
export type ExecSubmissionInput = z.infer<typeof execSubmissionInput>;
export type ExecSubmissionOutput = z.infer<typeof execSubmissionResponse>;
export type CancelSubmissionInput = z.infer<typeof cancelSubmissionInput>;
export type CancelSubmissionOutput = z.infer<typeof cancelSubmissionResponse>;
export type GetMeOutput = z.infer<typeof getMeResponse>;
