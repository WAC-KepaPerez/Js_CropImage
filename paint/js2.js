const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
const imageUpload = document.getElementById("imageUpload");

let painting = false;

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