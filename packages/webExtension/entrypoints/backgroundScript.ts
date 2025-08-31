// Background Service Worker
import { createTRPCClient, httpBatchLink } from '@trpc/client';
// import type { AppRouter } from '@yt-audio-summary/api-definition';

// Create tRPC client
// const trpc = createTRPCClient<any>({
//   links: [
//     httpBatchLink({
//       url: 'https://your-backend-url.com/trpc',
//     }),
//   ],
// });

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('YouTube Audio Summary extension installed');
  }
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'processAudio') {
    handleAudioProcessing(request.data)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'getAnalysis') {
    handleGetAnalysis(request.videoId)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// Handle audio processing
async function handleAudioProcessing(_audioData: unknown) {
  try {
    // const result = await trpc.processAudio.mutate(audioData);
    // return result;
    return { success: true, message: 'Audio processing mocked' };
  } catch (error) {
    console.error('Audio processing error:', error);
    throw error;
  }
}

// Handle getting analysis results
async function handleGetAnalysis(_videoId: string) {
  try {
    // const result = await trpc.getAnalysis.query({ videoId });
    // return result;
    return { success: true, message: 'Analysis mocked' };
  } catch (error) {
    console.error('Get analysis error:', error);
    throw error;
  }
}

// Handle tab updates to inject content script
// Note: Content script is now automatically injected via manifest
// This listener is kept for potential future dynamic injection
chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('youtube.com/watch')) {
    console.log('YouTube tab updated:', tab.url);
  }
});

export default {};
