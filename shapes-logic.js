// ===============================
// CONFIG
// ===============================
const shapeTypes = ["circle", "triangle", "square"];
let i = 0;
let iShapesTOT = 0;

const addShapeBtn = document.getElementById("addShape");
const spawnContainer = document.getElementById("spawn-container");
let shapes = document.querySelectorAll(".shape");


// ===============================
// UTILS
// ===============================
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}


// ===============================
// SPAWN SHAPE
// ===============================
addShapeBtn.addEventListener("click", () => {
    const shape = document.createElement("div");
    shape.classList.add("shape", shapeTypes[i % shapeTypes.length]);
    i++;
    iShapesTOT++;

    spawnContainer.appendChild(shape);

    const rect = shape.getBoundingClientRect();
    const containerRect = spawnContainer.getBoundingClientRect();

    const maxX = containerRect.width - rect.width;
    const maxY = containerRect.height - rect.height;

    const x = randomInt(0, maxX);
    const y = randomInt(0, maxY);

    shape.id = String(iShapesTOT);

    shape.dataset.x = x;
    shape.dataset.y = y;

    shape.dataset.vx = 0;
    shape.dataset.vy = 0;

    shape.style.left = x + "px";
    shape.style.top = y + "px";

    shapes = document.querySelectorAll(".shape");
});


// ===============================
// DRAG + INERZIA
// ===============================
let grabbed = null;
let lastMouseX = 0;
let lastMouseY = 0;

