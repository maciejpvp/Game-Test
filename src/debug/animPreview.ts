const container = document.createElement("div");
container.style.display = "grid";
container.style.gridTemplateColumns = "1fr 300px";
container.style.height = "100vh";
document.body.appendChild(container);

// === LEFT: canvas with full spritesheet ===
const canvas = document.createElement("canvas");
canvas.style.width = "100%";
canvas.style.height = "100%";
container.appendChild(canvas);
const ctx = canvas.getContext("2d")!;

// === RIGHT: controls ===
const controls = document.createElement("div");
controls.style.padding = "10px";
controls.style.background = "#1e1e1e";
controls.style.color = "white";
controls.style.fontFamily = "monospace";
controls.style.overflowY = "auto";
container.appendChild(controls);

const image = new Image();
image.src = "sprite.png"; // make sure vite/webpack copies it into dist

// State
let frames: { x: number; y: number; w: number; h: number }[] = [];
let currentFrameIndex = 0;
let animationName = "walking";

image.onload = () => {
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);
  renderFrames();
};

// === UI ===
const nameInput = document.createElement("input");
nameInput.value = animationName;
nameInput.placeholder = "Animation name";
nameInput.oninput = () => (animationName = nameInput.value);
controls.appendChild(nameInput);

controls.appendChild(document.createElement("hr"));

const frameList = document.createElement("div");
controls.appendChild(frameList);

function renderFrames() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0);

  ctx.lineWidth = 0.5; // thinner lines
  frames.forEach((f, i) => {
    ctx.strokeStyle =
      i === currentFrameIndex ? "rgba(255,0,0,1)" : "rgba(0,255,0,1)";
    ctx.strokeRect(f.x, f.y, f.w, f.h);
  });

  frameList.innerHTML = "";
  frames.forEach((f, i) => {
    const item = document.createElement("div");
    item.style.marginBottom = "1px";
    item.innerHTML = `#${i} x:${f.x} y:${f.y} w:${f.w} h:${f.h}`;
    if (i === currentFrameIndex) item.style.color = "yellow";
    item.onclick = () => {
      currentFrameIndex = i;
      renderFrames();
      renderControls();
    };
    frameList.appendChild(item);
  });
}

// Add frame button (based on last frame)
const addBtn = document.createElement("button");
addBtn.textContent = "➕ Add Frame";
addBtn.onclick = () => {
  let last = frames[frames.length - 1] || { x: 0, y: 0, w: 16, h: 16 };
  frames.push({ x: last.x, y: last.y, w: last.w, h: last.h });
  currentFrameIndex = frames.length - 1;
  renderFrames();
  renderControls();
};
controls.appendChild(addBtn);

// Export button
const exportBtn = document.createElement("button");
exportBtn.textContent = "📤 Export JSON";
exportBtn.style.display = "block";
exportBtn.style.marginTop = "10px";
exportBtn.onclick = () => {
  console.log(JSON.stringify({ [animationName]: frames }, null, 2));
};
controls.appendChild(exportBtn);

controls.appendChild(document.createElement("hr"));

// === Per-frame controls ===
const frameControls = document.createElement("div");
controls.appendChild(frameControls);

function renderControls() {
  frameControls.innerHTML = "";

  if (frames.length === 0) return;

  const f = frames[currentFrameIndex];

  ["x", "y", "w", "h"].forEach((key) => {
    const label = document.createElement("label");
    label.textContent = key + ": ";
    const input = document.createElement("input");
    input.type = "number";
    input.value = String(f[key as keyof typeof f]);
    input.oninput = () => {
      f[key as keyof typeof f] = parseInt(input.value) || 0;
      renderFrames();
    };
    label.appendChild(input);
    frameControls.appendChild(label);
    frameControls.appendChild(document.createElement("br"));
  });

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "🗑 Remove Frame";
  removeBtn.onclick = () => {
    frames.splice(currentFrameIndex, 1);
    currentFrameIndex = Math.max(0, currentFrameIndex - 1);
    renderFrames();
    renderControls();
  };
  frameControls.appendChild(removeBtn);
}
