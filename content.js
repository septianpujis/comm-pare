// Content script injected into web pages
(function() {
  'use strict';

  let overlayContainer = null;
  let images = new Map();
  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };
  let currentDragImage = null;

  // Inject CSS variables
  function injectCSSVariables() {
    const style = document.createElement('style');
    style.id = 'pixel-helper-variables';
    style.textContent = `
      #pixel-helper-overlay {
        --neutral-N00: #ffffff;
        --neutral-N10: #fbfafa;
        --neutral-N20: #d0d0d0;
        --neutral-N50: #63656e;
        --neutral-N100: #000000;
        --primary-P10: #f0f1ff;
        --primary-P20: #dbdcf8;
        --primary-P30: #bbbdf3;
        --primary-P40: #9b9dee;
        --primary-P50: #7a7ce9;
        --primary-P70: #3b3fea;
        --primary-P80: #282a94;
        --danger-D50: #ee4137;
        --danger-D60: #c6362e;
        --size-1: 4px;
        --size-2: 8px;
        --size-3: 12px;
        --size-4: 16px;
      }
    `;
    document.head.appendChild(style);
  }

  // Initialize overlay
  function initOverlay() {
    if (overlayContainer) return;

    injectCSSVariables();

    overlayContainer = document.createElement('div');
    overlayContainer.className = 'pixel-helper-overlay';
    overlayContainer.id = 'pixel-helper-overlay';
    document.body.appendChild(overlayContainer);

    // Load saved images
    loadImages();
  }

  // Load images from storage
  async function loadImages() {
    try {
      const result = await chrome.storage.local.get(['images']);
      const savedImages = result.images || [];
      
      savedImages.forEach(imageData => {
        addImageToOverlay(imageData);
      });
    } catch (error) {
      console.error('Error loading images:', error);
    }
  }

  // Add image to overlay
  function addImageToOverlay(imageData) {
    if (images.has(imageData.id)) {
      updateImageInOverlay(imageData);
      return;
    }

    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'pixel-helper-image';
    imageWrapper.dataset.id = imageData.id;
    imageWrapper.style.left = `${imageData.position.x}px`;
    imageWrapper.style.top = `${imageData.position.y}px`;
    imageWrapper.style.width = typeof imageData.size.width === 'number' ? `${imageData.size.width}px` : imageData.size.width;
    imageWrapper.style.height = typeof imageData.size.height === 'number' ? `${imageData.size.height}px` : imageData.size.height || 'auto';
    imageWrapper.style.opacity = imageData.opacity;
    imageWrapper.style.transform = `rotate(${imageData.rotation}deg)`;
    imageWrapper.style.zIndex = imageData.zIndex || 1000;
    imageWrapper.style.display = imageData.visible ? 'block' : 'none';
    
    // Apply lock states
    if (imageData.fullyLocked) {
      imageWrapper.style.pointerEvents = 'none';
    }
    if (imageData.centerLocked) {
      // Center horizontally
      const viewportWidth = window.innerWidth;
      const imgWidth = typeof imageData.size.width === 'number' ? imageData.size.width : 400;
      imageWrapper.style.left = `${(viewportWidth - imgWidth) / 2}px`;
    }

    const img = document.createElement('img');
    img.src = imageData.dataUrl;
    img.draggable = false;

    const controls = document.createElement('div');
    controls.className = 'pixel-helper-image-controls';
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'pixel-helper-image-control-btn';
    deleteBtn.textContent = '✕';
    deleteBtn.title = 'Delete';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteImage(imageData.id);
    });

    controls.appendChild(deleteBtn);
    imageWrapper.appendChild(img);
    imageWrapper.appendChild(controls);

    overlayContainer.appendChild(imageWrapper);
    images.set(imageData.id, { element: imageWrapper, data: imageData });
    
    // Set up drag functionality after image is added to Map
    imageWrapper.addEventListener('mousedown', (e) => {
      if (e.target === deleteBtn || deleteBtn.contains(e.target)) return;
      
      // Get imageInfo from Map (should be available now)
      const imageInfo = images.get(imageData.id);
      if (!imageInfo || imageInfo.data.fullyLocked) return; // Don't allow dragging if fully locked
      
      isDragging = true;
      currentDragImage = imageWrapper;
      const rect = imageWrapper.getBoundingClientRect();
      
      // Calculate drag offset based on current position
      // If center locked, only allow vertical dragging
      if (imageInfo.data.centerLocked) {
        dragOffset.x = 0; // Don't use X offset for center-locked images
        dragOffset.y = e.clientY - rect.top;
      } else {
        dragOffset.x = e.clientX - rect.left;
        dragOffset.y = e.clientY - rect.top;
      }
      
      imageWrapper.classList.add('dragging');
      e.preventDefault();
      e.stopPropagation();
    });
  }

  // Update image in overlay
  function updateImageInOverlay(updateData) {
    const imageId = updateData.id || (updateData.imageId ? updateData.imageId : null);
    if (!imageId) return;
    
    const imageInfo = images.get(imageId);
    if (!imageInfo) return;

    const { element, data } = imageInfo;
    
    // Update position
    if (updateData.position !== undefined) {
      const position = typeof updateData.position === 'object' ? updateData.position : data.position;
      element.style.left = `${position.x}px`;
      element.style.top = `${position.y}px`;
      data.position = position;
    } else if (updateData.property === 'position' && updateData.value !== undefined) {
      const position = typeof updateData.value === 'object' ? updateData.value : data.position;
      element.style.left = `${position.x}px`;
      element.style.top = `${position.y}px`;
      data.position = position;
    }
    
    // Update size
    if (updateData.size !== undefined) {
      const size = typeof updateData.size === 'object' ? updateData.size : data.size;
      element.style.width = typeof size.width === 'number' ? `${size.width}px` : size.width;
      if (size.height) {
        element.style.height = typeof size.height === 'number' ? `${size.height}px` : size.height;
      }
      data.size = size;
    } else if (updateData.property === 'size' && updateData.value !== undefined) {
      const size = typeof updateData.value === 'object' ? updateData.value : data.size;
      element.style.width = typeof size.width === 'number' ? `${size.width}px` : size.width;
      if (size.height) {
        element.style.height = typeof size.height === 'number' ? `${size.height}px` : size.height;
      }
      data.size = size;
    }
    
    // Update opacity
    if (updateData.opacity !== undefined) {
      element.style.opacity = updateData.opacity;
      data.opacity = updateData.opacity;
    } else if (updateData.property === 'opacity' && updateData.value !== undefined) {
      element.style.opacity = updateData.value;
      data.opacity = updateData.value;
    }
    
    // Update rotation
    if (updateData.rotation !== undefined) {
      element.style.transform = `rotate(${updateData.rotation}deg)`;
      data.rotation = updateData.rotation;
    } else if (updateData.property === 'rotation' && updateData.value !== undefined) {
      element.style.transform = `rotate(${updateData.value}deg)`;
      data.rotation = updateData.value;
    }
    
    // Update visibility
    if (updateData.visible !== undefined) {
      element.style.display = updateData.visible ? 'block' : 'none';
      data.visible = updateData.visible;
    } else if (updateData.property === 'visible' && updateData.value !== undefined) {
      element.style.display = updateData.value ? 'block' : 'none';
      data.visible = updateData.value;
    }
    
    // Update center locked
    if (updateData.centerLocked !== undefined) {
      data.centerLocked = updateData.centerLocked;
      if (updateData.centerLocked) {
        // Center horizontally
        const viewportWidth = window.innerWidth;
        const imgWidth = element.offsetWidth || (typeof data.size.width === 'number' ? data.size.width : 400);
        const centeredX = (viewportWidth - imgWidth) / 2;
        element.style.left = `${centeredX}px`;
        data.position.x = centeredX;
      }
    } else if (updateData.property === 'centerLocked' && updateData.value !== undefined) {
      data.centerLocked = updateData.value;
      if (updateData.value) {
        const viewportWidth = window.innerWidth;
        const imgWidth = element.offsetWidth || (typeof data.size.width === 'number' ? data.size.width : 400);
        const centeredX = (viewportWidth - imgWidth) / 2;
        element.style.left = `${centeredX}px`;
        data.position.x = centeredX;
      }
    }
    
    // Update fully locked
    if (updateData.fullyLocked !== undefined) {
      element.style.pointerEvents = updateData.fullyLocked ? 'none' : 'auto';
      data.fullyLocked = updateData.fullyLocked;
    } else if (updateData.property === 'fullyLocked' && updateData.value !== undefined) {
      element.style.pointerEvents = updateData.value ? 'none' : 'auto';
      data.fullyLocked = updateData.value;
    }
  }

  // Delete image
  async function deleteImage(imageId) {
    const imageInfo = images.get(imageId);
    if (imageInfo) {
      imageInfo.element.remove();
      images.delete(imageId);
    }

    const result = await chrome.storage.local.get(['images']);
    const savedImages = result.images || [];
    const filtered = savedImages.filter(img => img.id !== imageId);
    await chrome.storage.local.set({ images: filtered });
  }

  // Handle mouse move for dragging
  document.addEventListener('mousemove', (e) => {
    if (!isDragging || !currentDragImage) return;

    const imageId = currentDragImage.dataset.id;
    const imageInfo = images.get(imageId);
    
    if (!imageInfo || imageInfo.data.fullyLocked) {
      // Stop dragging if image info is missing or fully locked
      isDragging = false;
      if (currentDragImage) {
        currentDragImage.classList.remove('dragging');
      }
      currentDragImage = null;
      return;
    }

    let newX, newY;
    
    // If center locked, only allow vertical movement
    if (imageInfo.data.centerLocked) {
      const viewportWidth = window.innerWidth;
      const imgWidth = currentDragImage.offsetWidth || (typeof imageInfo.data.size.width === 'number' ? imageInfo.data.size.width : 400);
      newX = (viewportWidth - imgWidth) / 2;
      newY = e.clientY - dragOffset.y;
    } else {
      newX = e.clientX - dragOffset.x;
      newY = e.clientY - dragOffset.y;
    }

    currentDragImage.style.left = `${newX}px`;
    currentDragImage.style.top = `${newY}px`;

    imageInfo.data.position = { x: newX, y: newY };
    
    // Save to storage
    chrome.storage.local.get(['images'], (result) => {
      const savedImages = result.images || [];
      const imageIndex = savedImages.findIndex(img => img.id === imageId);
      if (imageIndex !== -1) {
        savedImages[imageIndex].position = { x: newX, y: newY };
        chrome.storage.local.set({ images: savedImages });
      }
    });
  });

  // Handle mouse up to stop dragging - use capture phase to ensure it fires
  document.addEventListener('mouseup', (e) => {
    if (isDragging && currentDragImage) {
      currentDragImage.classList.remove('dragging');
      isDragging = false;
      currentDragImage = null;
      dragOffset = { x: 0, y: 0 };
    }
  }, true);

  // Also handle mouse leave to stop dragging when mouse leaves window
  window.addEventListener('mouseleave', () => {
    if (isDragging && currentDragImage) {
      currentDragImage.classList.remove('dragging');
      isDragging = false;
      currentDragImage = null;
      dragOffset = { x: 0, y: 0 };
    }
  });

  // Handle window resize to re-center locked images
  window.addEventListener('resize', () => {
    images.forEach((imageInfo) => {
      if (imageInfo.data.centerLocked) {
        const viewportWidth = window.innerWidth;
        const imgWidth = imageInfo.element.offsetWidth || (typeof imageInfo.data.size.width === 'number' ? imageInfo.data.size.width : 400);
        const centeredX = (viewportWidth - imgWidth) / 2;
        imageInfo.element.style.left = `${centeredX}px`;
        imageInfo.data.position.x = centeredX;
        
        chrome.storage.local.get(['images'], (result) => {
          const savedImages = result.images || [];
          const imageIndex = savedImages.findIndex(img => img.id === imageInfo.data.id);
          if (imageIndex !== -1) {
            savedImages[imageIndex].position.x = centeredX;
            chrome.storage.local.set({ images: savedImages });
          }
        });
      }
    });
  });

  // Message listener from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
      case 'addImage':
        addImageToOverlay(request.imageData);
        sendResponse({ success: true });
        break;
      
      case 'updateImage':
        updateImageInOverlay({
          imageId: request.imageId,
          property: request.property,
          value: request.value
        });
        chrome.storage.local.get(['images'], (result) => {
          const savedImages = result.images || [];
          const imageIndex = savedImages.findIndex(img => img.id === request.imageId);
          if (imageIndex !== -1) {
            if (request.property === 'position' && typeof request.value === 'object') {
              savedImages[imageIndex].position = request.value;
            } else if (request.property === 'size' && typeof request.value === 'object') {
              savedImages[imageIndex].size = request.value;
            } else {
              savedImages[imageIndex][request.property] = request.value;
            }
            chrome.storage.local.set({ images: savedImages });
          }
        });
        sendResponse({ success: true });
        break;
      
      case 'centerImage':
        const imageInfo = images.get(request.imageId);
        if (imageInfo) {
          const viewportWidth = window.innerWidth;
          const imgWidth = imageInfo.element.offsetWidth || (typeof imageInfo.data.size.width === 'number' ? imageInfo.data.size.width : 400);
          const centeredX = (viewportWidth - imgWidth) / 2;
          imageInfo.element.style.left = `${centeredX}px`;
          imageInfo.data.position.x = centeredX;
          
          chrome.storage.local.get(['images'], (result) => {
            const savedImages = result.images || [];
            const imageIndex = savedImages.findIndex(img => img.id === request.imageId);
            if (imageIndex !== -1) {
              savedImages[imageIndex].position.x = centeredX;
              chrome.storage.local.set({ images: savedImages });
            }
          });
        }
        sendResponse({ success: true });
        break;
      
      case 'deleteImage':
        deleteImage(request.imageId);
        sendResponse({ success: true });
        break;
      
      case 'clearImages':
        images.forEach((imageInfo) => {
          imageInfo.element.remove();
        });
        images.clear();
        chrome.storage.local.set({ images: [] });
        sendResponse({ success: true });
        break;
      
      case 'toggleOverlay':
        if (overlayContainer) {
          overlayContainer.style.display = overlayContainer.style.display === 'none' ? 'block' : 'none';
        }
        sendResponse({ success: true });
        break;
    }
    return true;
  });

  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOverlay);
  } else {
    initOverlay();
  }

  // Also initialize after a short delay to ensure DOM is ready
  setTimeout(initOverlay, 100);
})();

