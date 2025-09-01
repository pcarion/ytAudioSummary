// getUser
// ----
// get user
// GET:me

export interface HttpApiGetMeResponse {
  isAuthenticated: boolean;
  user: {
    userId: string;
    email: string;
    name: string;
    rssUrlPath: string;
    isAdmin: boolean;
    isPaused: boolean;
    isDisabled: boolean;
  };
  lastSubmissions: {
    submissionId: string;
    submissionType: string;
    date: string;
    approvalStatus: 'notConfirmed' | 'confirmed' | 'rejected';
    submissionStatus: 'pending' | 'processing' | 'completed' | 'failed';
    url: string;
    title: string;
    creditsCost: number;
  }[];
  feedContents: {
    contentId: string;
    title: string;
    author: string;
    pathToAudio: string;
    pathToImage: string;
    originalContentUrl: string;
  }[];
  credits: {
    availableCredits: number;
    lastUpdate: string;
  };
  messages: {
    message: string;
    type: string;
    createdAt: string;
  }[];
}
