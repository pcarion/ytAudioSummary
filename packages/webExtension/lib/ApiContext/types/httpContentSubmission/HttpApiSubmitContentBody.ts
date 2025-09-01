// submitContent
// ----
// submit content
// POST:submit

export interface HttpApiSubmitContentBody {
  url: string;
  title: string;
  domain: string;
  pathName: string;
  youtubeVideo?: {
    videoId: string;
    title: string;
    author: string;
    shortDescription: string;
    captions: string;
    isLiveContent: boolean;
    lengthSeconds: string;
    channelId: string;
    thumbnails: {
      url: string;
      width: number;
      height: number;
    }[];
  };
  metadata: {
    name: string;
    value: string;
  }[];
  sender: {
    appName: string;
    appVersion: string;
    timestamp: string;
    osName: string;
    userAgent: string;
  };
}
