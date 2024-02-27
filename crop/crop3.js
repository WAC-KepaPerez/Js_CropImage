// Canvas variables
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let canvasWidth, canvasHeight;
const canvasOffset = canvas.getBoundingClientRect();
const offsetX = canvasOffset.left;
const offsetY = canvasOffset.top;

// Set canvas styles
ctx.strokeStyle = 'black';

// Array to hold user's click-points defining the clipping area
const points = [];

// Load the image 
const img = new Image();
img.crossOrigin = 'anonymous';

document.getElementById('upload').addEventListener('change', function (e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
        img.onload = initialize;
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

function initialize() {
    // Resize canvas to fit the image
    canvasWidth = canvas.width = img.width;
    canvasHeight = canvas.height = img.height;

    // Draw the image with 25% opacity
    drawImage(0.25);

    // Listen for mouse clicks and button clicks
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    document.getElementById('reset').addEventListener('click', resetClipping);
    document.getElementById('download').addEventListener('click', downloadImage);
}

function handleMouseDown(e) {
    // Prevent default behavior
    e.preventDefault();
    e.stopPropagation();

    // Start registering points only if mouse button is pressed down
    canvas.addEventListener('mousemove', registerPoints);
}

function handleMouseUp(e) {
    // Prevent default behavior
    e.preventDefault();
    e.stopPropagation();

    // Stop registering points when mouse button is released
    canvas.removeEventListener('mousemove', registerPoints);

    // Perform the clipping action
    clipImage();
}

function registerPoints(e) {
    // Calculate mouseX & mouseY
    const mouseX = parseInt(e.clientX - offsetX);
    const mouseY = parseInt(e.clientY - offsetY);

    // Push the current point to the points[] array
    points.push({ x: mouseX, y: mouseY });

    // Show an outline of the current clipping path
    outlineClippingPath();
}

// Redraw the image with the specified opacity
function drawImage(alpha) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, 0, 0);
    ctx.globalAlpha = 1.00;
}

// Show the current potential clipping path
function outlineClippingPath() {
  drawImage(0.25);
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  ctx.stroke();
}

// Clip the selected path to a new canvas
function clipImage() {
    // Calculate the size of the user's clipping area
    let minX = 10000;
    let minY = 10000;
    let maxX = -10000;
    let maxY = -10000;
    for (let i = 1; i < points.length; i++) {
        const p = points[i];
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
    }
    const width = maxX - minX;
    const height = maxY - minY;

    // Clip the image into the user's clipping area
    ctx.save();
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        const p = points[i];
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, 0, 0);
    ctx.restore();

    // Create a new canvas 
    const newCanvas = document.createElement('canvas');
    const newCtx = newCanvas.getContext('2d');

    // Resize the new canvas to the size of the clipping area
    newCanvas.width = width;
    newCanvas.height = height;

    // Draw the clipped image from the main canvas to the new canvas
    newCtx.drawImage(canvas, minX, minY, width, height, 0, 0, width, height);

    // Create a new Image() from the new canvas
    const clippedImage = new Image();
    clippedImage.onload = function () {
        // Append the new image to the page
        document.body.appendChild(clippedImage);
    }
    clippedImage.src = newCanvas.toDataURL();

    // Assign the canvas as a global variable to be used for downloading
    clippedCanvas = newCanvas;

    // Clear the points array 
    points.length = 0;

    // Redraw the image on the main canvas for further clipping
    drawImage(0.25);
}

// Reset clipping by clearing the points array and redrawing the image
function resetClipping() {
    points.length = 0;
    drawImage(0.25);
}

// Function to download the clipped image
function downloadImage() {
    if (clippedCanvas) {
        const link = document.createElement('a');
        link.download = 'clipped_image.png';
        link.href = clippedCanvas.toDataURL();
        link.click();
    } else {
        alert('No clipped image available to download.');
    }
}
