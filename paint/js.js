const canvas = new fabric.Canvas('myCanvas');

// Function to load an image onto the canvas
function loadImage(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const img = new Image();
        img.src = e.target.result;

        img.onload = function () {
            ctx.globalAlpha = 0.5; 
            const fabricImg = new fabric.Image(img, {
                left: 0,
                top: 0,
                selectable: false,
                opacity: 0.5 
               
            
            });
            canvas.add(fabricImg);
            // Set canvas dimensions to match image
            canvas.setWidth(img.width);
            canvas.setHeight(img.height);

        };
    };

    reader.readAsDataURL(file);
}

// Set up drawing properties (same as before)
canvas.isDrawingMode = true;
canvas.freeDrawingBrush.width = 5;

// Change drawing color based on user input (same as before)
function changeColor(newColor) {
    canvas.freeDrawingBrush.color = newColor;
}
function changeWidth(newWidth) {
    canvas.freeDrawingBrush.width = newWidth;
}


// Optional: Keep the image always on top (same as before)
canvas.setOverlayImage('path/to/overlay-image.png', canvas.renderAll.bind(canvas));

// Save the canvas as an image (same as before)
function saveCanvasAsImage() {
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'clipped_image.png';
    link.href = dataURL
    link.click();
    // Send dataURL to your server or use it as needed.
}

function saveCanvasAsImage2() {
    // Remove the image from the canvas
    canvas.forEachObject(function (object) {
        if (object.type === 'image') {
            canvas.remove(object);
        }
    });


    // Save the canvas as an image
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'clipped_image.png';
    link.href = dataURL;
    link.click();

    // Reload the original image onto the canvas
    const input = document.getElementById('imageInput');
    input.value = ''; // Clear the file input
}