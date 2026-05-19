const shapeTypes = ["circle", "triangle", "square"];
let i = 0;

const addShapeBtn = document.getElementById("addShape");
const spawnContainer = document.getElementById("spawn-container");

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

addShapeBtn.addEventListener("click", () => {
    const shape = document.createElement("div");
    shape.classList.add("shape", shapeTypes[i % shapeTypes.length]);
    i++;

    spawnContainer.appendChild(shape);

    const rect = shape.getBoundingClientRect();
    const containerRect = spawnContainer.getBoundingClientRect();

    const maxX = containerRect.width - rect.width;
    const maxY = containerRect.height - rect.height;

    const x = randomInt(0, maxX);
    const y = randomInt(0, maxY);

    shape.style.transform = `translate(${x}px, ${y}px)`;
});
