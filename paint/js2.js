const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
const imageUpload = document.getElementById("imageUpload");
let imgUnpload=""

let painting = false;
let points = []

const startPosition = (e) => {
    painting = true;
    draw(e);
};

const stopPosition = () => {
    painting = false;
    ctx.beginPath();
};

const draw = (e) => {
    if (!painting) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    ctx.lineWidth = 5;
    ctx.lineCap = 'round';

    ctx.lineTo(mouseX, mouseY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(mouseX, mouseY);
    points.push({ x: mouseX, y: mouseY });
};

canvas.addEventListener("mousedown", startPosition);
canvas.addEventListener("mouseup", stopPosition);
canvas.addEventListener("mousemove", draw);

// Handle image upload
imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
            const scaleFactor = 0.8; // 80% of the window height
            const aspectRatio = img.width / img.height;
            canvas.height = window.innerHeight * scaleFactor;
            canvas.width = canvas.height * aspectRatio;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            imgUnpload=img
        };
        img.src = event.target.result;
    };

    reader.readAsDataURL(file);
});


function saveCanvasAsImage2() {
    // Save the current content of the canvas
    const drawingDataURL = canvas.toDataURL();

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw only the painted content
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';

    // Draw the painted lines
    const dataURL = canvas.toDataURL();

    // Restore the original content of the canvas
    const drawingImage = new Image();
    drawingImage.onload = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(drawingImage, 0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
    };
    drawingImage.src = drawingDataURL;

    // Trigger the download
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


document.getElementById('cropButton').addEventListener('click', cropAndDisplayImage);
function getDrawingBoundingBox() {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    // Iterate through all the drawn points to find the bounding box
    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
    }

    // Return the bounding box dimensions
    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
    };
}
function cropAndDisplayImage() {
    // Get the bounding box of the drawn content
    
    const boundingBox = getDrawingBoundingBox();
    
    // Create a new canvas with the dimensions of the bounding box
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = boundingBox.width;
    croppedCanvas.height = boundingBox.height;
    const croppedCtx = croppedCanvas.getContext('2d');

    // Begin the path for clipping using the drawn points
    croppedCtx.beginPath();
    croppedCtx.moveTo(points[0].x - boundingBox.x, points[0].y - boundingBox.y);
    for (let i = 1; i < points.length; i++) {
        croppedCtx.lineTo(points[i].x - boundingBox.x, points[i].y - boundingBox.y);
    }
    croppedCtx.closePath();
    croppedCtx.clip();


    croppedCtx.drawImage(canvas, boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height, 0, 0, boundingBox.width, boundingBox.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Append the new canvas to the document body
    document.body.appendChild(croppedCanvas);
}