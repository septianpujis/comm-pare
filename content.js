let menuVisible = false;
let imageLock = false;
let images = []; // Store all images
let selectedId = null;

function createMenu() {
  const menu = document.createElement("div");
  menu.id = "comm-pare-popup-menu";

  menu.innerHTML = `
    <style>
      ${style}
    </style>
    <button comm-pare-custom-id="pasteButton">Paste</button>
    <div comm-pare-custom-id="imageList"></div>

    <div class="control-container">
      <input
        type="range"
        id="opacitySlider"
        min="0"
        max="1"
        step="0.01"
        value="1"
      />
      <input type="number" id="positionX" placeholder="X Position" />
      <input type="number" id="positionY" placeholder="Y Position" />
      <div class="control-button-container">
        <button comm-pare-custom-id="lockButton">
          <svg
          class="lock-icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            class="bi bi-lock"
            viewBox="0 0 16 16"
          >
            <path
              d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2m3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2M5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1"
            />
          </svg>
          <svg
          class="unlock-icon"
            style="display: none"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            class="bi bi-unlock"
            viewBox="0 0 16 16"
          >
            <path
              d="M11 1a2 2 0 0 0-2 2v4a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h5V3a3 3 0 0 1 6 0v4a.5.5 0 0 1-1 0V3a2 2 0 0 0-2-2M3 8a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1z"
            />
          </svg>
          <p>Lock</p>
        </button>
        <button comm-pare-custom-id="viewButton">
          <svg
          class="view-icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            class="bi bi-eye"
            viewBox="0 0 16 16"
          >
            <path
              d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"
            />
            <path
              d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"
            />
          </svg>
          <svg
          class="hide-icon"
            xmlns="http://www.w3.org/2000/svg"
            style="display: none"
            fill="currentColor"
            class="bi bi-eye-slash"
            viewBox="0 0 16 16"
          >
            <path
              d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z"
            />
            <path
              d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829"
            />
            <path
              d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z"
            />
          </svg>
          <p>View</p>
        </button>
        <button comm-pare-custom-id="lockCenterButton">
          <svg
          class="center-icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            class="bi bi-align-center"
            viewBox="0 0 16 16"
          >
            <path
              d="M8 1a.5.5 0 0 1 .5.5V6h-1V1.5A.5.5 0 0 1 8 1m0 14a.5.5 0 0 1-.5-.5V10h1v4.5a.5.5 0 0 1-.5.5M2 7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z"
            />
          </svg>
          <svg
          class="free-icon"
            style="display: none"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            class="bi bi-distribute-horizontal"
            viewBox="0 0 16 16"
          >
            <path
              fill-rule="evenodd"
              d="M14.5 1a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 1 0v-13a.5.5 0 0 0-.5-.5m-13 0a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 1 0v-13a.5.5 0 0 0-.5-.5"
            />
            <path
              d="M6 13a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"
            />
          </svg>
          <p>Center</p>
        </button>
        <button comm-pare-custom-id="removeButton">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            class="bi bi-trash"
            viewBox="0 0 16 16"
          >
            <path
              d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"
            />
            <path
              d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"
            />
          </svg>
          <p>Delete</p>
        </button>
      </div>
    </div>

    <button comm-pare-custom-id="closeButton">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        class="bi bi-chevron-right"
        viewBox="0 0 16 16"
      >
        <path
          fill-rule="evenodd"
          d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"
        />
      </svg>
    </button>

    `;

  document.body.appendChild(menu);

  // Load images from local storage
  loadImages();

  // Add event listeners
  document
    .querySelector("[comm-pare-custom-id='pasteButton']")
    .addEventListener("click", () => pasteImage());

  document
    .querySelector("[comm-pare-custom-id='closeButton']")
    .addEventListener("click", () => {
      menuVisible = !menuVisible;
      menu.classList.toggle("minimize", menuVisible);
    });

  document
    .querySelector("[comm-pare-custom-id='removeButton']")
    .addEventListener("click", () => removeImage(selectedId));

  document
    .querySelector("[comm-pare-custom-id='lockButton']")
    .addEventListener("click", () => toggleLock(selectedId));

  document
    .querySelector("[comm-pare-custom-id='viewButton']")
    .addEventListener("click", () => toggleView(selectedId));

  document
    .querySelector("[comm-pare-custom-id='lockCenterButton']")
    .addEventListener("click", () => toggleCenter(selectedId));
}

