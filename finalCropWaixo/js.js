// Canvas variables
const mainCanvas = document.getElementById("mainCanvas");
const ctx = mainCanvas.getContext("2d");
let canvasWidth, canvasHeight;
const canvasOffset = mainCanvas.getBoundingClientRect();
const offsetX = canvasOffset.left;
const offsetY = canvasOffset.top;
var container = document.getElementById('container');



const canvas2 = new fabric.Canvas('canvas2', {
    isDrawingMode: true, // Enable drawing mode
    Selection: false
});
let lineCount = 0
let drawnPaths = [];
let fabricImage;

// Set canvas styles
ctx.strokeStyle = 'black';

// Array to hold user's click-points defining the clipping area
const points = [];

// Load the image 
const img = new Image();
img.crossOrigin = 'anonymous';

function calculatesScale(img) {
    const maxWidth = 800; // Maximum width
    const maxHeight = 600; // Maximum height
    let scaleWidth = 1;
    let scaleHeight = 1;

    if (img.width > maxWidth) {
        scaleWidth = maxWidth / img.width;
    }

    if (img.height > maxHeight) {
        scaleHeight = maxHeight / img.height;
    }

    const scale = Math.min(scaleWidth, scaleHeight); // Choose the minimum scale to fit both width and height
    const canvasWidthNew = img.width * scale;
    const canvasHeightNew = img.height * scale;

    return { canvasWidthNew, canvasHeightNew }
}

document.getElementById('upload').addEventListener('change', function (e) {
    lineCount = 0
    drawnPaths = [];
    fabricImage ="";
    points.length = 0;

    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
        img.src = event.target.result;
        img.onload = initialize;

    };
    reader.readAsDataURL(file);
});

function initialize() {
    const { canvasWidthNew, canvasHeightNew } = calculatesScale(img)
    // Set canvas width and height based on the image and maximum dimensions
    canvasWidth = mainCanvas.width = canvasWidthNew;
    canvasHeight = mainCanvas.height = canvasHeightNew;

    // Draw the image with 25% opacity
    // drawImage(0.25);
    drawImage(img, 0, 0, canvasWidthNew, canvasHeightNew);

    // Listen for mouse clicks and button clicks
    mainCanvas.addEventListener('mousedown', handleMouseDown);
    mainCanvas.addEventListener('mouseup', handleMouseUp);
    document.getElementById('reset').addEventListener('click', resetClipping);

}

function handleMouseDown(e) {
    // Prevent default behavior
    e.preventDefault();
    e.stopPropagation();
    // Start registering points only if mouse button is pressed down
    mainCanvas.addEventListener('mousemove', registerPoints);
}

function handleMouseUp(e) {
    // Prevent default behavior
    e.preventDefault();
    e.stopPropagation();

    // Stop registering points when mouse button is released
    mainCanvas.removeEventListener('mousemove', registerPoints);

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
    ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
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
    //ctx.closePath();
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
    drawImage(img, 0, 0);
    ctx.restore();


    const newCanvas = document.createElement('canvas');
    const newCtx = newCanvas.getContext('2d');

    // Resize the new canvas to the size of the clipping area
    newCanvas.width = width;
    newCanvas.height = height;

    // Draw the clipped image from the main canvas to the new canvas
    newCtx.drawImage(mainCanvas, minX, minY, width, height, 0, 0, width, height);

    const imageDataURL = newCanvas.toDataURL('image/png');
    canvas2.freeDrawingBrush.color = 'red'; // Set brush color
    canvas2.freeDrawingBrush.width = 1; // Set brush width
    // Create a Fabric.js image object using the data URL
    fabric.Image.fromURL(imageDataURL, function (img) {
        img.scale(1)
        img.set({
            left: 25,
            top: 25
        });
        canvas2.add(img);
        canvas2.setDimensions({
            width: width + 50,
            height: height + 50
        });
        fabricImage = img;
    });
}




// Function to clip the image based on the drawn path
let line = null;

// Event handler when drawing is completed
canvas2.on('path:created', function (e) {
    clipImage2(e.path);
    // Set canvas styles
    canvas2.freeDrawingBrush.color = 'blue'; // Set brush color
    
});

// Function to clip the image based on the drawn line
function clipImage2(path) {

    if (drawnPaths.length > 0) {

        canvas2.remove(drawnPaths[0]);
        const cropedImageFinal = cropImageFinal(true)

        document.body.appendChild(cropedImageFinal);
        canvas2.add(drawnPaths[0]);


        const cropedImageFinal2 = cropImageFinal(true)

        // Append the new image below the canvas
        document.body.appendChild(cropedImageFinal2);



        const cropedImageFinal3 = cropImageFinal(false)

        // Append the new image below the canvas
        document.body.appendChild(cropedImageFinal3);



    } else {
        const cropedImageFinal = cropImageFinal(true)

        // Append the new image below the canvas
        document.body.appendChild(cropedImageFinal);
    }
    function cropImageFinal(lines) {
        // Create a new Fabric.js canvas
        const croppedCanvas = new fabric.Canvas('croppedCanvas');

        // Set the dimensions of the cropped canvas
        const croppedWidth = canvas2.width - 50; // Crop 50 pixels from both left and right sides
        const croppedHeight = canvas2.height - 50; // Crop 50 pixels from both top and bottom sides
        croppedCanvas.setDimensions({
            width: croppedWidth,
            height: croppedHeight
        });

        // Clone the original canvas objects to the cropped canvas with an offset
        canvas2.forEachObject(function (obj) {
            const clonedObj = fabric.util.object.clone(obj);
            clonedObj.set({
                left: obj.left - 25,
                top: obj.top - 25
            });
            croppedCanvas.add(clonedObj);
        });
        if (lines) {
            croppedCanvas.forEachObject(function (object) {
                // Check if the object is an image
                if (object.type === 'image') {
                    // Remove the image object from the canvas
                    croppedCanvas.remove(object);
                }
            });
        } else {
            croppedCanvas.forEachObject(function (object) {
                // Check if the object is an image
                if (object.type !== 'image') {
                    // Remove the image object from the canvas
                    croppedCanvas.remove(object);
                }
            });
        }

        // Convert the cropped canvas to a data URL
        const croppedDataURL = croppedCanvas.toDataURL({
            format: 'png'
        });

        // Create a new image element
        const newImage2 = new Image();

        // Set the source of the image to the data URL representing the canvas content
        newImage2.src = croppedDataURL;
        return newImage2
    }

    var newPath = new fabric.Path(path.path, {
        fill: 'transparent',
        stroke: path.color, // Set the color of the path
        strokeWidth: 0.5 ,
             
    });
    // Add the path to the canvas
    canvas2.add(newPath);
    drawnPaths.push(path);
}

// Function to handle the download action
function downloadAllImages() {
    // Get all image elements
    const images = document.querySelectorAll('img');

    // Iterate through each image
    images.forEach(function (image, index) {
        // Create a temporary anchor element
        const link = document.createElement('a');

        // Set the href attribute to the image source
        link.href = image.src;

        // Set the download attribute to specify the filename
        link.download = 'image_' + index + '.png';

        // Programmatically trigger the click event to start the download
        link.click();

        // Remove the anchor element to clean up
        link.remove();
    });
}

// Get the download button element
const downloadButton = document.getElementById('downloadButton');

// Add event listener to the download button
downloadButton.addEventListener('click', downloadAllImages);