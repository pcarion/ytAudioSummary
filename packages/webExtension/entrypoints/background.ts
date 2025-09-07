export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  // Check if browser supports sidePanel API
  if (typeof browser !== 'undefined' && browser.sidePanel) {
    // Set the side panel to open when the extension action icon is clicked
    browser.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch((error) => console.error('Error setting side panel behavior:', error));
  }
});
