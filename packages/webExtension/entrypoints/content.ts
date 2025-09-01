/// <reference path="../.wxt/types/imports.d.ts" />

import { extractMetaTags } from '../lib/extractMetaTags';
import { parse_ytInitialPlayerResponse } from '../lib/youtube/parse_ytInitialPlayerResponse';
import { onMessage } from '../lib/messaging';
import type { GetPageContent, GetPageContentResponse, GetPageYoutubeVideoDetails, GetPageContentTranscriptInformation, GetPageContentDetails } from '../lib/types/messages';
import type { ContentScriptContext } from 'wxt/utils/content-script-context';
import { extractJsonFromHtml } from '../lib/youtube/extractJsonFromHtml';
import { parse_ytInitialData } from '../lib/youtube/parse_ytInitialData';

function isYoutubeVideoPage() {
  return window.location.hostname.includes('youtube.com') && window.location.pathname.includes('/watch');
}

export default defineContentScript({
  matches: ['<all_urls>'],
  async main(ctx: ContentScriptContext) {
    console.log('Snipwave content script loaded:', ctx.options?.matches);

    // Type-safe message listeners
    onMessage('GET_PAGE_CONTENT', async (): Promise<GetPageContentResponse> => {
      try {
        // Always get fresh content when requested
        const content = await getPageContent(isYoutubeVideoPage());
        const strDate = new Date().toISOString();
        console.log('@@ getPageContent returning strDate:', strDate);
        return { success: true, date: strDate, content };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    async function getPageContent(isYoutubeVideoPage: boolean): Promise<GetPageContent> {
      try {
        console.log('getPageContent called at:', new Date().toISOString());
        console.log('isYoutubeVideoPage:', isYoutubeVideoPage);

        // Force a small delay to ensure DOM is stable
        await new Promise(resolve => setTimeout(resolve, 100));

        // Get the full HTML document (fresh read)
        // const htmlContent = document.documentElement.outerHTML;
        const pageContentDetails: GetPageContentDetails = {
          author: '',
          title: '',
          description: '',
          markdown: '',
        };

        const youtubeDetails: GetPageYoutubeVideoDetails = {
          videoId: '',
          title: '',
          author: '',
          shortDescription: '',
          isLiveContent: false,
          lengthSeconds: '',
          channelId: '',
          thumbnails: [],
        };

        const transcriptInformation: GetPageContentTranscriptInformation = {
          language: '',
          transcript: ''
        }
        let hasTranscript = false;

        if (isYoutubeVideoPage) {
          // for a video page, we need to extract the data about the captions
          // Get all script tags content (fresh read)
          const scriptTags = Array.from(document.querySelectorAll('script'));
          console.log('scriptTags: #', scriptTags.length);

          // we will extract the following variables from the script tags:
          const scriptVariables: {
            ytInitialPlayerResponse: unknown | null,
            ytInitialData: unknown | null,
          } = {
            ytInitialPlayerResponse: null,
            ytInitialData: null,
          }
          for (const script of scriptTags) {
            // we break the loop when we have found both variables
            if (scriptVariables.ytInitialPlayerResponse && scriptVariables.ytInitialData) {
              break;
            }
            if (script.innerHTML) {
              if (!scriptVariables.ytInitialPlayerResponse) {
                scriptVariables.ytInitialPlayerResponse = extractJsonFromHtml(script.innerHTML, 'ytInitialPlayerResponse');
              }
              if (!scriptVariables.ytInitialData) {
                scriptVariables.ytInitialData = extractJsonFromHtml(script.innerHTML, 'ytInitialData');
              }
            }
          }

          if (scriptVariables.ytInitialPlayerResponse) {
            console.log('scriptVariables.ytInitialPlayerResponse:');
            console.log(scriptVariables.ytInitialPlayerResponse);

            const youtubeVideoInformation = await parse_ytInitialPlayerResponse(scriptVariables.ytInitialPlayerResponse)
            console.log('youtubeVideoInformation:');
            console.log(youtubeVideoInformation);
            if (youtubeVideoInformation.isValid) {
              // we retrieve the transcript information
              transcriptInformation.language = youtubeVideoInformation.language;
              transcriptInformation.transcript = youtubeVideoInformation.transcript;
              hasTranscript = transcriptInformation.transcript.length > 20;

              if (youtubeVideoInformation.videoDetails) {
                youtubeDetails.videoId = youtubeVideoInformation.videoDetails.videoId;
                youtubeDetails.title = youtubeVideoInformation.videoDetails.title;
                youtubeDetails.author = youtubeVideoInformation.videoDetails.author;
                youtubeDetails.shortDescription = youtubeVideoInformation.videoDetails.shortDescription;
                youtubeDetails.isLiveContent = youtubeVideoInformation.videoDetails.isLiveContent;
                youtubeDetails.lengthSeconds = youtubeVideoInformation.videoDetails.lengthSeconds;
                youtubeDetails.channelId = youtubeVideoInformation.videoDetails.channelId;
                youtubeDetails.thumbnails = youtubeVideoInformation.videoDetails.thumbnail.thumbnails;
              }
            }
          }

          // we try to get the transcript from the ytInitialData if we don't have it
          if (scriptVariables.ytInitialData && !hasTranscript) {
            console.log('scriptVariables.ytInitialData:');
            console.log(scriptVariables.ytInitialData);
            const ytInitialDataInformation = await parse_ytInitialData(scriptVariables.ytInitialData)
            console.log('ytInitialDataInformation:');
            console.log(ytInitialDataInformation);
            // retrieve the transcript request url and body
            if (ytInitialDataInformation.hasTranscript) {
              transcriptInformation.language = ytInitialDataInformation.language;
              transcriptInformation.transcript = ytInitialDataInformation.transcript;
              hasTranscript = transcriptInformation.transcript.length > 20;
            }
          }
        } else {
          // for a non-youtube video page, there is no transcript
          hasTranscript = false;
        }

        // Get page metadata
        const title = document.title;
        const url = window.location.href;
        const pageInformation = {
          title,
          url,
          domain: window.location.hostname,
          pathname: window.location.pathname,
          timestamp: new Date().toISOString()
        };

        // Get visible text content (cleaned)
        // const textContent = document.body.innerText;

        // let's get the header content
        const headerContent = document.head;
        const metaTags = extractMetaTags(headerContent);
        console.log('Meta tags:');
        console.log(metaTags);
        const metadataarray = metaTags.filter(tag => {
          if (!tag.name || !tag.content) {
            return false;
          }
          if (tag.name.startsWith('og:') || tag.name.startsWith('twitter:') || tag.name.startsWith('al:')) {
            return true;
          }
          if (["description", "title", "author", "keywords", "generator"].includes(tag.name)) {
            return true;
          }
          return false;
        }).map(tag => ({
          name: tag.name,
          value: tag.content
        }));

        const pageContent: GetPageContent = {
          pageInformation,
          pageContentDetails,
          youtubeDetails: youtubeDetails,
          transcriptInformation,
          metadata: metadataarray as { name: string; value: string }[],
        }

        console.log('pageContent returned from getPageContent:');
        console.log(pageContent);

        return pageContent;

      } catch (error) {
        console.error('Error extracting page content:', error);
        throw error;
      }
    }
  },
});
