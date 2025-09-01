// submitContent
// ----
// submit content
// POST:submit

export interface HttpApiSubmitContentResponse {
  success: boolean;
  submissionId: string;
  submissionType: string;
  submissionUrl: string;
  submissionTitle: string;
  message: string;
  credits: {
    current: number;
    creditsCost: number;
  };
}
