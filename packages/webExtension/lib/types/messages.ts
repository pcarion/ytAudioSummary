// Message types for type-safe communication between extension components

export interface GetPageContentRequest {
  type: 'GET_PAGE_CONTENT';
}

export type GetPageContentResponse = {
  success: true;
  date: string;
  content: {
    pageInformation: {
      title: string;
      url: string;
      domain: string;
      pathname: string;
      timestamp: string;
    };
    pageContentDetails: {
      author: string;
      title: string;
      description: string;
      markdown: string;
    };
    // if page is a youtube video, this will be present
    youtubeDetails: {
      videoId: string;
      title: string;
      author: string;
      shortDescription: string;
      isLiveContent: boolean;
      lengthSeconds: string;
      channelId: string;
      thumbnails: {
        url: string;
        width: number;
        height: number;
      }[];
    };
    transcriptInformation: {
      language: string;
      transcript: string;
    };
    metadata: {
      name: string;
      value: string;
    }[];
  };
} | {
  success: false;
  error: string;
};

// Sidepanel communication messages
export interface CheckConnectionRequest {
  type: 'check_connection';
}

export interface ConnectBackendRequest {
  type: 'connect_backend';
}

export interface GetVideoInfoRequest {
  type: 'get_video_info';
}

export interface StartAudioCaptureRequest {
  type: 'start_audio_capture';
}

export interface StopAudioCaptureRequest {
  type: 'stop_audio_capture';
}

export interface VideoDetectedMessage {
  type: 'video_detected';
  video: {
    title: string;
    url: string;
    detected: boolean;
  };
}

export interface ConnectionStatusMessage {
  type: 'connection_status';
  status: {
    connected: boolean;
    connecting: boolean;
    failed: boolean;
  };
}

export interface AnalysisCompleteMessage {
  type: 'analysis_complete';
  result: {
    summary: string;
    duration: number;
    confidence: number;
  };
}

export interface AnalysisErrorMessage {
  type: 'analysis_error';
  error: string;
}

// Response types
export interface CheckConnectionResponse {
  success: boolean;
  connected?: boolean;
}

export interface ConnectBackendResponse {
  success: boolean;
  connected?: boolean;
}

export interface GetVideoInfoResponse {
  success: boolean;
  video?: {
    title: string;
    url: string;
    detected: boolean;
  };
}

export interface AudioCaptureResponse {
  success: boolean;
}

// extract types
export type GetPageContent = Extract<GetPageContentResponse, { success: true }>['content'];
export type GetPageYoutubeVideoDetails = Extract<GetPageContentResponse, { success: true }>['content']['youtubeDetails'];
export type GetPageContentTranscriptInformation = Extract<GetPageContentResponse, { success: true }>['content']['transcriptInformation'];
export type GetPageContentDetails = Extract<GetPageContentResponse, { success: true }>['content']['pageContentDetails'];

// Union type of all possible messages
export type ExtensionMessage = 
  | GetPageContentRequest
  | CheckConnectionRequest
  | ConnectBackendRequest
  | GetVideoInfoRequest
  | StartAudioCaptureRequest
  | StopAudioCaptureRequest
  | VideoDetectedMessage
  | ConnectionStatusMessage
  | AnalysisCompleteMessage
  | AnalysisErrorMessage;

// Response types
export type MessageResponse<T extends ExtensionMessage> =
  T extends GetPageContentRequest ? GetPageContentResponse :
  T extends CheckConnectionRequest ? CheckConnectionResponse :
  T extends ConnectBackendRequest ? ConnectBackendResponse :
  T extends GetVideoInfoRequest ? GetVideoInfoResponse :
  T extends StartAudioCaptureRequest ? AudioCaptureResponse :
  T extends StopAudioCaptureRequest ? AudioCaptureResponse :
  never;
