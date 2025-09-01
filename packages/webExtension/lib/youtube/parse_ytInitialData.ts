interface YtInitialDataInformation {
  hasTranscript: boolean;
  language: string;
  transcript: string;
}

// this code is coming from extension: "Copy Youtube Transcript"
// https://chromewebstore.google.com/detail/copy-youtube-transcript/mpfdnefhgmjlbkphfpkiicdaegfanbab?hl=en&authuser=0
//
// Announcement:
// https://www.reddit.com/r/youtube/comments/1jm9jbm/i_built_a_chrome_extension_to_copy_full_youtube/
//
// on disk at:
// $HOME/Library/Application Support/Google/Chrome/Default/Extensions/mpfdnefhgmjlbkphfpkiicdaegfanbab/1.2.0_0
//
export async function parse_ytInitialData(ytInitialData: any): Promise<YtInitialDataInformation> {
  const response: YtInitialDataInformation = {
    hasTranscript: false,
    language: '',
    transcript: '',
  };
  if (!ytInitialData) {
    return response;
  }
  // search for the transcript panel
  const continuationParams = ytInitialData.engagementPanels?.find((p: any) =>
    p.engagementPanelSectionListRenderer?.content?.continuationItemRenderer?.continuationEndpoint?.getTranscriptEndpoint
  )?.engagementPanelSectionListRenderer?.content?.continuationItemRenderer?.continuationEndpoint?.getTranscriptEndpoint?.params;

  if (!continuationParams) {
    return response;
  }

  const hl = ytInitialData.topbar?.desktopTopbarRenderer?.searchbox?.fusionSearchboxRenderer?.config?.webSearchboxConfig?.requestLanguage || "en";
  const clientData = ytInitialData.responseContext?.serviceTrackingParams?.[0]?.params;
  const visitorData = ytInitialData.responseContext?.webResponseContextExtensionData?.ytConfigData?.visitorData;

  const body = {
    context: {
      client: {
        hl,
        visitorData,
        clientName: clientData?.[0]?.value,
        clientVersion: clientData?.[1]?.value
      },
      request: { useSsl: true }
    },
    params: continuationParams
  };


  // let's get the transcript
  console.log('body:');
  console.log(body);

  const res = await fetch("https://www.youtube.com/youtubei/v1/get_transcript?prettyPrint=false", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const json = await res.json();
  console.log('json from get_transcript:');
  console.log(json);

  const segments = json.actions?.[0]?.updateEngagementPanelAction?.content?.transcriptRenderer?.content?.transcriptSearchPanelRenderer?.body?.transcriptSegmentListRenderer?.initialSegments || [];

  console.log('segments:');
  console.log(segments);

  // TODO: format may be different for shorts
  if (!segments.length) {
    response.hasTranscript = false;
  } else {
    const lines: string[] = [];
    for (const segment of segments) {
      if (segment.transcriptSegmentRenderer) {
        const text = segment.transcriptSegmentRenderer.snippet?.runs?.map((r: any) => r.text).join(" ") || "";
        lines.push(text);
      }
    }
    response.transcript = lines.join(' ');
    response.language = hl;
    response.hasTranscript = true;
  }
  return  response;
}

// segments:
/*

[
    {
        "transcriptSegmentRenderer": {
            "startMs": "80",
            "endMs": "6720",
            "snippet": {
                "runs": [
                    {
                        "text": "i have never watched this presentation and everybody has said this is the greatest presentation of all time simple"
                    }
                ]
            },
            "startTimeText": {
                "simpleText": "0:00"
            },
            "trackingParams": "COYIENP2BxgAIhMI0KqmnbXljQMVWwRPCB0ZXzGt",
            "accessibility": {
                "accessibilityData": {
                    "label": "0 seconds i have never watched this presentation and everybody has said this is the greatest presentation of all time simple"
                }
            },
            "targetId": "8eXiWkPSb50.CgNhc3ISAmVuGgA%3D.80.6720"
        }
    },
    {
        "transcriptSegmentRenderer": {
            "startMs": "6720",
            "endMs": "11920",
            "snippet": {
                "runs": [
                    {
                        "text": "made e rich hickey 2011 i kind of feel like I've missed out on some lore here"
                    }
                ]
            },
            "startTimeText": {
                "simpleText": "0:06"
            },
            "trackingParams": "COUIENP2BxgBIhMI0KqmnbXljQMVWwRPCB0ZXzGt",
            "accessibility": {
                "accessibilityData": {
                    "label": "6 seconds made e rich hickey 2011 i kind of feel like I've missed out on some lore here"
                }
            },
            "targetId": "8eXiWkPSb50.CgNhc3ISAmVuGgA%3D.6720.11920"
        }
    },

]

*/


