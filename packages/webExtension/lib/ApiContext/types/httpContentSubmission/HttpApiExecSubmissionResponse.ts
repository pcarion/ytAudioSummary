// execSubmission
// ----
// execute a submission
// POST:exec

export interface HttpApiExecSubmissionResponse {
  success: boolean;
  submissionId: string;
  submissionType: string;
  message: string;
  newAvailableCredits: number;
}
