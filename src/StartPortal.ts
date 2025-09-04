import { Npc } from "./Npc";

type Props = {
  x: number;
  y: number;
  npcCount: number;
  width?: number;
  height?: number;
  speed?: number;
};

export class StartPortal {
  x: number;
  y: number;
  width: number;
  height: number;
  npcCount: number;
  spawned = 0;
  spawnInterval = 1000; // milliseconds
  lastSpawnTime = 0;
  speed: number;

  constructor({ x, y, npcCount, width = 32, height = 50, speed = 50 }: Props) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.npcCount = npcCount;
    this.speed = speed;
  }

  update(time: number, npcs: Npc[]) {
    if (this.spawned >= this.npcCount) return;

    if (time - this.lastSpawnTime >= this.spawnInterval) {
      // Spawn one NPC
      npcs.push(
        new Npc({
          x: this.x + this.width / 2,
          y: this.y + this.height / 2,
          speed: this.speed,
        }),
      );
      this.spawned++;
      this.lastSpawnTime = time;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#529b04";
    ctx.fillRect(this.x, this.y, this.width, this.height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#fff";
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  }
}
