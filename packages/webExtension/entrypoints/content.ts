export default defineContentScript({
  matches: ['*://*.youtube.com/*'],
  main() {
    console.log('YouTube Audio Summary content script loaded!');
    
    // Function to detect YouTube video information
    const detectVideoInfo = () => {
      const videoTitle = document.querySelector('h1.ytd-video-primary-info-renderer')?.textContent?.trim() ||
                        document.querySelector('h1.title')?.textContent?.trim() ||
                        document.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
                        '';
      
      const videoUrl = window.location.href;
      const isVideoPage = videoUrl.includes('/watch?v=');
      
      return {
        title: videoTitle,
        url: videoUrl,
        detected: isVideoPage && videoTitle.length > 0
      };
    };
    
    // Send video info to background script
    const sendVideoInfo = () => {
      const videoInfo = detectVideoInfo();
      browser.runtime.sendMessage({
        type: 'video_detected',
        video: videoInfo
      });
    };
    
    // Initial detection
    sendVideoInfo();
    
    // Watch for navigation changes (YouTube is a SPA)
    let currentUrl = window.location.href;
    const observer = new MutationObserver(() => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        setTimeout(sendVideoInfo, 1000); // Wait for page to load
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  },
});
