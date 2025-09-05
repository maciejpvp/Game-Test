import { EndPortal } from "./EndPortal";
import { Levels, type Level } from "./Levels";
import { Npc } from "./Npc";
import { StartPortal } from "./StartPortal";
import { World, type Tile } from "./World";

export class Game {
  static EDITOR = true;

  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private level: Level;
  private world: World;
  private portal: EndPortal;
  private startPortal: StartPortal;

  private worldWidth = 60;
  private worldHeight = 40;
  private tileSize = 32;

  private isMouseDown = false;

  private npcs: Npc[] = [];
  private lastTime = 0;

  // Camera
  private cameraX = -5;
  private cameraY = 350;
  private cameraZoom = 1;

  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private cameraStartX = 0;
  private cameraStartY = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.level = Levels["First"];

    //Setup Camera
    this.cameraX = this.level.cameraStartPos[0];
    this.cameraY = this.level.cameraStartPos[1];
    this.cameraZoom = this.level.cameraStartZoom;

    this.resize();

    this.world = new World({
      width: this.worldWidth,
      height: this.worldHeight,
      tileSize: this.tileSize,
      blocks: this.level.blocks,
    });
    this.portal = new EndPortal(
      this.level.endPortalCords[0],
      this.level.endPortalCords[1],
      50,
      80,
    );
    this.startPortal = new StartPortal({
      x: this.level.npcSpawnpoint[0],
      y: this.level.npcSpawnpoint[1],
      npcCount: 10,
    });

    window.addEventListener("resize", () => this.resize());
    this.canvas.addEventListener("click", this.handleClick);

    if (Game.EDITOR) {
      this.setupEditorControls();
    }

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
    //Disable Drag if editing
    if (Game.EDITOR && e.altKey) return;

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
        console.log(`Called on click on: ${npc.x}`);
        npc.onClick();
        break;
      }
    }
  };

  private setupEditorControls() {
    this.canvas.addEventListener("mousedown", (e) => {
      this.isMouseDown = true;
      this.handleEditorAction(e);
    });

    this.canvas.addEventListener("mouseup", () => {
      this.isMouseDown = false;
    });

    this.canvas.addEventListener("mouseleave", () => {
      this.isMouseDown = false;
    });

    this.canvas.addEventListener("mousemove", (e) => {
      if (this.isMouseDown) {
        this.handleEditorAction(e);
      }
    });
  }

  private handleEditorAction(e: MouseEvent) {
    if (!e.altKey) return;
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / this.cameraZoom + this.cameraX;
    const mouseY = (e.clientY - rect.top) / this.cameraZoom + this.cameraY;

    for (const npc of this.npcs) {
      if (npc.containsPoint(mouseX, mouseY)) {
        npc.onClick();
        return; // stop painting if clicked NPC
      }
    }

    const blockType: Tile = e.shiftKey ? "empty" : e.ctrlKey ? "stone" : "dirt";

    this.world.handleEditorClick(mouseX, mouseY, blockType);
  }

  private resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private update(dt: number) {
    const now = performance.now();

    this.startPortal.update(now, this.npcs);

    for (const npc of this.npcs) {
      npc.update(dt, this.world, this.portal);
    }

    // Game ends if all NPCs survived
    if (this.npcs.length !== 0 && this.npcs.every((npc) => npc.survived)) {
      alert("All NPCs survived! Game Over 🎉");
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
    this.portal.draw(ctx);
    this.startPortal.draw(ctx);

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
