// Popup script for managing images
document.addEventListener('DOMContentLoaded', async () => {
  const fileInput = document.getElementById('fileInput');
  const pasteBtn = document.getElementById('pasteBtn');
  const imagesList = document.getElementById('imagesList');
  const toggleBtn = document.getElementById('toggleBtn');
  const clearBtn = document.getElementById('clearBtn');

  // Load existing images
  await loadImages();

  // File upload handler
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      await addImageFromFile(file);
      fileInput.value = '';
    }
  });

  // Paste from clipboard handler
  pasteBtn.addEventListener('click', async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        if (item.types.includes('image/png') || item.types.includes('image/jpeg')) {
          const blob = await item.getType(item.types.find(t => t.startsWith('image/')));
          const file = new File([blob], `pasted-${Date.now()}.png`, { type: blob.type });
          await addImageFromFile(file);
        }
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
      alert('Failed to read clipboard. Please ensure clipboard access is granted.');
    }
  });

  // Toggle overlay
  toggleBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { action: 'toggleOverlay' });
  });

  // Clear all images
  clearBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to clear all images?')) {
      await chrome.storage.local.set({ images: [] });
      await loadImages();
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      chrome.tabs.sendMessage(tab.id, { action: 'clearImages' });
    }
  });

  async function addImageFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        // Load image to get its natural dimensions
        const img = new Image();
        img.onload = async () => {
        const imageData = {
          id: Date.now().toString(),
          name: file.name,
          dataUrl: e.target.result,
          position: { x: 0, y: 0 },
            size: { width: img.naturalWidth, height: 'auto' },
          rotation: 0,
          opacity: 0.5,
          visible: true,
          zIndex: 1000,
            centerLocked: true,
          fullyLocked: false
        };

        const result = await chrome.storage.local.get(['images']);
        const images = result.images || [];
        images.push(imageData);
        await chrome.storage.local.set({ images });

        await loadImages();
        
        // Send to content script
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.tabs.sendMessage(tab.id, { action: 'addImage', imageData });

        resolve();
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function loadImages() {
    const result = await chrome.storage.local.get(['images']);
    const images = result.images || [];

    if (images.length === 0) {
      imagesList.innerHTML = '<p class="empty-state">No images loaded</p>';
      return;
    }

    imagesList.innerHTML = '';
    images.forEach(image => {
      const item = createImageItem(image);
      imagesList.appendChild(item);
    });
  }

  function createImageItem(image) {
    const item = document.createElement('div');
    item.className = 'image-item';
    item.dataset.id = image.id;

    const header = document.createElement('div');
    header.className = 'image-item-header';

    // Delete button - moved to header, left of title
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'icon-action-btn delete header-delete-btn';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.title = 'Delete';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent header click from triggering
      deleteImage(image.id);
    });

    const name = document.createElement('div');
    name.className = 'image-item-name';
    name.textContent = image.name;
    name.title = image.name; // Show full title on hover

    const actions = document.createElement('div');
    actions.className = 'image-item-actions';

    // Accordion toggle button
    const accordionToggleBtn = document.createElement('button');
    accordionToggleBtn.className = 'accordion-toggle-btn';
    accordionToggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
    accordionToggleBtn.title = 'Toggle controls';
    accordionToggleBtn.setAttribute('aria-expanded', 'true');

    actions.appendChild(accordionToggleBtn);
    header.appendChild(deleteBtn);
    header.appendChild(name);
    header.appendChild(actions);

    // Accordion content wrapper
    const accordionContent = document.createElement('div');
    accordionContent.className = 'accordion-content';

    const controls = document.createElement('div');
    controls.className = 'image-controls';

    // Icon buttons row (all icons inside accordion)
    const iconButtonsRow = document.createElement('div');
    iconButtonsRow.className = 'icon-buttons-row';

    // Visibility toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'icon-action-btn' + (image.visible ? ' active' : '');
    toggleBtn.innerHTML = image.visible ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    toggleBtn.title = image.visible ? 'Hide' : 'Show';
    toggleBtn.addEventListener('click', async () => {
      await toggleImageVisibility(image.id);
      // Reload to update button state
      await loadImages();
    });

    // Center lock checkbox button
    const centerLockBtn = document.createElement('button');
    centerLockBtn.className = 'icon-action-btn' + (image.centerLocked ? ' active' : '');
    centerLockBtn.innerHTML = image.centerLocked ? '<i class="fas fa-lock"></i>' : '<i class="fas fa-unlock"></i>';
    centerLockBtn.title = image.centerLocked ? 'Unlock center' : 'Lock center';
    centerLockBtn.addEventListener('click', async () => {
      const newState = !image.centerLocked;
      await updateImageProperty(image.id, 'centerLocked', newState);
      centerLockBtn.classList.toggle('active', newState);
      centerLockBtn.innerHTML = newState ? '<i class="fas fa-lock"></i>' : '<i class="fas fa-unlock"></i>';
      centerLockBtn.title = newState ? 'Unlock center' : 'Lock center';
      if (newState) {
        // Center the image horizontally
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.tabs.sendMessage(tab.id, {
          action: 'centerImage',
          imageId: image.id
        });
      }
    });

    // Full lock switch button
    const fullLockBtn = document.createElement('button');
    fullLockBtn.className = 'icon-action-btn' + (image.fullyLocked ? ' active' : '');
    fullLockBtn.innerHTML = image.fullyLocked ? '<i class="fas fa-lock"></i>' : '<i class="fas fa-unlock"></i>';
    fullLockBtn.title = image.fullyLocked ? 'Unlock' : 'Lock';
    fullLockBtn.addEventListener('click', async () => {
      const newState = !image.fullyLocked;
      await updateImageProperty(image.id, 'fullyLocked', newState);
      fullLockBtn.classList.toggle('active', newState);
      fullLockBtn.innerHTML = newState ? '<i class="fas fa-lock"></i>' : '<i class="fas fa-unlock"></i>';
      fullLockBtn.title = newState ? 'Unlock' : 'Lock';
    });

    iconButtonsRow.appendChild(toggleBtn);
    iconButtonsRow.appendChild(centerLockBtn);
    iconButtonsRow.appendChild(fullLockBtn);
    controls.appendChild(iconButtonsRow);

    // First row: X, Y, W (3 columns)
    // Position X - store reference to input for getting current value
    let xInputRef = null;
    let yInputRef = null;
    
    const posXGroup = createControlGroup('X', image.position.x, (value) => {
      const currentY = yInputRef ? parseFloat(yInputRef.value) || image.position.y : image.position.y;
      updateImageProperty(image.id, 'position', { x: Number(value), y: currentY });
    });
    controls.appendChild(posXGroup);
    xInputRef = posXGroup.querySelector('.control-input');

    // Position Y - store reference to input for getting current value
    const posYGroup = createControlGroup('Y', image.position.y, (value) => {
      const currentX = xInputRef ? parseFloat(xInputRef.value) || image.position.x : image.position.x;
      updateImageProperty(image.id, 'position', { x: currentX, y: Number(value) });
    });
    controls.appendChild(posYGroup);
    yInputRef = posYGroup.querySelector('.control-input');

    // Width
    const widthGroup = createControlGroup('W', image.size.width, async (value) => {
      const result = await chrome.storage.local.get(['images']);
      const images = result.images || [];
      const currentImage = images.find(img => img.id === image.id);
      const currentSize = currentImage ? currentImage.size : image.size;
      updateImageProperty(image.id, 'size', { ...currentSize, width: value === 'auto' ? 'auto' : Number(value) });
    });
    controls.appendChild(widthGroup);

    // Second row: R, Opacity
    // Rotation
    const rotationGroup = createControlGroup('R', image.rotation, (value) => {
      updateImageProperty(image.id, 'rotation', Number(value));
    });
    controls.appendChild(rotationGroup);

    // Opacity (spans 2 columns)
    const opacityGroup = createOpacityControl('O', image.opacity, (value) => {
      updateImageProperty(image.id, 'opacity', Number(value));
    });
    opacityGroup.classList.add('opacity-group');
    controls.appendChild(opacityGroup);

    accordionContent.appendChild(controls);
    item.appendChild(header);
    item.appendChild(accordionContent);

    // Accordion toggle functionality - make entire header clickable
    const toggleAccordion = () => {
      const isExpanded = accordionContent.classList.toggle('collapsed');
      accordionToggleBtn.setAttribute('aria-expanded', !isExpanded);
      accordionToggleBtn.innerHTML = isExpanded ? '<i class="fas fa-chevron-right"></i>' : '<i class="fas fa-chevron-down"></i>';
    };
    
    accordionToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent header click from triggering
      toggleAccordion();
    });
    
    // Make header clickable (but not delete button)
    header.addEventListener('click', (e) => {
      if (e.target === deleteBtn || deleteBtn.contains(e.target)) {
        return; // Don't toggle if clicking delete button
      }
      toggleAccordion();
    });

    return item;
  }

  function createOpacityControl(label, value, onChange) {
    const group = document.createElement('div');
    group.className = 'control-group';

    const labelEl = document.createElement('label');
    labelEl.className = 'control-label';
    labelEl.textContent = label;

    const slider = document.createElement('input');
    slider.className = 'control-slider';
    slider.type = 'range';
    slider.min = '0';
    slider.max = '1';
    slider.step = '0.01';
    slider.value = value;
    
    const valueDisplay = document.createElement('div');
    valueDisplay.className = 'control-slider-value';
    valueDisplay.textContent = Math.round(value * 100) + '%';
    
    slider.addEventListener('input', (e) => {
      const newValue = Number(e.target.value);
      valueDisplay.textContent = Math.round(newValue * 100) + '%';
      onChange(newValue);
    });

    group.appendChild(labelEl);
    group.appendChild(slider);
    group.appendChild(valueDisplay);
    return group;
  }

  function createControlGroup(label, value, onChange) {
    const group = document.createElement('div');
    group.className = 'control-group';

    const labelEl = document.createElement('label');
    labelEl.className = 'control-label';
    labelEl.textContent = label;

    const input = document.createElement('input');
    input.className = 'control-input';
    input.type = 'text';
    input.pattern = '[0-9.-]*';
    input.value = value;
    
    // Validate and handle input
    const handleInput = (e) => {
      let val = e.target.value;
      // Allow empty, negative sign, decimal point during typing
      if (val === '' || val === '-' || val === '.') {
        return;
      }
      const numValue = parseFloat(val);
      if (!isNaN(numValue)) {
        // Clamp to min/max if needed
        const min = label === 'Rotation' ? -360 : -10000;
        const max = label === 'Rotation' ? 360 : 10000;
        const clampedValue = Math.max(min, Math.min(max, numValue));
        if (clampedValue !== numValue) {
          input.value = clampedValue;
          onChange(clampedValue);
        } else {
          onChange(numValue);
        }
      }
    };
    
    input.addEventListener('input', handleInput);
    input.addEventListener('blur', (e) => {
      // Ensure valid value on blur
      const numValue = parseFloat(e.target.value);
      if (isNaN(numValue)) {
        input.value = value;
      } else {
        const min = label === 'Rotation' ? -360 : -10000;
        const max = label === 'Rotation' ? 360 : 10000;
        const clampedValue = Math.max(min, Math.min(max, numValue));
        input.value = clampedValue;
      }
    });

    // Add drag-to-change functionality
    let isDragging = false;
    let startY = 0;
    let startValue = 0;
    let sensitivity = 1; // Adjust sensitivity (lower = more sensitive)
    let dragHandler = null;
    let mouseUpHandler = null;

    input.addEventListener('mousedown', (e) => {
      // Only start drag if clicking on the right side of the input (last 20px)
      const rect = input.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const inputWidth = rect.width;
      
      if (clickX >= inputWidth - 20) {
        isDragging = true;
        startY = e.clientY;
        startValue = parseFloat(input.value) || 0;
        input.style.cursor = 'ns-resize';
        input.style.userSelect = 'none';
        input.classList.add('dragging');
        e.preventDefault();

        // Add global handlers for dragging
        dragHandler = (e) => {
          if (!isDragging) return;
          
          const deltaY = startY - e.clientY; // Negative deltaY = dragging up = increase value
          const change = Math.round(deltaY * sensitivity);
          const newValue = startValue + change;
          
          const min = label === 'Rotation' ? -360 : -10000;
          const max = label === 'Rotation' ? 360 : 10000;
          const clampedValue = Math.max(min, Math.min(max, newValue));
          
          input.value = clampedValue;
          onChange(clampedValue);
        };

        mouseUpHandler = () => {
          if (isDragging) {
            isDragging = false;
            input.style.cursor = '';
            input.style.userSelect = '';
            input.classList.remove('dragging');
            document.removeEventListener('mousemove', dragHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
          }
        };

        document.addEventListener('mousemove', dragHandler);
        document.addEventListener('mouseup', mouseUpHandler);
      }
    });

    // Visual indicator for draggable area
    input.addEventListener('mousemove', (e) => {
      if (isDragging) return;
      const rect = input.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const inputWidth = rect.width;
      
      if (clickX >= inputWidth - 20) {
        input.style.cursor = 'ns-resize';
      } else {
        input.style.cursor = '';
      }
    });

    input.addEventListener('mouseleave', () => {
      if (!isDragging) {
        input.style.cursor = '';
      }
    });

    group.appendChild(labelEl);
    group.appendChild(input);
    return group;
  }

  async function updateImageProperty(id, property, value) {
    const result = await chrome.storage.local.get(['images']);
    const images = result.images || [];
    const imageIndex = images.findIndex(img => img.id === id);
    
    if (imageIndex !== -1) {
      // Handle nested properties like position.x
      if (property === 'position' && typeof value === 'object') {
        images[imageIndex].position = { ...images[imageIndex].position, ...value };
      } else if (property === 'size' && typeof value === 'object') {
        images[imageIndex].size = { ...images[imageIndex].size, ...value };
      } else {
        images[imageIndex][property] = value;
      }
      
      await chrome.storage.local.set({ images });
      
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      chrome.tabs.sendMessage(tab.id, { 
        action: 'updateImage', 
        imageId: id, 
        property, 
        value: images[imageIndex][property] 
      });
    }
  }

  async function toggleImageVisibility(id) {
    const result = await chrome.storage.local.get(['images']);
    const images = result.images || [];
    const imageIndex = images.findIndex(img => img.id === id);
    
    if (imageIndex !== -1) {
      images[imageIndex].visible = !images[imageIndex].visible;
      await chrome.storage.local.set({ images });
      await loadImages();
      
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      chrome.tabs.sendMessage(tab.id, { action: 'updateImage', imageId: id, property: 'visible', value: images[imageIndex].visible });
    }
  }

  async function deleteImage(id) {
    const result = await chrome.storage.local.get(['images']);
    const images = result.images || [];
    const filtered = images.filter(img => img.id !== id);
    await chrome.storage.local.set({ images: filtered });
    await loadImages();
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { action: 'deleteImage', imageId: id });
  }
});

