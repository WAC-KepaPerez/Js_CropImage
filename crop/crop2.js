// Canvas variables
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let canvasWidth, canvasHeight;
const canvasOffset = canvas.getBoundingClientRect();
const offsetX = canvasOffset.left;
const offsetY = canvasOffset.top;


document.getElementById('upload').addEventListener('change', function (e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
        img = new Image();
        img.onload = initialize;
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

// Set canvas styles
ctx.strokeStyle = 'black';

// Array to hold user's click-points defining the clipping area
const points = [];

function initialize() {
  // Resize canvas to fit the image
  canvasWidth = canvas.width = img.width;
  canvasHeight = canvas.height = img.height;

  // Draw the image with 25% opacity
  drawImage(0.25);
  // Listen for mouse clicks and button clicks
  document.getElementById('download').addEventListener('click', downloadImage);
  canvas.addEventListener('mousedown', handleMouseDown);
  document.getElementById('reset').addEventListener('click', resetClipping);
}

function handleMouseDown(e) {
  // Prevent default behavior
  e.preventDefault();
  e.stopPropagation();

  // Calculate mouseX & mouseY
  const mouseX = parseInt(e.clientX - offsetX);
  const mouseY = parseInt(e.clientY - offsetY);

  // Push the clicked point to the points[] array
  points.push({ x: mouseX, y: mouseY });

  // Show an outline of the current clipping path
  outlineClippingPath();

  // Complete the clip if the user clicked back in the original circle
  if (points.length > 1) {
    const dx = mouseX - points[0].x;
    const dy = mouseY - points[0].y;
    if (dx * dx + dy * dy < 10 * 10) {
      clipImage();
    }
  }
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
  for (let i = 0; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(points[0].x, points[0].y, 10, 0, Math.PI * 2);
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

  // Clear the previous points 
  points.length = 0;
  clippedCanvas = newCanvas;
  // Redraw the image on the main canvas for further clipping
  drawImage(0.25);
}

// Reset clipping by clearing the points array and redrawing the image
function resetClipping() {
    console.log("hello")
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

const canvas2 = document.getElementById('canvas2');
const ctx2 = canvas2.getContext("2d");

canvas2.addEventListener('mousedown', function(e) {
    canvas.addEventListener('mousemove', paint);
    paint(e);
  });

canvas2.addEventListener('mouseup', function() {
    canvas.removeEventListener('mousemove', paint);
  });
function paint(e) {
    const x = e.offsetX;
    const y = e.offsetY;
    ctx2.fillStyle = 'red'; // Change color as needed
    ctx2.fillRect(x, y, 5, 5); // Adjust size as needed
  }
