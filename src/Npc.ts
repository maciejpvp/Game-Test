import { World } from "./World";
import { EndPortal } from "./EndPortal";
import type { SelectedActionType } from "./HUD";

type Props = {
  x: number;
  y: number;
  width?: number;
  height?: number;
  speed?: number;
};

type NpcOnClickProps = {
  action: SelectedActionType;
  world: World;
};

export class Npc {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  direction: number;
  vy: number;
  survived = false;

  private health: number;
  private fallStartY: number | null;
  private readonly maxFallSafe = 32 * 3; // 3 Blocks

  state: "inAir" | "walking" | "digging" | "death" | "stopothers" = "inAir";

  private digTimer = 0;
  private readonly digDuration = 1; // seconds

  constructor({ x, y, width = 10, height = 15, speed = 50 }: Props) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.direction = 1;
    this.vy = 0;

    this.health = 100;
    this.fallStartY = null;
  }

  update(dt: number, world: World, portal: EndPortal) {
    if (this.survived || ["death", "stopothers"].includes(this.state)) return;

    this.vy += 500 * dt;
    this.y += this.vy * dt;

    if (this.state !== "digging") {
      this.x += this.speed * this.direction * dt;
    }

    this.checkCollisions(world);

    if (this.state === "digging") {
      this.digTimer += dt;
      if (this.digTimer >= this.digDuration) {
        const blockBelow = world.getTileAtPixel(
          this.x + this.width / 2,
          this.y + this.height + world.tileSize,
        );
        this.performDig(world);
        this.digTimer = 0;
        if (blockBelow === "empty" || blockBelow === "stone") {
          this.state = "inAir";
        }
      }
    }

    this.updateState(world);

    this.checkPortal(portal);
  }

  private performDig(world: World) {
    const targetY = this.y + this.height + 1;
    const targetX = this.x + this.width / 2;
    const targetBlock = world.getTileAtPixel(targetX, targetY);
    if (targetBlock === "stone") return;

    world.setTileAtPixel(targetX, targetY, "empty");
  }

  private updateState(world: World) {
    const bottomY = this.y + this.height;
    const leftX = this.x + 1;
    const rightX = this.x + this.width - 1;

    const tileBelowLeft = world.getTileAtPixel(leftX, bottomY);
    const tileBelowRight = world.getTileAtPixel(rightX, bottomY);

    const isSolid = (tile: string | undefined) => tile && tile !== "empty";

    const onGround = isSolid(tileBelowLeft) || isSolid(tileBelowRight);
    if (this.state !== "digging") {
      this.state = onGround ? "walking" : "inAir";
    }
    //Start Falling
    if (this.state === "inAir" && this.fallStartY === null) {
      this.fallStartY = this.y;
    }
    //End Falling
    if (this.state !== "inAir" && this.fallStartY !== null) {
      const distance = this.y - this.fallStartY;
      if (distance > this.maxFallSafe) {
        this.health -= distance;
      }
      this.fallStartY = null;
    }

    //Check health

    if (this.health <= 0) {
      this.state = "death";
    }
  }

  private checkCollisions(world: World) {
    const step = 1; // 1-tile step height
    const bottomY = this.y + this.height;
    const topOffset = 1;
    const bottomOffset = this.height - 1;
    const dir = this.direction;

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

    const frontX = dir === 1 ? this.x + this.width + 1 : this.x - 1;
    const tileFrontTop = world.getTileAtPixel(frontX, this.y + topOffset);
    const tileFrontBottom = world.getTileAtPixel(frontX, this.y + bottomOffset);

    if (
      (tileFrontTop && tileFrontTop !== "empty") ||
      (tileFrontBottom && tileFrontBottom !== "empty")
    ) {
      let canStep = true;
      if (tileFrontTop === "invisible") {
        canStep = false;
      } else {
        for (let i = 1; i <= step; i++) {
          const tileAboveBottom = world.getTileAtPixel(
            frontX,
            this.y + bottomOffset - i * world.tileSize,
          );
          if (!tileAboveBottom || tileAboveBottom !== "empty") {
            canStep = false;
            break;
          }
        }
      }
      if (canStep) {
        this.y -= step * world.tileSize;
      } else {
        this.direction = -dir; // bounce off
      }
    }
  }

  private checkPortal(portal: EndPortal) {
    if (
      this.x < portal.x + portal.width &&
      this.x + this.width > portal.x &&
      this.y < portal.y + portal.height &&
      this.y + this.height > portal.y
    ) {
      this.survived = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.survived) ctx.fillStyle = "green";
    else if (this.state === "digging") ctx.fillStyle = "orange";
    else if (this.state === "inAir") ctx.fillStyle = "blue";
    else if (this.state === "death") ctx.fillStyle = "black";
    else ctx.fillStyle = "red"; // walking

    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  containsPoint(px: number, py: number): boolean {
    const clickPadding = 20;
    return (
      Math.abs(px - (this.x + this.width / 2)) <=
        this.width / 2 + clickPadding &&
      Math.abs(py - (this.y + this.height / 2)) <=
        this.height / 2 + clickPadding
    );
  }

  centerNpcOnBlock(world: World) {
    const currentBlockX = Math.floor(this.x / world.tileSize);
    this.x = currentBlockX * world.tileSize + (world.tileSize - this.width) / 2;

    // Also snap Y so feet align with block grid
    const currentBlockY = Math.floor((this.y + this.height) / world.tileSize);
    this.y = currentBlockY * world.tileSize - this.height;
  }

  dig(world: World) {
    if (this.state === "digging") return;

    this.state = "digging";
    this.digTimer = 0;
    this.centerNpcOnBlock(world);
  }

  stopOthers(world: World) {
    if (this.state === "stopothers") return;

    this.state = "stopothers";
    world.setTileAtPixel(this.x, this.y, "invisible");
    this.centerNpcOnBlock(world);
  }

  onClick({ action, world }: NpcOnClickProps) {
    //You can only invoke action on npc thats walking
    if (this.state !== "walking") return;
    if (action === "dig") this.dig(world);
    if (action === "stopothers") this.stopOthers(world);
  }
}
