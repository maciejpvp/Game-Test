import { World } from "./World";

type Props = {
  x: number;
  y: number;
  width?: number;
  height?: number;
  speed?: number;
};

export class Npc {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  direction: 1 | -1;
  vy: number;

  constructor({ x, y, width = 10, height = 15, speed = 50 }: Props) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.direction = 1;
    this.vy = 0;
  }

  update(dt: number, world: World) {
    // Horizontal movement
    this.x += this.speed * this.direction * dt;

    // Gravity
    this.vy += 500 * dt;
    this.y += this.vy * dt;

    // Collision handling
    this.checkCollisions(world);
  }

  private checkCollisions(world: World) {
    // Floor
    const bottomY = this.y + this.height;
    const leftX = this.x + 1;
    const rightX = this.x + this.width - 1;

    const tileBelowLeft = world.getTileAtPixel(leftX, bottomY);
    const tileBelowRight = world.getTileAtPixel(rightX, bottomY);

    if (
      (tileBelowLeft && tileBelowLeft !== "empty") ||
      (tileBelowRight && tileBelowRight !== "empty")
    ) {
      const tileY = Math.floor(bottomY / world.tileSize) * world.tileSize;
      this.y = tileY - this.height;
      this.vy = 0;
    }

    // Horizontal collision with blocks
    const topOffset = 1;
    const bottomOffset = this.height - 1;

    const tileLeftTop = world.getTileAtPixel(this.x - 1, this.y + topOffset);
    const tileLeftBottom = world.getTileAtPixel(
      this.x - 1,
      this.y + bottomOffset,
    );
    if (
      (tileLeftTop && tileLeftTop !== "empty") ||
      (tileLeftBottom && tileLeftBottom !== "empty")
    ) {
      this.direction = 1;
    }

    const tileRightTop = world.getTileAtPixel(
      this.x + this.width + 1,
      this.y + topOffset,
    );
    const tileRightBottom = world.getTileAtPixel(
      this.x + this.width + 1,
      this.y + bottomOffset,
    );
    if (
      (tileRightTop && tileRightTop !== "empty") ||
      (tileRightBottom && tileRightBottom !== "empty")
    ) {
      this.direction = -1;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  containsPoint(px: number, py: number): boolean {
    return (
      px >= this.x &&
      px <= this.x + this.width &&
      py >= this.y &&
      py <= this.y + this.height
    );
  }

  dig(world: World) {
    const targetY = this.y + this.height + 1;
    const targetBlock = world.getTileAtPixel(this.x, targetY);
    if (targetBlock === "stone") return;

    world.setTileAtPixel(this.x + this.width / 2, targetY, "empty");
  }

  onClick(world: World) {
    this.dig(world);
  }
}
