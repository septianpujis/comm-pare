// Background service worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('commpare extension installed');
});

// Handle extension icon click (optional)
chrome.action.onClicked.addListener((tab) => {
  // This will open the popup automatically
});

// Handle messages from content scripts to get tab ID
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getTabId' && sender && sender.tab) {
    sendResponse({ tabId: sender.tab.id });
    return true;
  }
});

