chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: toggleMenu,
  });
});

function toggleMenu() {
  const menu = document.getElementById("comm-pare-popup-menu");
  const imageWrappers = document.getElementsByClassName(
    "comm-pare-image-wrapper"
  );

  if (menu) {
    menu.remove(); // Remove if it exists
    if (imageWrappers.length > 0) {
      Array.from(imageWrappers).forEach((wrapper) => wrapper.remove());
    }
    menuVisible = false;
    imageLock = false;
    images = []; // Store all images
  } else {
    createMenu(); // Otherwise, create it
  }
}
