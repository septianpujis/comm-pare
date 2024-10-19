let menuVisible = false;
let imageLock = false;
let images = []; // Store all images

function createMenu() {
  const menu = document.createElement("div");
  menu.id = "image-controller-menu";

  menu.innerHTML = `
  <style>
  ${style}
  </style>
  <button id="pasteButton">Paste</button>
  <div id="imageList"></div>
  
  <div class="control-container">
    <input type="range" id="opacitySlider" min="0" max="1" step="0.1" value="1" disabled>
    <input type="number" id="positionX" placeholder="X Position" disabled>
    <input type="number" id="positionY" placeholder="Y Position" disabled>
  </div>

  <button id="closeButton">x</button>
    `;

  document.body.appendChild(menu);

  // Load images from local storage
  loadImages();

  // Add event listeners
  document.getElementById("pasteButton").addEventListener("click", pasteImage);
  document.getElementById("closeButton").addEventListener("click", () => {
    menuVisible = !menuVisible;

    menu.classList.toggle("minimize", menuVisible);
  });
}

async function saveImages() {
  const db = await openDB();

  // Clear existing data
  const clearTransaction = db.transaction(["images"], "readwrite");
  await clearTransaction.objectStore("images").clear();

  for (let i = 0; i < images.length; i++) {
    const imgWrapper = images[i];
    const img = imgWrapper.querySelector("img");
    const response = await fetch(img.src);
    const blob = await response.blob();

    const transaction = db.transaction(["images"], "readwrite");
    const store = transaction.objectStore("images");

    await store.add({
      id: i,
      blob: blob,
      left: imgWrapper.style.left,
      top: imgWrapper.style.top,
      opacity: img.style.opacity,
    });

    await transaction.done;
  }
  await clearTransaction.done;
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("ImageDB", 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore("images", { keyPath: "id", autoIncrement: true });
    };
  });
}

async function pasteImage() {
  const items = await navigator.clipboard.read();
  for (const item of items) {
    for (const type of item.types) {
      if (type.startsWith("image/")) {
        const blob = await item.getType(type);
        const url = URL.createObjectURL(blob);

        // Create a wrapper div
        const imgWrapper = document.createElement("div");
        imgWrapper.classList.add("comm-pare-image-wrapper");
        imgWrapper.style.position = "absolute";
        imgWrapper.style.cursor = "move";
        imgWrapper.style.left = "0px";
        imgWrapper.style.top = "0px";
        imgWrapper.style.zIndex = "9999";
        imgWrapper.style.opacity = "1";

        const img = document.createElement("img");
        img.src = url;

        img.style.pointerEvents = "none"; // Prevent image from being selected
        img.style.userSelect = "none"; // Prevent image from being selected

        img.onload = () => {
          imgWrapper.style.width = `${img.naturalWidth}px`;
          imgWrapper.style.height = `${img.naturalHeight}px`;
        };

        imgWrapper.onclick = () => selectImage(imgWrapper);
        imgWrapper.appendChild(img);
        imgWrapper.setAttribute("custom-lock-center", "false");
        document.body.appendChild(imgWrapper);
        images.push(imgWrapper); // Store reference to the wrapper
        selectImage(imgWrapper);
        makeDraggable(imgWrapper); // Make the wrapper div draggable
        addImageToList(imgWrapper); // Add image to the list

        saveImages(); // Save after adding a new image
        break;
      } else {
        const customAlert = document.createElement("div");
        customAlert.classList.add("custom-alert");
        customAlert.id = "comm-pare-alert";
        customAlert.textContent = "Pasted item is not an image.";

        document.body.appendChild(customAlert);

        setTimeout(() => {
          document.body.removeChild(customAlert);
        }, 5000);
      }
    }
  }
}