spawnContainer.addEventListener("mousedown", (e) => {
    if (!e.target.classList.contains("shape")) return;

    grabbed = e.target;

    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

document.addEventListener("mousemove", (e) => {
    if (!grabbed) return;

    const rect = spawnContainer.getBoundingClientRect();

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let x = mouseX - grabbed.offsetWidth / 2;
    let y = mouseY - grabbed.offsetHeight / 2;

    const maxX = rect.width - grabbed.offsetWidth;
    const maxY = rect.height - grabbed.offsetHeight;

    x = Math.max(0, Math.min(maxX, x));
    y = Math.max(0, Math.min(maxY, y));

    grabbed.dataset.x = x;
    grabbed.dataset.y = y;

    grabbed.style.left = x + "px";
    grabbed.style.top = y + "px";

    grabbed.dataset.vx = e.clientX - lastMouseX;
    grabbed.dataset.vy = e.clientY - lastMouseY;

    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

document.addEventListener("mouseup", () => {
    grabbed = null;
});

// ===============================
// RIMOZIONE SHAPE CON TASTO DESTRO
// ===============================

function explode(x, y, color) {
    const particles = 16;
    const container = spawnContainer;

    for (let i = 0; i < particles; i++) {
        const p = document.createElement("div");
        p.classList.add("particle");

        let px = x;
        let py = y;

        let vx = (Math.random() - 0.5) * 12;
        let vy = (Math.random() - 0.5) * 12;

        let life = 1;

        p.style.left = px + "px";
        p.style.top = py + "px";
        p.style.background = color;

        container.appendChild(p);

        const animate = () => {
            px += vx;
            py += vy;

            vx *= 0.92;
            vy *= 0.92;

            life -= 0.025;

            p.style.left = px + "px";
            p.style.top = py + "px";
            p.style.opacity = life;

            if (life > 0) {
                requestAnimationFrame(animate);
            } else {
                p.remove();
            }
        };

        requestAnimationFrame(animate);
    }
}


spawnContainer.addEventListener("contextmenu", (e) => {
    if (!e.target.classList.contains("shape")) return;

    e.preventDefault();

    const shape = e.target;

    const rect = shape.getBoundingClientRect();
    const containerRect = spawnContainer.getBoundingClientRect();

    const x = rect.left - containerRect.left + rect.width / 2;
    const y = rect.top - containerRect.top + rect.height / 2;

    const color = window.getComputedStyle(shape).backgroundColor;

    shape.remove();
    shapes = document.querySelectorAll(".shape");

    explode(x, y, color);
});

let lastTapTime = 0;

spawnContainer.addEventListener("click", (e) => {
    if (!e.target.classList.contains("shape")) return;

    const now = Date.now();
    const delta = now - lastTapTime;

    if (delta < 250) {
        const shape = e.target;

        const rect = shape.getBoundingClientRect();
        const containerRect = spawnContainer.getBoundingClientRect();

        const x = rect.left - containerRect.left + rect.width / 2;
        const y = rect.top - containerRect.top + rect.height / 2;

        const color = window.getComputedStyle(shape).backgroundColor;

        shape.remove();
        shapes = document.querySelectorAll(".shape");

        explode(x, y, color);
    }

    lastTapTime = now;
});

const deleteAllBtn = document.getElementById("deleteAllShapes");

deleteAllBtn.addEventListener("click", () => {
    shapes.forEach(shape => {
        // posizione assoluta della shape
        const rect = shape.getBoundingClientRect();
        const containerRect = spawnContainer.getBoundingClientRect();

        // centro della shape nel container
        const x = rect.left - containerRect.left + rect.width / 2;
        const y = rect.top - containerRect.top + rect.height / 2;

        // colore della shape
        const color = window.getComputedStyle(shape).backgroundColor;

        // esplosione immediata
        explode(x, y, color);

        // rimuovi shape
        shape.remove();
    });

    // aggiorna lista
    shapes = document.querySelectorAll(".shape");
});


// ===============================
// MOTORE FISICO AUTONOMO
// ===============================
function checkCollision(a, b) {
    const ax = parseFloat(a.dataset.x) + a.offsetWidth / 2;
    const ay = parseFloat(a.dataset.y) + a.offsetHeight / 2;

    const bx = parseFloat(b.dataset.x) + b.offsetWidth / 2;
    const by = parseFloat(b.dataset.y) + b.offsetHeight / 2;

    const dx = bx - ax;
    const dy = by - ay;

    const dist = Math.sqrt(dx*dx + dy*dy);
    const minDist = (a.offsetWidth + b.offsetWidth) / 2;

    return dist < minDist;
}
function resolveCollision(a, b) {
    let ax = parseFloat(a.dataset.x);
    let ay = parseFloat(a.dataset.y);
    let avx = parseFloat(a.dataset.vx);
    let avy = parseFloat(a.dataset.vy);

    let bx = parseFloat(b.dataset.x);
    let by = parseFloat(b.dataset.y);
    let bvx = parseFloat(b.dataset.vx);
    let bvy = parseFloat(b.dataset.vy);

    a.dataset.vx = bvx;
    a.dataset.vy = bvy;

    b.dataset.vx = avx;
    b.dataset.vy = avy;

    a.dataset.vr = (Math.random() - 0.5) * 10;
    b.dataset.vr = (Math.random() - 0.5) * 10;

    const angle = Math.atan2(by - ay, bx - ax);
    const push = 4;

    a.dataset.x = ax - Math.cos(angle) * push;
    a.dataset.y = ay - Math.sin(angle) * push;

    b.dataset.x = bx + Math.cos(angle) * push;
    b.dataset.y = by + Math.sin(angle) * push;
}

function physicsLoop() {
    const rect = spawnContainer.getBoundingClientRect();

    shapes.forEach(shape => {
        if (shape === grabbed) return;

        let x = parseFloat(shape.dataset.x);
        let y = parseFloat(shape.dataset.y);
        let vx = parseFloat(shape.dataset.vx);
        let vy = parseFloat(shape.dataset.vy);

        let rotation = parseFloat(shape.dataset.rotation);
        let vr = parseFloat(shape.dataset.vr);

        const w = shape.offsetWidth;
        const h = shape.offsetHeight;

        x += vx;
        y += vy;

        vx *= 0.96;
        vy *= 0.96;

        if (x <= 0 || x >= rect.width - w) {
            vx *= -1;
            vr *= -1;
        }

        if (y <= 0 || y >= rect.height - h) {
            vy *= -1;
            vr *= -1;
        }

        rotation += vr;

        vr *= 0.92;

        shape.dataset.x = x;
        shape.dataset.y = y;
        shape.dataset.vx = vx;
        shape.dataset.vy = vy;
        shape.dataset.rotation = rotation;
        shape.dataset.vr = vr;

        shape.style.left = x + "px";
        shape.style.top = y + "px";
        shape.style.transform = `rotate(${rotation}deg)`;
    });

    for (let i = 0; i < shapes.length; i++) {
        for (let j = i + 1; j < shapes.length; j++) {
            const a = shapes[i];
            const b = shapes[j];

            if (a === grabbed || b === grabbed) continue;

            if (checkCollision(a, b)) {
                resolveCollision(a, b);
            }
        }
    }

    requestAnimationFrame(physicsLoop);
}

physicsLoop();
