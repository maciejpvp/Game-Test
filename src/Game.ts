import { Npc } from "./Npc";
import { World } from "./World";

export class Game {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  world: World;

  private worldWidth = 60;
  private worldHeight = 40;
  private tileSize = 32;

  private npcs: Npc[] = [];
  private lastTime = 0;

  // Camera
  private cameraX = 0;
  private cameraY = 0;
  private cameraZoom = 1;

  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private cameraStartX = 0;
  private cameraStartY = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.resize();

    this.world = new World(this.worldWidth, this.worldHeight, this.tileSize);

    this.npcs.push(
      ...[...Array(10)].map((_, index) => {
        return new Npc({ x: 100 + 50 * index, y: 100 });
      }),
    );

    window.addEventListener("resize", () => this.resize());
    this.canvas.addEventListener("click", this.handleClick);

    // Dragging
    this.canvas.addEventListener("mousedown", (e) => this.startDrag(e));
    this.canvas.addEventListener("mousemove", (e) => this.drag(e));
    this.canvas.addEventListener("mouseup", () => (this.isDragging = false));
    this.canvas.addEventListener("mouseleave", () => (this.isDragging = false));
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        this.lastTime = performance.now();
      }
    });

    // Zooming
    this.canvas.addEventListener("wheel", (e) => this.zoom(e));

    requestAnimationFrame(this.loop);
  }

  private startDrag(e: MouseEvent) {
    this.isDragging = true;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    this.cameraStartX = this.cameraX;
    this.cameraStartY = this.cameraY;
  }

  private drag(e: MouseEvent) {
    if (!this.isDragging) return;
    const dx = (e.clientX - this.dragStartX) / this.cameraZoom;
    const dy = (e.clientY - this.dragStartY) / this.cameraZoom;
    this.cameraX = this.cameraStartX - dx;
    this.cameraY = this.cameraStartY - dy;
  }

  private zoom(e: WheelEvent) {
    e.preventDefault();
    const zoomFactor = 1.1;
    const oldZoom = this.cameraZoom;
    if (e.deltaY < 0) {
      this.cameraZoom *= zoomFactor;
    } else {
      this.cameraZoom /= zoomFactor;
    }
    // Adjust camera to zoom towards mouse pointer
    const rect = this.canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / oldZoom + this.cameraX;
    const my = (e.clientY - rect.top) / oldZoom + this.cameraY;
    this.cameraX = mx - (e.clientX - rect.left) / this.cameraZoom;
    this.cameraY = my - (e.clientY - rect.top) / this.cameraZoom;
  }

  private handleClick = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / this.cameraZoom + this.cameraX;
    const mouseY = (e.clientY - rect.top) / this.cameraZoom + this.cameraY;

    for (const npc of this.npcs) {
      if (npc.containsPoint(mouseX, mouseY)) {
        npc.onClick(this.world);
      }
    }
    // Left click
    if (e.shiftKey) {
      // Shift + left click = remove block
      this.world.handleEditorClick(mouseX, mouseY, false);
    } else {
      // Left click = add block
      this.world.handleEditorClick(mouseX, mouseY, true);
    }
  };

  private resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private update(dt: number) {
    for (const npc of this.npcs) {
      npc.update(dt, this.world);
    }
  }

  private draw() {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.scale(this.cameraZoom, this.cameraZoom);
    ctx.translate(-this.cameraX, -this.cameraY);

    // Background
    ctx.fillStyle = "#222";
    ctx.fillRect(
      0,
      0,
      this.worldWidth * this.tileSize,
      this.worldHeight * this.tileSize,
    );

    // World
    this.world.draw(ctx);

    // NPCs
    for (const npc of this.npcs) {
      npc.draw(ctx);
    }

    ctx.restore();
  }

  private loop = (time: number) => {
    if (document.hidden) {
      requestAnimationFrame(this.loop);
      return;
    }

    const dt = (time - this.lastTime) / 1000;
    this.lastTime = time;

    this.update(dt);
    this.draw();

    requestAnimationFrame(this.loop);
  };
}
