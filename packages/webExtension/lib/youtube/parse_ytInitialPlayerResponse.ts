
export type YtCaptionTrack = {
  baseUrl: string;
  languageCode: string;
  name: {
    simpleText: string;
  };
}

export interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

export interface VideoDetails {
  videoId: string;
  title: string;
  lengthSeconds: string;
  channelId: string;
  isOwnerViewing: boolean;
  shortDescription: string;
  isCrawlable: boolean;
  thumbnail: {
    thumbnails: Thumbnail[];
  };
  allowRatings: boolean;
  viewCount: string;
  author: string;
  isPrivate: boolean;
  isUnpluggedCorpus: boolean;
  isLiveContent: boolean;
}

// Type guard to check if an object matches VideoDetails structure
function hasValidVideoDetails(obj: unknown): obj is { videoDetails: VideoDetails } {
  if (typeof obj !== 'object' || obj === null) return false;
  if (!('videoDetails' in obj)) return false;

  const details = (obj as any).videoDetails;
  if (typeof details !== 'object' || details === null) return false;

  // Check required string fields
  const stringFields = ['videoId', 'title', 'lengthSeconds', 'channelId', 'shortDescription', 'viewCount', 'author'];
  for (const field of stringFields) {
    if (typeof details[field] !== 'string') return false;
  }

  // Check required boolean fields
  const booleanFields = ['isOwnerViewing', 'isCrawlable', 'allowRatings', 'isPrivate', 'isUnpluggedCorpus', 'isLiveContent'];
  for (const field of booleanFields) {
    if (typeof details[field] !== 'boolean') return false;
  }

  // Check thumbnail structure
  if (!details.thumbnail || typeof details.thumbnail !== 'object') return false;
  if (!Array.isArray(details.thumbnail.thumbnails)) return false;

  // Check each thumbnail
  for (const thumb of details.thumbnail.thumbnails) {
    if (typeof thumb !== 'object' || thumb === null) return false;
    if (typeof thumb.url !== 'string') return false;
    if (typeof thumb.width !== 'number') return false;
    if (typeof thumb.height !== 'number') return false;
  }

  return true;
}

// Type guard to check if an object matches CaptionTrack structure
function isValidCaptionTrack(obj: unknown): obj is YtCaptionTrack {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'baseUrl' in obj &&
    'languageCode' in obj &&
    'name' in obj &&
    typeof (obj as any).baseUrl === 'string' &&
    typeof (obj as any).languageCode === 'string' &&
    typeof (obj as any).name === 'object' &&
    (obj as any).name !== null &&
    'simpleText' in (obj as any).name &&
    typeof (obj as any).name.simpleText === 'string'
  );
}

// Type guard to check if the JSON has the expected structure
function hasValidCaptionTracks(obj: unknown): obj is {
  captions: {
    playerCaptionsTracklistRenderer: {
      captionTracks: unknown[];
    }
  }
} {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'captions' in obj &&
    typeof (obj as any).captions === 'object' &&
    (obj as any).captions !== null &&
    'playerCaptionsTracklistRenderer' in (obj as any).captions &&
    typeof (obj as any).captions.playerCaptionsTracklistRenderer === 'object' &&
    (obj as any).captions.playerCaptionsTracklistRenderer !== null &&
    'captionTracks' in (obj as any).captions.playerCaptionsTracklistRenderer &&
    Array.isArray((obj as any).captions.playerCaptionsTracklistRenderer.captionTracks)
  );
}

export interface YtInitialPlayerResponseInformation {
  isValid: boolean;
  language: string;
  transcript: string;
  videoDetails: VideoDetails | null;
}

