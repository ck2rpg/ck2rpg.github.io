let zoomLevel = 30;
const maxZoom = 100;
const minZoom = 1;
const zoomStep = 1;
const zoomInterval = 100; // Adjust the interval as needed (milliseconds)

const zoomInButton = document.getElementById('zoom-in');
const zoomOutButton = document.getElementById('zoom-out');
const fullscreenButton = document.getElementById('fullscreen');

let zoomInInterval, zoomOutInterval;

function adjustZoomLevel() {
  if (zoomLevel < minZoom) {
    zoomLevel = minZoom;
  } else if (zoomLevel > maxZoom) {
    zoomLevel = maxZoom;
  }
  canvas.style.width = `${128 * zoomLevel}px`;
  canvas.style.height = `${128 * zoomLevel}px`;
}

function startZoomIn() {
  zoomInInterval = setInterval(() => {
    zoomLevel += zoomStep;
    adjustZoomLevel();
  }, zoomInterval);
}

function startZoomOut() {
  zoomOutInterval = setInterval(() => {
    zoomLevel -= zoomStep;
    adjustZoomLevel();
  }, zoomInterval);
}

function stopZoom() {
  clearInterval(zoomInInterval);
  clearInterval(zoomOutInterval);
}

// Single-click event listeners
zoomInButton.addEventListener('click', (event) => {
  event.preventDefault();
  zoomLevel += zoomStep;
  adjustZoomLevel();
});

zoomOutButton.addEventListener('click', (event) => {
  event.preventDefault();
  zoomLevel -= zoomStep;
  adjustZoomLevel();
});

// Mouse and touch events for continuous zooming
zoomInButton.addEventListener('mousedown', (event) => {
  event.preventDefault();
  startZoomIn();
});

zoomOutButton.addEventListener('mousedown', (event) => {
  event.preventDefault();
  startZoomOut();
});

document.addEventListener('mouseup', (event) => {
  stopZoom();
});

// Optional: Add touch event listeners for mobile devices
zoomInButton.addEventListener('touchstart', (event) => {
  event.preventDefault();
  startZoomIn();
});

zoomOutButton.addEventListener('touchstart', (event) => {
  event.preventDefault();
  startZoomOut();
});

document.addEventListener('touchend', (event) => {
  stopZoom();
});

fullscreenButton.addEventListener('click', (event) => {
  event.preventDefault();
  canvas.style.width = `85vw`;
  canvas.style.height = `100vh`;
});

// Initial adjustment
//adjustZoomLevel();
