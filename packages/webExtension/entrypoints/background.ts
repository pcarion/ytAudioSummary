export default defineBackground(() => {
  console.log('YouTube Audio Summary Extension loaded!', { id: browser.runtime.id });

  // Handle sidepanel requests
  browser.action.onClicked.addListener(async (tab) => {
    if (tab.id) {
      await browser.sidePanel.open({ tabId: tab.id });
    }
  });

  // Listen for messages from content scripts and sidepanel
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    console.log('Background received message:', message);
    
    switch (message.type) {
      case 'check_connection':
        // Mock connection check
        sendResponse({ success: true, connected: false });
        break;
        
      case 'connect_backend':
        // Mock backend connection
        sendResponse({ success: true, connected: true });
        break;
        
      case 'get_video_info':
        // Mock video info
        sendResponse({ 
          success: true, 
          video: {
            title: 'Sample YouTube Video',
            url: 'https://youtube.com/watch?v=sample',
            detected: true
          }
        });
        break;
        
      case 'start_audio_capture':
        // Mock audio capture start
        sendResponse({ success: true });
        break;
        
      case 'stop_audio_capture':
        // Mock audio capture stop
        sendResponse({ success: true });
        break;
        
      default:
        sendResponse({ success: false, error: 'Unknown message type' });
    }
    
    return true; // Keep the message channel open for async responses
  });
});
