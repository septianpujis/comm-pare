// Background service worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('commpare extension installed');
});

// Handle extension icon click (optional)
chrome.action.onClicked.addListener((tab) => {
  // This will open the popup automatically
});

