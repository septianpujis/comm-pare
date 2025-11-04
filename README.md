# commpare Chrome Extension

A Chrome extension that helps you achieve perfect pixel design by overlaying design images on web pages.

## Features

- 📸 **Upload Images**: Import design images from local files
- 📋 **Paste from Clipboard**: Paste images directly from your clipboard
- 🎯 **Full Control**: Adjust position, size, rotation, opacity, and visibility
- 💾 **Persistent Storage**: All image data is saved and persists across page refreshes
- 🖱️ **Drag & Drop**: Drag images to position them on the page
- 👁️ **Toggle Visibility**: Show/hide images as needed

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top right)
3. Click "Load unpacked"
4. Select the folder containing this extension
5. The extension icon should now appear in your toolbar

## Usage

1. Click the extension icon in your Chrome toolbar
2. Upload an image file or paste from clipboard
3. The image will appear as an overlay on the current web page
4. Adjust controls in the popup:
   - **X, Y**: Position coordinates
   - **Width**: Image width (in pixels or 'auto')
   - **Opacity**: Transparency level (0-1)
   - **Rotation**: Rotation angle in degrees
5. Click the eye icon to show/hide images
6. Drag images directly on the page to reposition them
7. Use "Toggle Overlay" to show/hide all overlays
8. Use "Clear All" to remove all images

## Files Structure

- `manifest.json` - Extension configuration
- `popup.html` - Extension popup UI
- `popup.js` - Popup logic and image management
- `popup.css` - Styling for the popup
- `content.js` - Script injected into web pages
- `overlay.css` - Styling for the overlay system
- `background.js` - Background service worker
- `variables.css` - CSS variables for design system
- `font.css` - Font definitions

## Permissions

- `storage`: To save image data persistently
- `activeTab`: To interact with the current tab
- `clipboardRead`: To read images from clipboard

## Browser Compatibility

- Chrome (Manifest V3)
- Edge (Chromium-based)

## Notes

- Images are stored in Chrome's local storage
- Each image is saved with its position, size, rotation, opacity, and visibility state
- Data persists even after closing and reopening the browser

