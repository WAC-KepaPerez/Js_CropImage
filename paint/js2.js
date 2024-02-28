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

    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            const scaleFactor = 0.8; // 80% of the window width
            const aspectRatio = img.width / img.height;
            canvas.width = window.innerWidth * scaleFactor;
            canvas.height = canvas.width / aspectRatio;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = event.target.result;
    };

    reader.readAsDataURL(file);
});