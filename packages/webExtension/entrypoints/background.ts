import type { 
  ExtensionMessage, 
  MessageResponse,
  CheckConnectionRequest,
  ConnectBackendRequest,
  GetVideoInfoRequest,
  StartAudioCaptureRequest,
  StopAudioCaptureRequest,
  VideoDetectedMessage,
  CheckConnectionResponse,
  ConnectBackendResponse,
  GetVideoInfoResponse,
  AudioCaptureResponse
} from '../lib/types/messages.js';

export default defineBackground(() => {
  console.log('YouTube Audio Summary Extension loaded!', { id: browser.runtime.id });

  // Handle sidepanel requests
  browser.action.onClicked.addListener(async (tab) => {
    if (tab.id) {
      await browser.sidePanel.open({ tabId: tab.id });
    }
  });

  // Listen for messages from content scripts and sidepanel
  browser.runtime.onMessage.addListener((
    message: ExtensionMessage, 
    _sender, 
    sendResponse: (response: MessageResponse<typeof message>) => void
  ) => {
    console.log('Background received message:', message);
    
    switch (message.type) {
      case 'check_connection': {
        // Mock connection check
        const checkResponse: CheckConnectionResponse = { success: true, connected: false };
        sendResponse(checkResponse);
        break;
      }
        
      case 'connect_backend': {
        // Mock backend connection
        const connectResponse: ConnectBackendResponse = { success: true, connected: true };
        sendResponse(connectResponse);
        break;
      }
        
      case 'get_video_info': {
        // Mock video info
        const videoResponse: GetVideoInfoResponse = { 
          success: true, 
          video: {
            title: 'Sample YouTube Video',
            url: 'https://youtube.com/watch?v=sample',
            detected: true
          }
        };
        sendResponse(videoResponse);
        break;
      }
        
      case 'start_audio_capture': {
        // Mock audio capture start
        const startResponse: AudioCaptureResponse = { success: true };
        sendResponse(startResponse);
        break;
      }
        
      case 'stop_audio_capture': {
        // Mock audio capture stop
        const stopResponse: AudioCaptureResponse = { success: true };
        sendResponse(stopResponse);
        break;
      }
        
      default:
        sendResponse({ success: false });
    }
    
    return true; // Keep the message channel open for async responses
  });
});