export async function parse_ytInitialPlayerResponse(ytInitialPlayerResponse: unknown): Promise<YtInitialPlayerResponseInformation> {
  const result: YtInitialPlayerResponseInformation = {
    isValid: false,
    language: '',
    transcript: '',
    videoDetails: null,
  };

  if (!ytInitialPlayerResponse) {
    return result;
  }

  result.isValid = true;

  try {
    // check if we have captions
    if (hasValidCaptionTracks(ytInitialPlayerResponse)) {
      // Filter and map only valid caption tracks
      const captionTracks = ytInitialPlayerResponse.captions.playerCaptionsTracklistRenderer.captionTracks
        .filter(isValidCaptionTrack)
        .map(track => ({
          baseUrl: track.baseUrl,
          languageCode: track.languageCode,
          displayName: track.name.simpleText,
        }));

      if (captionTracks.length > 0) {
        // we order the captions by language code with the 'en' language first
        captionTracks.sort((a, b) => {
          if (a.languageCode === 'en') return -2;
          if (b.languageCode === 'en') return 2;
          // we also checs if the language code starts with 'en'
          if (a.languageCode.startsWith('en')) return -1;
          if (b.languageCode.startsWith('en')) return 1;
          return a.languageCode.localeCompare(b.languageCode);
        });

        // we get the captions from the first one (should be english)
        result.language = captionTracks[0].languageCode;
        result.transcript = await getYoutubeCaptions(captionTracks[0].baseUrl);
      } else {
        result.language = '';
        result.transcript = '';
      }

    } else {
      console.error('Invalid JSON structure: missing required caption tracks data');
      result.isValid = false;
    }

    // check if we have video details
    if (hasValidVideoDetails(ytInitialPlayerResponse)) {
      result.videoDetails = ytInitialPlayerResponse.videoDetails;
    } else {
      console.error('Invalid JSON structure: missing required video details data');
      result.isValid = false;
    }

    return result;
  } catch (error) {
    console.error('Error parsing YouTube captions:', error);
    return result;
  }
}

async function getYoutubeCaptions(baseUrl: string): Promise<string> {
  try {
    const captions = await fetch(baseUrl);
    const captionsText = await captions.text();
    const transcript = parseTranscript(captionsText);
    console.log('Transcript:');
    console.log(transcript);
    return transcript.map(t => t.text).join(' ');
  } catch (error) {
    console.error('Error getting youtube captions:', error);
    return '';
  }
}

/**
 * Parses XML transcript data from YouTube captions
 * @param xmlString The XML string to parse
 * @returns Array of transcript text segments with timing information
 */
interface TranscriptText {
  start: number;
  duration: number;
  text: string;
}

function parseTranscript(xmlString: string): TranscriptText[] {
  try {
    // Create a DOMParser
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    // Get all text elements
    const textElements = xmlDoc.getElementsByTagName('text');
    const transcript: TranscriptText[] = [];

    // Convert HTMLCollection to Array and map to our type
    Array.from(textElements).forEach(element => {
      const start = parseFloat(element.getAttribute('start') || '0');
      const duration = parseFloat(element.getAttribute('dur') || '0');
      const text = element.textContent || '';

      // Only add if we have valid data
      if (!isNaN(start) && !isNaN(duration) && text) {
        transcript.push({
          start,
          duration,
          text: text.trim()
        });
      }
    });

    return transcript;
  } catch (error) {
    console.error('Error parsing transcript XML:', error);
    return [];
  }
}


// output is like this:
// "captions": {
//     "playerCaptionsTracklistRenderer": {
//       "captionTracks": [
//         {
//           "baseUrl": "https://www.youtube.com/api/timedtext?v=RwpJFL0_tSc&ei=4X82aPqsIZzZy_sP59r12Qc&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1748427345&sparams=ip,ipbits,expire,v,ei,caps,opi,xoaf&signature=752FC42E02DDFFE5F2B64610315889873CC2D016.6A5FB3A78131C45CA4B176D705D951D5F80F0F5D&key=yt8&kind=asr&lang=pt&variant=punctuated",
//           "name": {
//             "simpleText": "Portuguese (auto-generated)"
//           },
//           "vssId": "a.pt",
//           "languageCode": "pt",
//           "kind": "asr",
//           "isTranslatable": true,
//           "trackName": ""
//         }
//       ],
//       "audioTracks": [
//         {
//           "captionTrackIndices": [
//             0
//           ],
//           "audioTrackId": "en-US.10"
//         },
//         {
//           "captionTrackIndices": [
//             0
//           ],
//           "audioTrackId": "pt-BR.4"
//         }
//       ],
//       "translationLanguages": [
//         {
//           "languageCode": "ab",
//           "languageName": {
//             "simpleText": "Abkhazian"
//           }
//         },
// ...
//         {
//           "languageCode": "zu",
//           "languageName": {
//             "simpleText": "Zulu"
//           }
//         }
//       ],
//       "defaultAudioTrackIndex": 1
//     }
//   },