async function loadImages() {
  const db = await openDB();
  const transaction = db.transaction("images");
  const store = transaction.objectStore("images");
  const request = await store.getAll();

  request.onsuccess = function (event) {
    const savedImages = event.target.result;

    if (Array.isArray(savedImages) && savedImages.length > 0) {
      for (const data of savedImages) {
        const imgWrapper = document.createElement("div");
        imgWrapper.classList.add("comm-pare-image-wrapper");
        imgWrapper.style.position = "absolute";
        imgWrapper.style.zIndex = "9999";
        imgWrapper.style.left = data.left;
        imgWrapper.style.top = data.top;
        imgWrapper.style.cursor = "move";
        imgWrapper.style.opacity = data.opacity;

        const img = document.createElement("img");
        img.src = URL.createObjectURL(data.blob);
        img.style.pointerEvents = "none";
        img.style.userSelect = "none";

        img.onload = () => {
          imgWrapper.style.width = `${img.naturalWidth}px`;
          imgWrapper.style.height = `${img.naturalHeight}px`;
        };

        imgWrapper.appendChild(img);
        imgWrapper.setAttribute("custom-lock-center", "false");
        imgWrapper.onclick = () => selectImage(imgWrapper);
        document.body.appendChild(imgWrapper);
        images.push(imgWrapper);

        makeDraggable(imgWrapper);
        addImageToList(imgWrapper);
      }
    } else {
      console.log("No saved images found or invalid data format");
    }
  };

  request.onerror = function (event) {
    console.error("Error loading images:", event.target.error);
  };

  await transaction.done;
}

function addImageToList(img) {
  const imageList = document.getElementById("imageList");
  const imgItem = document.createElement("div");
  imgItem.style.display = "flex";
  imgItem.style.alignItems = "center";
  imgItem.style.justifyContent = "flex-start";
  imgItem.style.cursor = "pointer";

  imgItem.onclick = (e) => {
    e.stopPropagation(); // Prevent triggering the selectImage function
    selectImage(img);
  };

  const itemText = document.createElement("p");
  itemText.textContent = `Image ${images.length}`;
  itemText.style.marginRight = "auto";

  const removeButton = document.createElement("button");
  removeButton.textContent = "x";
  removeButton.onclick = (e) => {
    e.stopPropagation(); // Prevent triggering the selectImage function
    removeImage(img, imgItem);
  };

  const lockButton = document.createElement("button");
  lockButton.textContent = "c";
  lockButton.onclick = (e) => {
    e.stopPropagation(); // Prevent triggering the selectImage function
    toggleLock(img);
  };

  const viewButton = document.createElement("button");
  viewButton.textContent = "v";
  viewButton.onclick = (e) => {
    e.stopPropagation(); // Prevent triggering the selectImage function
    toggleView(img);
  };

  const lockCenterButton = document.createElement("button");
  lockCenterButton.textContent = "CC";
  lockCenterButton.onclick = (e) => {
    e.stopPropagation(); // Prevent triggering the selectImage function
    toggleCenter(img);
  };

  imgItem.appendChild(itemText);
  imgItem.appendChild(lockButton);
  imgItem.appendChild(lockCenterButton);
  imgItem.appendChild(viewButton);
  imgItem.appendChild(removeButton);
  imageList.appendChild(imgItem);
}

function toggleLock(img) {
  const imageWrappers = img;
  imageWrappers.style.pointerEvents =
    imageWrappers.style.pointerEvents === "none" ? "auto" : "none";
}

function toggleView(img) {
  const imageWrappers = img;
  imageWrappers.style.display =
    imageWrappers.style.display === "none" ? "block" : "none";
}

function toggleCenter(img) {
  const imageWrappers = img;
  imageWrappers.style.left = "50%";
  imageWrappers.style.transform =
    imageWrappers.style.transform === "translateX(-50%)"
      ? ""
      : "translateX(-50%)";
  imageWrappers.setAttribute(
    "custom-lock-center",
    imageWrappers.getAttribute("custom-lock-center") === "true"
      ? "false"
      : "true"
  );
}

function selectImage(selectedImg) {
  window.currentImage = selectedImg; // Set the current image
  const opacitySlider = document.getElementById("opacitySlider");
  const positionX = document.getElementById("positionX");
  const positionY = document.getElementById("positionY");

  opacitySlider.disabled = false;
  positionX.disabled = false;
  positionY.disabled = false;

  opacitySlider.value = selectedImg.style.opacity;
  positionX.value = parseInt(selectedImg.style.left, 10) || 0;
  positionY.value = parseInt(selectedImg.style.top, 10) || 0;

  opacitySlider.oninput = (e) => {
    selectedImg.style.opacity = e.target.value;
    saveImages();
  };

  positionX.oninput = (e) => {
    selectedImg.style.left = `${e.target.value}px`;
    saveImages();
  };

  positionY.oninput = (e) => {
    selectedImg.style.top = `${e.target.value}px`;
    saveImages();
  };
}

