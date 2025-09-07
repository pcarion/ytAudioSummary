import type { ExtensionMessage, GetPageContentResponse } from './types/messages';

// Type for the sendResponse function
type SendResponse = (response: unknown) => void;

// Type-safe wrapper for browser.tabs.sendMessage
export const messaging = {
  // Send message to get page content
  async getPageContent(tabId: number): Promise<GetPageContentResponse> {
    return browser.tabs.sendMessage(tabId, {
      type: 'GET_PAGE_CONTENT'
    } as ExtensionMessage);
  }
};

// Type-safe message listener wrapper
export const onMessage = <T extends ExtensionMessage>(
  messageType: T['type'],
  handler: (message: T) => Promise<unknown> | unknown
) => {
  const listener = (message: ExtensionMessage, _sender: unknown, sendResponse: SendResponse) => {
    if (message.type === messageType) {
      const result = handler(message as T);
      if (result instanceof Promise) {
        result.then(sendResponse).catch(error => {
          sendResponse({ success: false, error: error.message });
        });
        return true; // Keep message channel open for async response
      }
      sendResponse(result);
      return true; // Prevent other listeners from handling this message
    }
    // Return false to allow other listeners to handle the message
    return false;
  };

  browser.runtime.onMessage.addListener(listener);
  return () => browser.runtime.onMessage.removeListener(listener);
};
