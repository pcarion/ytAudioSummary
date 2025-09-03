import { GetPageContent } from "@/lib/types/messages";
import { BrowserInfo } from "../browserInfo";
import { SubmitContentInput } from "../ApiContext";

export interface PageContentArgs {
  browserInfo: BrowserInfo;
}

export function pageContentToApiSubmission(
  pageContent: GetPageContent,
  args: PageContentArgs
): SubmitContentInput {
  console.log("pageContentToApiSubmission");
  console.log(pageContent);
  return {
    url: pageContent.pageInformation.url,
    title: pageContent.pageInformation.title,
    domain: pageContent.pageInformation.domain,
    pathName: pageContent.pageInformation.pathname,
    youtubeVideo: {
      videoId: pageContent.youtubeDetails.videoId,
      title: pageContent.youtubeDetails.title,
      author: pageContent.youtubeDetails.author,
      shortDescription: pageContent.youtubeDetails.shortDescription,
      captions: pageContent.transcriptInformation.transcript,
      isLiveContent: pageContent.youtubeDetails.isLiveContent,
      lengthSeconds: pageContent.youtubeDetails.lengthSeconds,
      channelId: pageContent.youtubeDetails.channelId,
      thumbnails: pageContent.youtubeDetails.thumbnails,
    },
    metadata: pageContent.metadata,
    sender: {
      appName: args.browserInfo.extensionName,
      appVersion: args.browserInfo.extensionVersion,
      timestamp: pageContent.pageInformation.timestamp,
      osName: args.browserInfo.osName,
      userAgent: args.browserInfo.userAgent,
    },
  };
}
