// canvas related variables
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var cw, ch;
var canvasOffset = canvas.getBoundingClientRect();
var offsetX = canvasOffset.left;
var offsetY = canvasOffset.top;

// set some canvas styles
ctx.strokeStyle = 'black';

// an array to hold user's click-points that define the clipping area
var points = [];

// load the image 
var img = new Image();
img.crossOrigin = 'anonymous';
img.onload = start;
img.src = "wac.jpg";

function start() {
  // resize canvas to fit the img
  cw = canvas.width = img.width;
  ch = canvas.height = img.height;

  // draw the image at 25% opacity
  drawImage(0.25);

  // listen for mousedown and button clicks
  canvas.addEventListener('mousedown', handleMouseDown);
  document.getElementById('reset').addEventListener('click', function () {
    points.length = 0;
    drawImage(0.25);
  });
}

function handleMouseDown(e) {
  // tell the browser that we're handling this event
  e.preventDefault();
  e.stopPropagation();

  // calculate mouseX & mouseY
  var mx = parseInt(e.clientX - offsetX);
  var my = parseInt(e.clientY - offsetY);

  // push the clicked point to the points[] array
  points.push({ x: mx, y: my });

  // show the user an outline of their current clipping path
  outlineIt();

  // if the user clicked back in the original circle
  // then complete the clip
  if (points.length > 1) {
    var dx = mx - points[0].x;
    var dy = my - points[0].y;
    if (dx * dx + dy * dy < 10 * 10) {
      clipIt();
    }
  }
}

// redraw the image at the specified opacity
function drawImage(alpha) {
  ctx.clearRect(0, 0, cw, ch);
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, 0, 0);
  ctx.globalAlpha = 1.00;
}

// show the current potential clipping path
function outlineIt() {
  drawImage(0.25);
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (var i = 0; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(points[0].x, points[0].y, 10, 0, Math.PI * 2);
  ctx.closePath();
  ctx.stroke();
}

// clip the selected path to a new canvas
function clipIt() {
  // calculate the size of the user's clipping area
  var minX = 10000;
  var minY = 10000;
  var maxX = -10000;
  var maxY = -10000;
  for (var i = 1; i < points.length; i++) {
    var p = points[i];
    if (p.x < minX) { minX = p.x; }
    if (p.y < minY) { minY = p.y; }
    if (p.x > maxX) { maxX = p.x; }
    if (p.y > maxY) { maxY = p.y; }
  }
  var width = maxX - minX;
  var height = maxY - minY;

  // clip the image into the user's clipping area
  ctx.save();
  ctx.clearRect(0, 0, cw, ch);
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (var i = 1; i < points.length; i++) {
    var p = points[i];
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(img, 0, 0);
  ctx.restore();

  // create a new canvas 
  var c = document.createElement('canvas');
  var cx = c.getContext('2d');

  // resize the new canvas to the size of the clipping area
  c.width = width;
  c.height = height;

  // draw the clipped image from the main canvas to the new canvas
  cx.drawImage(canvas, minX, minY, width, height, 0, 0, width, height);

  // create a new Image() from the new canvas
  var clippedImage = new Image();
  clippedImage.onload = function () {
    // append the new image to the page
    document.body.appendChild(clippedImage);
  }
  clippedImage.src = c.toDataURL();

  // clear the previous points 
  points.length = 0;

  // redraw the image on the main canvas for further clipping
  drawImage(0.25);
}
