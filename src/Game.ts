import { Npc } from "./Npc";
import { World } from "./World";

export class Game {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  world: World;

  private worldWidth = 25;
  private worldHeight = 18;
  private tileSize = 32;

  private npcs: Npc[] = [];
  private lastTime = 0;

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

    requestAnimationFrame(this.loop);
  }

  private handleClick = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Convert to world coords
    const scaleX = this.canvas.width / (this.worldWidth * this.tileSize);
    const scaleY = this.canvas.height / (this.worldHeight * this.tileSize);
    const worldX = mouseX / scaleX;
    const worldY = mouseY / scaleY;

    // Check NPCs
    for (const npc of this.npcs) {
      if (npc.containsPoint(worldX, worldY)) {
        npc.onClick(this.world);
      }
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

    const scaleX = canvas.width / (this.worldWidth * this.tileSize);
    const scaleY = canvas.height / (this.worldHeight * this.tileSize);
    ctx.save();
    ctx.scale(scaleX, scaleY);

    ctx.fillStyle = "#222";
    ctx.fillRect(
      0,
      0,
      this.worldWidth * this.tileSize,
      this.worldHeight * this.tileSize,
    );

    this.world.draw(ctx);

    for (const npc of this.npcs) {
      npc.draw(ctx);
    }

    ctx.restore();
  }

  private loop = (time: number) => {
    const dt = (time - this.lastTime) / 1000;
    this.lastTime = time;

    this.update(dt);
    this.draw();

    requestAnimationFrame(this.loop);
  };
}