async function saveImages() {
  const db = await openDB();

  // Clear existing data
  const clearTransaction = db.transaction(["images"], "readwrite");
  await clearTransaction.objectStore("images").clear();

  for (let i = 0; i < images.length; i++) {
    const imgWrapper = images[i];
    const customId = imgWrapper.getAttribute("custom-id");
    const img = imgWrapper.querySelector("img");
    const response = await fetch(img.src);
    const blob = await response.blob();

    const transaction = db.transaction(["images"], "readwrite");
    const store = transaction.objectStore("images");

    await store.add({
      id: i,
      customId: customId,
      blob: blob,
      left: imgWrapper.style.left,
      top: imgWrapper.style.top,
      opacity: imgWrapper.style.opacity,
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
        imgWrapper.setAttribute("custom-id", Date.now());
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
        imgWrapper.setAttribute("custom-id", data.customId);

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
  const imageList = document.querySelector("[comm-pare-custom-id='imageList']");
  const imgItem = document.createElement("div");
  imgItem.setAttribute("custom-id", img.getAttribute("custom-id"));
  imgItem.classList.add("comm-pare-image-list-item");

  imgItem.onclick = (e) => {
    e.stopPropagation(); // Prevent triggering the selectImage function
    selectImage(img);
  };

  const itemText = document.createElement("p");
  itemText.textContent = img.getAttribute("custom-id");
  itemText.style.marginRight = "auto";

  imgItem.appendChild(itemText);
  imageList.appendChild(imgItem);
  selectImage(img);
}

function toggleLock(id) {
  const imageWrappers = document.querySelector(
    `.comm-pare-image-wrapper[custom-id='${id}']`
  );
  imageWrappers.style.pointerEvents =
    imageWrappers.style.pointerEvents === "none" ? "auto" : "none";
}

function toggleView(id) {
  const imageWrappers = document.querySelector(
    `.comm-pare-image-wrapper[custom-id='${id}']`
  );
  imageWrappers.style.display =
    imageWrappers.style.display === "none" ? "block" : "none";
}

function toggleCenter(id) {
  const imageWrappers = document.querySelector(
    `.comm-pare-image-wrapper[custom-id='${id}']`
  );
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

function removeImage(id) {
  const imgWrapper = document.querySelector(
    `.comm-pare-image-wrapper[custom-id='${id}']`
  );
  images = images.filter((image) => image !== imgWrapper);
  imgWrapper.remove();
  document
    .querySelector(`.comm-pare-image-list-item[comm-pare-custom-id='${id}']`)
    .remove();
  saveImages();
}

function selectImage(selectedImg) {
  // Set the current image
  window.currentImage = selectedImg;
  selectedId = selectedImg.getAttribute("custom-id");

  const displayList = document.getElementsByClassName(
    "comm-pare-image-list-item"
  );
  if (displayList.length > 0) {
    Array.from(displayList).forEach((node) => {
      node.classList.remove("comm-pare-image-list-item-selected");
      if (node.getAttribute("custom-id") == selectedId) {
        node.classList.add("comm-pare-image-list-item-selected");
      }
    });
  }

  const opacitySlider = document.getElementById("opacitySlider");
  const positionX = document.getElementById("positionX");
  const positionY = document.getElementById("positionY");

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

const style = `
#comm-pare-popup-menu {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 360px;

  position: fixed;
  z-index: 9999999;
  top: 10px;
  right: 10px;
  background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid #ccc;
  opacity: 1;
  transition: all 0.3s ease;
}

#comm-pare-popup-menu.minimize {
  right: -360px;
  opacity: 0.2;
}

#comm-pare-popup-menu .control-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
}

#comm-pare-popup-menu input[type="number"] {
  width: calc(50% - 5px);
}
#comm-pare-popup-menu input[type="range"] {
  width: 100%;
  padding: 8px 0px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

#comm-pare-popup-menu .control-button-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
}
#comm-pare-popup-menu .control-button-container button {
  flex-grow: 1;
  flex-shrink: 0;
}
#comm-pare-popup-menu .control-button-container svg {
  width: 24px;
  height: 24px;
}

#comm-pare-popup-menu input[type="text"]:focus,
#comm-pare-popup-menu input[type="range"]:focus {
  outline: none;
  border-color: #007bff;
}

#comm-pare-popup-menu input[type="range"] {
  -webkit-appearance: none;
  height: 16px;
  background: #a2cfff;
  border-radius: 4px;
  padding: 0;
}

#comm-pare-popup-menu input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 24px;
  height: 24px;
  background: #007bff;
  border-radius: 50%;
  cursor: pointer;
}

#comm-pare-popup-menu button {
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

#comm-pare-popup-menu button.toggle-active {
  background-color: #0056b3;
}

#comm-pare-popup-menu [comm-pare-custom-id="closeButton"] {
  position: absolute;
  top: 0;
  left: -48px;
  width: 48px;
  height: 48px;
  padding: 8px;
}
#comm-pare-popup-menu [comm-pare-custom-id="closeButton"] svg {
  transition: transform 0.3s ease;
}
#comm-pare-popup-menu.minimize [comm-pare-custom-id="closeButton"] svg {
  transform: rotate(180deg);
}

#comm-pare-popup-menu button:hover {
  background-color: #0056b3;
}

#comm-pare-popup-menu button:active {
  background-color: #004085;
}

#comm-pare-popup-menu [comm-pare-custom-id="imageList"] {
  padding: 10px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  max-height: 400px;
  overflow-y: auto;
}

#comm-pare-popup-menu
  [comm-pare-custom-id="imageList"]
  .comm-pare-image-list-item {
  padding: 12px 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

#comm-pare-popup-menu
  [comm-pare-custom-id="imageList"]
  .comm-pare-image-list-item:hover {
  background-color: #e9ecef;
}

#comm-pare-popup-menu
  [comm-pare-custom-id="imageList"]
  .comm-pare-image-list-item-selected {
  background-color: #a2cfff;
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
`;