function makeDraggable(img) {
  let offsetX, offsetY;

  img.addEventListener("mousedown", (e) => {
    offsetX = e.clientX - img.getBoundingClientRect().left;
    offsetY = e.clientY - img.getBoundingClientRect().top;

    const onMouseMove = (e) => {
      if (img.getAttribute("custom-lock-center") == "false") {
        img.style.left = `${e.clientX - offsetX + window.scrollX}px`;
      }
      img.style.top = `${e.clientY - offsetY + window.scrollY}px`;

      // Update the position inputs
      if (window.currentImage === img) {
        document.getElementById("positionX").value = parseInt(
          img.style.left,
          10
        );
        document.getElementById("positionY").value = parseInt(
          img.style.top,
          10
        );
      }
    };

    const onMouseUp = () => {
      saveImages();
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

  img.style.cursor = "move"; // Change cursor to indicate dragging
}

function removeImage(imgWrapper, imgItem) {
  imgWrapper.remove();
  images = images.filter((image) => image !== imgWrapper);
  imgItem.remove();
  saveImages();
}

const style = `
    #image-controller-menu {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 15px;
    background-color: #f5f5f5;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    width: 360px;

    position: fixed;
    top: 10px;
    right: 10px;
    background-color: rgba(255, 255, 255, 0.8);
    border: 1px solid #ccc;
    padding: 10px;
    z-index: 9999999;
    opacity: 1;
    transition: all 0.3s ease;
    }

    #image-controller-menu.minimize {
    right: -360px;
    opacity: 0.2;
    }

    #image-controller-menu .control-container {
    display: flex;
    flex-direction: row;
    flex-wrap : wrap;
    gap: 10px;
    }

    #image-controller-menu input[type="number"] {
      width: calc(50% - 5px);
    }
    #image-controller-menu input[type="text"],
    #image-controller-menu input[type="range"] {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    transition: border-color 0.3s ease;
    }

    #image-controller-menu input[type="text"]:focus,
    #image-controller-menu input[type="range"]:focus {
    outline: none;
    border-color: #007bff;
    }

    #image-controller-menu input[type="range"] {
    -webkit-appearance: none;
    height: 8px;
    background: #ddd;
    border-radius: 4px;
    }

    #image-controller-menu input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    background: #007bff;
    border-radius: 50%;
    cursor: pointer;
    }

    #image-controller-menu button {
    padding: 10px 15px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    }

    #image-controller-menu button.toggle-active {
    background-color: #0056b3;
    
    }

    #image-controller-menu button#closeButton {
    position: absolute;
    top: calc(50% - 15px);
    left: -30px;
    width: 30px;
    height: 30px;
    padding: 0;
    }

    #image-controller-menu button:hover {
    background-color: #0056b3;
    }

    #image-controller-menu button:active {
    background-color: #004085;
    }

    #image-controller-menu #imageList {
    padding: 10px;
    background-color: #f8f9fa;
    border: 1px solid #ddd;
    border-radius: 4px;
    max-height: 200px;
    overflow-y: auto;
    }

    #image-controller-menu #imageList div {
    padding: 5px 0;
    border-bottom: 1px solid #eee;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    display: flex;
    justify-content: space-between;
    align-items: center;
    }

    #image-controller-menu #imageList div:last-child {
    border-bottom: none;
    }

    #image-controller-menu #imageList div:hover {
    background-color: #e9ecef;
    }

    #comm-pare-alert.custom-alert {
        position: fixed;
        top: 20px;
        right: 10px;
        width: 360px;
        text-align: center;
        padding: 10px 20px;
        background-color: red;
        color: white;
        border-radius: 5px;
        z-index: 9999999;
}
    }

  `;
